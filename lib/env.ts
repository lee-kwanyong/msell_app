export function getPublicEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

export function requirePublicEnv() {
  const { url, anon } = getPublicEnv();
  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anon };
}