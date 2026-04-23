import { NextResponse } from 'next/server'
import { searchPlacesByCategory, searchPlacesByKeyword } from '@/lib/kakao/local'

const CATEGORY_MAP: Record<string, string> = {
  카페: 'CE7',
  식당: 'FD6',
  문화시설: 'CT1',
  쇼핑: 'MT1',
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')
  const category = searchParams.get('category') ?? '카페'
  const radius = parseInt(searchParams.get('radius') ?? '1000')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat, lng required' }, { status: 400 })
  }

  try {
    let places
    if (category === '술집') {
      places = await searchPlacesByKeyword('주점', lat, lng, radius)
    } else {
      const code = CATEGORY_MAP[category]
      if (!code) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
      places = await searchPlacesByCategory(lat, lng, code, radius)
    }
    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
