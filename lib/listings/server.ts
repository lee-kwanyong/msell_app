import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { supabaseServer } from "@/lib/supabase/server";

export type BoardType = "sell" | "buy";

type BoardFilters = {
  q?: string;
  platform?: string;
  min?: number;
  max?: number;
};

type PostRow = {
  id: string;
  user_id: string | null;
  post_type: "sell" | "buy" | string | null;
  title: string | null;
  description: string | null;
  platform: string | null;
  asking_price_krw: number | null;
  status: string | null;
  created_at: string | null;
};

type ListingRow = {
  id: string;
  owner_id: string | null;
  asset_ref: string | null;
  title: string | null;
  description: string | null;
  platform: string | null;
  platform_key: string | null;
  asset_type: string | null;
  transfer_method: string | null;
  country: string | null;
  listing_locale: string | null;
  status: string | null;
  review_status: string | null;
  allow_offers: boolean | null;
  guidance_min_krw: number | null;
  guidance_max_krw: number | null;
  created_at?: string | null;
};

type DealThreadRow = {
  id: string;
  listing_id: string;
  seller_id: string | null;
  buyer_id: string | null;
  status: string | null;
  created_at: string | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string | null;
  created_at: string | null;
};

export type BoardPostItem = PostRow;

export type ListingDetail = ListingRow & {
  post_type: string | null;
  asking_price_krw: number | null;
};

export type MyThreadItem = {
  id: string;
  listing_id: string;
  seller_id: string | null;
  buyer_id: string | null;
  status: string | null;
  created_at: string | null;
  listing: {
    id: string;
    owner_id: string | null;
    title: string | null;
    description: string | null;
    platform: string | null;
    status: string | null;
    review_status: string | null;
    guidance_min_krw: number | null;
    guidance_max_krw: number | null;
    post_type: string | null;
    asking_price_krw: number | null;
  } | null;
};

function normalizeKeyword(value?: string) {
  return value?.trim() ?? "";
}

function normalizePlatform(value?: string) {
  const v = value?.trim();
  if (!v || v === "all") return "";
  return v;
}

function toSafeMin(value?: number) {
  return Number.isFinite(value) ? Number(value) : null;
}

function toSafeMax(value?: number) {
  return Number.isFinite(value) ? Number(value) : null;
}

async function getPostsByIds(postIds: string[]) {
  if (postIds.length === 0) return new Map<string, PostRow>();

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id,user_id,post_type,title,description,platform,asking_price_krw,status,created_at"
    )
    .in("id", postIds);

  if (error) throw error;

  return new Map<string, PostRow>(
    ((data ?? []) as PostRow[]).map((row) => [row.id, row])
  );
}

