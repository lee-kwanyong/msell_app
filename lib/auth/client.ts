

export async function signInWithEmailPassword(email: string, password: string): Promise<{
  ok: boolean;
  message?: string;
}> {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let msg = "로그인에 실패했어요.";
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    return { ok: false, message: msg };
  }

  return { ok: true };
}