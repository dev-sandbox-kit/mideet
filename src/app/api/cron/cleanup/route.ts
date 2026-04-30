import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { safeEqual } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!safeEqual(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { error, count } = await supabase
    .from('rooms')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: count })
}