export async function listBoardPosts(
  type: BoardType,
  filters: BoardFilters = {}
): Promise<BoardPostItem[]> {
  const supabase = await supabaseServer();

  const keyword = normalizeKeyword(filters.q);
  const platform = normalizePlatform(filters.platform);
  const min = toSafeMin(filters.min);
  const max = toSafeMax(filters.max);

  let query = supabase
    .from("posts")
    .select(
      "id,user_id,post_type,title,description,platform,asking_price_krw,status,created_at"
    )
    .eq("post_type", type)
    .in("status", ["active", "in_deal"])
    .order("created_at", { ascending: false });

  if (keyword) {
    query = query.or(
      `title.ilike.%${keyword}%,description.ilike.%${keyword}%,platform.ilike.%${keyword}%`
    );
  }

  if (platform) {
    query = query.eq("platform", platform);
  }

  if (min !== null) {
    query = query.gte("asking_price_krw", min);
  }

  if (max !== null) {
    query = query.lte("asking_price_krw", max);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as BoardPostItem[];
}

export async function getListing(id: string): Promise<ListingDetail> {
  const supabase = await supabaseServer();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select(
      "id,owner_id,asset_ref,title,description,platform,platform_key,asset_type,transfer_method,country,listing_locale,status,review_status,allow_offers,guidance_min_krw,guidance_max_krw,created_at"
    )
    .eq("id", id)
    .single();

  if (listingError) throw listingError;

  let postType: string | null = null;
  let askingPriceKrw: number | null = null;

  if (listing.asset_ref) {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id,post_type,asking_price_krw")
      .eq("id", listing.asset_ref)
      .maybeSingle();

    if (postError) throw postError;

    postType = post?.post_type ?? null;
    askingPriceKrw = post?.asking_price_krw ?? null;
  }

  return {
    ...(listing as ListingRow),
    post_type: postType,
    asking_price_krw: askingPriceKrw,
  };
}

export async function createOrGetThread(listingId: string) {
  const user = await getUser();
  if (!user) {
    redirect(`/auth/login?next=/listings/${listingId}`);
  }

  const supabase = await supabaseServer();
  const listing = await getListing(listingId);

  const buyerId = user.id;
  const sellerId = listing.owner_id;

  if (!sellerId) {
    throw new Error("Listing owner_id is missing.");
  }

  if (buyerId === sellerId) {
    throw new Error("본인 글에는 문의할 수 없습니다.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("deal_threads")
    .select("id,listing_id,seller_id,buyer_id,status,created_at")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("deal_threads")
    .insert({
      listing_id: listingId,
      seller_id: sellerId,
      buyer_id: buyerId,
      status: "open",
    })
    .select("id,listing_id,seller_id,buyer_id,status,created_at")
    .single();

  if (error) throw error;

  return data;
}

export async function listMyThreads(): Promise<MyThreadItem[]> {
  const user = await getUser();
  if (!user) {
    redirect("/auth/login?next=/inbox");
  }

  const supabase = await supabaseServer();

  const { data: threads, error: threadError } = await supabase
    .from("deal_threads")
    .select("id,listing_id,seller_id,buyer_id,status,created_at")
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (threadError) throw threadError;

  const typedThreads = (threads ?? []) as DealThreadRow[];
  const listingIds = Array.from(
    new Set(typedThreads.map((t) => t.listing_id).filter(Boolean))
  );

  let listingMap = new Map<string, ListingRow>();
  if (listingIds.length > 0) {
    const { data: listings, error: listingError } = await supabase
      .from("listings")
      .select(
        "id,owner_id,asset_ref,title,description,platform,platform_key,asset_type,transfer_method,country,listing_locale,status,review_status,allow_offers,guidance_min_krw,guidance_max_krw,created_at"
      )
      .in("id", listingIds);

    if (listingError) throw listingError;

    listingMap = new Map<string, ListingRow>(
      ((listings ?? []) as ListingRow[]).map((row) => [row.id, row])
    );
  }

  const postIds = Array.from(
    new Set(
      Array.from(listingMap.values())
        .map((listing) => listing.asset_ref)
        .filter((v): v is string => Boolean(v))
    )
  );

  const postMap = await getPostsByIds(postIds);

  return typedThreads.map((thread) => {
    const listing = listingMap.get(thread.listing_id) ?? null;
    const post =
      listing?.asset_ref ? postMap.get(listing.asset_ref) ?? null : null;

    return {
      id: thread.id,
      listing_id: thread.listing_id,
      seller_id: thread.seller_id,
      buyer_id: thread.buyer_id,
      status: thread.status,
      created_at: thread.created_at,
      listing: listing
        ? {
            id: listing.id,
            owner_id: listing.owner_id,
            title: listing.title,
            description: listing.description,
            platform: listing.platform,
            status: listing.status,
            review_status: listing.review_status,
            guidance_min_krw: listing.guidance_min_krw,
            guidance_max_krw: listing.guidance_max_krw,
            post_type: post?.post_type ?? null,
            asking_price_krw: post?.asking_price_krw ?? null,
          }
        : null,
    };
  });
}

export async function listMessages(threadId: string): Promise<MessageRow[]> {
  const user = await getUser();
  if (!user) {
    redirect(`/auth/login?next=/deal/${threadId}`);
  }

  const supabase = await supabaseServer();

  const { data: thread, error: threadError } = await supabase
    .from("deal_threads")
    .select("id,seller_id,buyer_id")
    .eq("id", threadId)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) {
    throw new Error("존재하지 않는 거래방입니다.");
  }

  if (thread.seller_id !== user.id && thread.buyer_id !== user.id) {
    throw new Error("이 거래방에 접근할 수 없습니다.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id,thread_id,sender_id,body,created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []) as MessageRow[];
}