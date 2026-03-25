import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

type DealThreadRow = {
  id: string;
  listing_id: string;
  seller_id: string | null;
  buyer_id: string | null;
  status: string | null;
};

export async function requireDealMember(threadId: string) {
  const supabase = await supabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/auth/login?next=/deal/${threadId}`);
  }

  const { data: thread, error: threadError } = await supabase
    .from("deal_threads")
    .select("id,listing_id,seller_id,buyer_id,status")
    .eq("id", threadId)
    .maybeSingle();

  if (threadError) {
    throw threadError;
  }

  if (!thread) {
    redirect("/inbox");
  }

  const typedThread = thread as DealThreadRow;
  const isMember =
    typedThread.seller_id === user.id || typedThread.buyer_id === user.id;

  if (!isMember) {
    redirect("/inbox");
  }

  return {
    user,
    thread: typedThread,
  };
}