import { NextResponse } from 'next/server'
import { searchPlacesByCategory, searchPlacesByKeyword } from '@/lib/kakao/local'
import { KAKAO_CATEGORY_CODE, KAKAO_BAR_KEYWORD, PLACES_DEFAULT_RADIUS_M } from '@/lib/constants'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const category = searchParams.get('category') ?? '카페'
  const radius = parseInt(searchParams.get('radius') ?? String(PLACES_DEFAULT_RADIUS_M))

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat, lng required' }, { status: 400 })
  }

  try {
    let places
    if (category === '술집') {
      places = await searchPlacesByKeyword(KAKAO_BAR_KEYWORD, lat, lng, radius)
    } else {
      const code = KAKAO_CATEGORY_CODE[category as keyof typeof KAKAO_CATEGORY_CODE]
      if (!code) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      places = await searchPlacesByCategory(lat, lng, code, radius)
    }
    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
