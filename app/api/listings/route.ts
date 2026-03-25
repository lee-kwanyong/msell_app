import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function makePlatformKey(platform: string) {
  const raw = (platform || "").trim().toLowerCase();

  if (raw === "youtube") return "youtube";
  if (raw === "instagram") return "instagram";
  if (raw === "tiktok") return "tiktok";
  if (raw === "x" || raw === "x(twitter)" || raw === "twitter") return "x";
  if (raw === "telegram") return "telegram";
  if (raw === "discord") return "discord";
  if (raw === "newsletter") return "newsletter";
  if (raw === "website") return "website";
  if (raw === "naver blog") return "naver_blog";
  if (raw === "naver cafe") return "naver_cafe";
  if (raw === "naver smartstore") return "naver_smartstore";
  if (raw === "facebook page") return "facebook_page";
  if (raw === "kakaotalk openchat") return "kakaotalk_openchat";

  return raw.replace(/\s+/g, "_");
}

function makeAssetType(platform: string) {
  const raw = (platform || "").trim().toLowerCase();

  if (
    raw === "youtube" ||
    raw === "instagram" ||
    raw === "tiktok" ||
    raw === "x" ||
    raw === "x(twitter)" ||
    raw === "twitter" ||
    raw === "telegram" ||
    raw === "discord" ||
    raw === "newsletter" ||
    raw === "facebook page" ||
    raw === "kakaotalk openchat" ||
    raw === "naver blog" ||
    raw === "naver cafe"
  ) {
    return "account";
  }

  if (raw === "website" || raw === "naver smartstore") {
    return "website";
  }

  return "digital_asset";
}

function getToken(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  return authHeader.replace("Bearer ", "").trim();
}

function getUserClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, anon, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "").trim();

    if (action !== "ensure_from_post") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const postId = String(body.post_id ?? "").trim();

    if (!postId) {
      return NextResponse.json({ error: "post_id required" }, { status: 400 });
    }

    const { data: existingListing, error: existingErr } = await supabaseAdmin
      .from("listings")
      .select(
        "id, owner_id, asset_ref, title, description, platform, platform_key, asset_type, transfer_method, country, listing_locale, status, review_status, allow_offers, guidance_min_krw, guidance_max_krw, created_at"
      )
      .eq("asset_ref", postId)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 400 });
    }

    if (existingListing) {
      return NextResponse.json({ data: existingListing });
    }

    const { data: post, error: postErr } = await supabaseAdmin
      .from("posts")
      .select(
        "id, user_id, post_type, title, description, platform, asking_price_krw, status, created_at"
      )
      .eq("id", postId)
      .maybeSingle();

    if (postErr) {
      return NextResponse.json({ error: postErr.message }, { status: 400 });
    }

    if (!post) {
      return NextResponse.json({ error: "post_not_found" }, { status: 404 });
    }

    if (post.post_type !== "sell") {
      return NextResponse.json({ error: "only_sell_post_can_be_mapped" }, { status: 400 });
    }

    let fallbackUserId: string | null = null;
    const token = getToken(req);

    if (token) {
      const userClient = getUserClient(token);
      const {
        data: { user },
      } = await userClient.auth.getUser();

      fallbackUserId = user?.id ?? null;
    }

    const ownerId = post.user_id ?? fallbackUserId;

    if (!ownerId) {
      return NextResponse.json({ error: "post_owner_missing" }, { status: 400 });
    }

    const platform = String(post.platform ?? "Other");

    const { data: createdListing, error: createErr } = await supabaseAdmin
      .from("listings")
      .insert({
        owner_id: ownerId,
        asset_ref: post.id,
        title: post.title,
        description: post.description ?? null,
        platform,
        platform_key: makePlatformKey(platform),
        asset_type: makeAssetType(platform),
        transfer_method: "operator_transfer",
        country: "KR",
        listing_locale: "ko-KR",
        status: "active",
        review_status: "pending",
        allow_offers: true,
        guidance_min_krw: post.asking_price_krw ?? null,
        guidance_max_krw: post.asking_price_krw ?? null,
      })
      .select(
        "id, owner_id, asset_ref, title, description, platform, platform_key, asset_type, transfer_method, country, listing_locale, status, review_status, allow_offers, guidance_min_krw, guidance_max_krw, created_at"
      )
      .single();

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    return NextResponse.json({ data: createdListing });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}