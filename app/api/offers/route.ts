import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    const token = getToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const supabase = getUserClient(token);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "").trim();

    if (action === "create") {
      const listing_id = String(body.listing_id ?? "").trim();
      const price_krw = Number(body.price_krw);
      const structure =
        body.structure == null ? null : String(body.structure);
      const terms =
        body.terms && typeof body.terms === "object" ? body.terms : {};

      if (!listing_id || !Number.isFinite(price_krw) || price_krw <= 0) {
        return NextResponse.json(
          { error: "listing_id and valid price_krw required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc("create_offer", {
        p_listing_id: listing_id,
        p_price_krw: price_krw,
        p_structure: structure,
        p_terms: terms,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data });
    }

    if (action === "accept") {
      const offer_id = String(body.offer_id ?? "").trim();

      if (!offer_id) {
        return NextResponse.json({ error: "offer_id required" }, { status: 400 });
      }

      const { data, error } = await supabase.rpc("accept_offer", {
        p_offer_id: offer_id,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data });
    }

    if (action === "reject") {
      const offer_id = String(body.offer_id ?? "").trim();

      if (!offer_id) {
        return NextResponse.json({ error: "offer_id required" }, { status: 400 });
      }

      const { error } = await supabase.rpc("reject_offer", {
        p_offer_id: offer_id,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: { ok: true } });
    }

    if (action === "counter") {
      const offer_id = String(body.offer_id ?? "").trim();
      const new_price_krw = Number(body.new_price_krw);
      const structure =
        body.structure == null ? null : String(body.structure);
      const terms =
        body.terms && typeof body.terms === "object" ? body.terms : {};

      if (!offer_id || !Number.isFinite(new_price_krw) || new_price_krw <= 0) {
        return NextResponse.json(
          { error: "offer_id and valid new_price_krw required" },
          { status: 400 }
        );
      }

      const { data, error } = await supabase.rpc("counter_offer", {
        p_offer_id: offer_id,
        p_new_price_krw: new_price_krw,
        p_structure: structure,
        p_terms: terms,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data });
    }

    if (action === "withdraw") {
      const offer_id = String(body.offer_id ?? "").trim();

      if (!offer_id) {
        return NextResponse.json({ error: "offer_id required" }, { status: 400 });
      }

      const { error } = await supabase.rpc("withdraw_offer", {
        p_offer_id: offer_id,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data: { ok: true } });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}