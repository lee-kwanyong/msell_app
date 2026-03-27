import Link from 'next/link'
import { loginAction, signInWithGoogle, signInWithNaver } from './actions'

type PageProps = {
  searchParams?: Promise<{
    next?: string
    error?: string
  }>
}

function normalizeNext(next?: string) {
  if (!next) return '/'
  if (!next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = (await searchParams) || {}
  const next = normalizeNext(params.next)
  const error = params.error || ''

  return (
    <main className="min-h-screen bg-[#f6f1e7] px-4 py-10 text-[#20170f]">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-[28px] border border-[#e8dcc8] bg-white p-7 shadow-[0_20px_60px_rgba(47,36,23,0.08)]">
          <div className="mb-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#8a7357]">
              MSELL
            </p>
            <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#1f160f]">
              로그인
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#6e5c4b]">
              계정에 로그인하고 자산 등록, 거래 문의, 내 거래 관리 기능을 이용하세요.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-[#efc9c9] bg-[#fff5f5] px-4 py-3 text-[14px] text-[#9d2f2f]">
              {error}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-3">
            <input type="hidden" name="next" value={next} />

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                이메일
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#4c3a2b]">
                비밀번호
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="비밀번호 입력"
                className="h-12 w-full rounded-2xl border border-[#dbcdb7] bg-[#fffdf9] px-4 text-[15px] outline-none transition focus:border-[#8f7556]"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center rounded-2xl bg-[#2f2417] text-[15px] font-semibold text-white transition hover:bg-[#241b11]"
            >
              이메일로 로그인
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ece2d4]" />
            <span className="text-[12px] text-[#8d785f]">또는</span>
            <div className="h-px flex-1 bg-[#ece2d4]" />
          </div>

          <div className="space-y-3">
            <form
              action={async () => {
                'use server'
                await signInWithGoogle(next)
              }}
            >
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#ddd2c2] bg-white text-[15px] font-semibold text-[#20170f] transition hover:bg-[#faf6ef]"
              >
                구글로 계속하기
              </button>
            </form>

            <form
              action={async () => {
                'use server'
                await signInWithNaver(next)
              }}
            >
              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-[#ddd2c2] bg-white text-[15px] font-semibold text-[#20170f] transition hover:bg-[#faf6ef]"
              >
                네이버로 계속하기
              </button>
            </form>
          </div>

          <div className="mt-6 text-center text-[14px] text-[#6e5c4b]">
            계정이 없으면{' '}
            <Link
              href={`/auth/signup?next=${encodeURIComponent(next)}`}
              className="font-semibold text-[#2f2417] underline underline-offset-4"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}