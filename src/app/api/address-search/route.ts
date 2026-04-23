import { NextResponse } from 'next/server'
import { searchAddress } from '@/lib/kakao/local'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query) return NextResponse.json({ results: [] })

  try {
    const results = await searchAddress(query)
    return NextResponse.json({ results })
  } catch (e) {
    console.error('[address-search] Kakao API error:', e)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
