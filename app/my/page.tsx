"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  is_banned: boolean | null;
  created_at: string | null;
};

export default function MyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError(userError.message);
      setLoading(false);
      return;
    }

    if (!user) {
      router.push("/auth/login?next=/my");
      return;
    }

    setUserId(user.id);
    setEmail(user.email ?? null);

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, role, is_banned, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfile(profileRow as Profile | null);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  useEffect(() => {
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="text-sm text-gray-600">Loading workspace...</div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Home
          </Link>

          <h1 className="mt-2 text-2xl font-semibold">My Workspace</h1>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-2xl border p-4 space-y-2 text-sm">
        <div>
          <span className="font-medium">Email:</span> {email ?? "-"}
        </div>

        <div className="break-all">
          <span className="font-medium">User ID:</span> {userId}
        </div>

        {profile && (
          <>
            <div>
              <span className="font-medium">Username:</span>{" "}
              {profile.username ?? "NULL"}
            </div>

            <div>
              <span className="font-medium">Role:</span>{" "}
              {profile.role ?? "user"}
            </div>

            <div>
              <span className="font-medium">Banned:</span>{" "}
              {String(profile.is_banned)}
            </div>
          </>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">My Listings</div>

          <p className="mt-2 text-sm text-gray-600">
            내가 등록한 매물 관리
          </p>

          <div className="mt-4">
            <Link
              href="/my/listings"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Open
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">My Deals</div>

          <p className="mt-2 text-sm text-gray-600">
            참여 중인 Deal Room 확인
          </p>

          <div className="mt-4">
            <Link
              href="/my/deals"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Open
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <div className="text-sm font-semibold">Inbox</div>

          <p className="mt-2 text-sm text-gray-600">
            메시지 및 협상 알림
          </p>

          <div className="mt-4">
            <Link
              href="/inbox"
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Open
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border p-5">
        <div className="text-sm font-semibold">Quick Actions</div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/listings/new"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Create Listing
          </Link>

          <Link
            href="/listings"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Browse Marketplace
          </Link>
        </div>
      </section>
    </main>
  );
}