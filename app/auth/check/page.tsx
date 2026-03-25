"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: string | null;
  is_banned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export default function AuthCheckPage() {
  const [loading, setLoading] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
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
      setSessionEmail(null);
      setSessionUserId(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setSessionEmail(user.email ?? null);
    setSessionUserId(user.id);

    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, role, is_banned, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfile((profileRow as ProfileRow | null) ?? null);
    setLoading(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
      return;
    }
    await load();
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

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-gray-600 hover:underline">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">Auth Check</h1>
          <p className="mt-1 text-sm text-gray-600">
            현재 로그인 상태와 profiles 연결 상태를 확인하는 페이지
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border p-4">
        <div className="mb-3 text-sm font-medium">Session Status</div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : sessionUserId ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">로그인 상태:</span> Logged in
            </div>
            <div>
              <span className="font-medium">Email:</span> {sessionEmail ?? "-"}
            </div>
            <div className="break-all">
              <span className="font-medium">User ID:</span> {sessionUserId}
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium">로그인 상태:</span> Not logged in
            </div>
            <Link
              href="/auth/login?next=/auth/check"
              className="inline-block rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Login Page
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4">
        <div className="mb-3 text-sm font-medium">Profile Row Status</div>

        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : !sessionUserId ? (
          <div className="text-sm text-gray-600">
            로그인해야 profile row를 확인할 수 있음
          </div>
        ) : profile ? (
          <div className="space-y-2 text-sm">
            <div className="font-medium text-green-700">profiles row 연결됨</div>
            <div className="break-all">
              <span className="font-medium">id:</span> {profile.id}
            </div>
            <div>
              <span className="font-medium">username:</span>{" "}
              {profile.username ?? "NULL"}
            </div>
            <div>
              <span className="font-medium">role:</span> {profile.role ?? "NULL"}
            </div>
            <div>
              <span className="font-medium">is_banned:</span>{" "}
              {String(profile.is_banned)}
            </div>
            <div>
              <span className="font-medium">created_at:</span>{" "}
              {profile.created_at ?? "-"}
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-700">
            로그인 유저는 있지만 profiles row를 찾지 못함
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-4 text-sm text-gray-700">
        <div className="font-medium">판단 기준</div>
        <div className="mt-2 space-y-1">
          <div>Logged in 이 보이면 세션 정상</div>
          <div>profiles row 연결됨 이 보이면 trigger 포함 전체 정상</div>
        </div>
      </div>
    </div>
  );
}