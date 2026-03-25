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

export async function GET(req: Request) {
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

    const url = new URL(req.url);
    const thread_id = String(url.searchParams.get("thread_id") ?? "").trim();

    if (!thread_id) {
      return NextResponse.json({ error: "thread_id required" }, { status: 400 });
    }

    const [{ data: roomData, error: roomErr }, { data: offersData, error: offersErr }, { data: messagesData, error: messagesErr }] =
      await Promise.all([
        supabase.rpc("get_deal_room", { p_thread_id: thread_id }),
        supabase.rpc("get_thread_offers", { p_thread_id: thread_id }),
        supabase.rpc("get_thread_messages", { p_thread_id: thread_id }),
      ]);

    if (roomErr) {
      return NextResponse.json({ error: roomErr.message }, { status: 400 });
    }

    if (offersErr) {
      return NextResponse.json({ error: offersErr.message }, { status: 400 });
    }

    if (messagesErr) {
      return NextResponse.json({ error: messagesErr.message }, { status: 400 });
    }

    const room = Array.isArray(roomData) ? roomData[0] ?? null : null;

    if (!room) {
      return NextResponse.json(
        { error: "Thread not found or forbidden" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        room,
        offers: Array.isArray(offersData) ? offersData : [],
        messages: Array.isArray(messagesData) ? messagesData : [],
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}