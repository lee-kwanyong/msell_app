import { createClient } from "@supabase/supabase-js";

export type PublishedListing = {
  id: string;
  post_id: string | null;
  user_id: string | null;
  type: string | null;
  asset: string | null;
  price: number | null;
  quantity: number | null;
  status: string | null;
  created_at: string | null;
  posts:
    | {
        id: string;
        title: string | null;
        content: string | null;
        created_at: string | null;
      }
    | {
        id: string;
        title: string | null;
        content: string | null;
        created_at: string | null;
      }[]
    | null;
};

type GetPublishedListingsParams = {
  q?: string;
};

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
  }

  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getPublishedListings(
  params: GetPublishedListingsParams = {}
): Promise<PublishedListing[]> {
  const supabase = getSupabaseServerClient();
  const q = params.q?.trim() ?? "";

  let query = supabase
    .from("listings")
    .select(
      `
        id,
        post_id,
        user_id,
        type,
        asset,
        price,
        quantity,
        status,
        created_at,
        posts (
          id,
          title,
          content,
          created_at
        )
      `
    )
    .in("status", ["open", "chatting"])
    .order("created_at", { ascending: false });

  if (q) {
    const safeQ = q.replace(/[%_,]/g, " ").trim();

    if (safeQ) {
      query = query.or(
        [
          `type.ilike.%${safeQ}%`,
          `asset.ilike.%${safeQ}%`,
          `posts.title.ilike.%${safeQ}%`,
          `posts.content.ilike.%${safeQ}%`,
        ].join(",")
      );
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getPublishedListings] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      raw: error,
    });
    return [];
  }

  return (data ?? []) as PublishedListing[];
}