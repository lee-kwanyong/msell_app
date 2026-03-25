import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  const cookieNames = request.cookies
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.startsWith("sb-"));

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
    });
  }

  return response;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const cookie of cookiesToSet) {
            request.cookies.set(cookie.name, cookie.value);
          }

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          for (const cookie of cookiesToSet) {
            response.cookies.set(cookie.name, cookie.value, cookie.options);
          }
        },
      },
    }
  );

  try {
    await supabase.auth.getUser();
    return response;
  } catch (error: any) {
    const message = String(error?.message ?? "");
    const code = String(error?.code ?? "");

    const isRefreshTokenProblem =
      code === "refresh_token_already_used" ||
      message.includes("Invalid Refresh Token") ||
      message.includes("Refresh Token") ||
      message.includes("Already Used");

    if (isRefreshTokenProblem) {
      const cleaned = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });

      return clearSupabaseAuthCookies(request, cleaned);
    }

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};