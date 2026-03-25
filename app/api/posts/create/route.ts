import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      title,
      content,
      type,
      asset,
      price,
      quantity,
    } = body ?? {}

    if (!title || !type || !asset) {
      return NextResponse.json(
        { error: 'title, type, asset are required' },
        { status: 400 }
      )
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be buy or sell' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, any>) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch {}
          },
          remove(name: string, options: Record<string, any>) {
            try {
              cookieStore.set({ name, value: '', ...options, maxAge: 0 })
            } catch {}
          },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, is_banned')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_banned) {
      return NextResponse.json(
        { error: 'Banned user' },
        { status: 403 }
      )
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        title: String(title).trim(),
        content: content ? String(content).trim() : null,
        source: 'native',
      })
      .select()
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: postError?.message ?? 'Failed to create post' },
        { status: 500 }
      )
    }

    const normalizedPrice =
      price === '' || price === null || typeof price === 'undefined'
        ? null
        : Number(price)

    const normalizedQuantity =
      quantity === '' || quantity === null || typeof quantity === 'undefined'
        ? null
        : Number(quantity)

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert({
        post_id: post.id,
        user_id: user.id,
        type,
        asset: String(asset).trim().toUpperCase(),
        price: Number.isFinite(normalizedPrice) ? normalizedPrice : null,
        quantity: Number.isFinite(normalizedQuantity) ? normalizedQuantity : null,
        status: 'open',
      })
      .select()
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { error: listingError?.message ?? 'Post created but listing failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      post,
      listing,
      redirectTo: `/listings/${listing.id}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? 'Unexpected server error' },
      { status: 500 }
    )
  }
}