import type { KakaoPlace } from '@/types'

const BASE_URL = 'https://dapi.kakao.com/v2/local'

async function kakaoGet(path: string, params: Record<string, string>, retries = 3): Promise<KakaoPlace[]> {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '(unreadable)')
    if (retries > 0 && body.includes('"code":-10')) {
      const delay = (4 - retries) * 1000
      console.warn(`[kakao] rate limit, retrying in ${delay}ms (retries left: ${retries})`)
      await new Promise((r) => setTimeout(r, delay))
      return kakaoGet(path, params, retries - 1)
    }
    throw new Error(`Kakao API error: ${res.status} — ${body} — url: ${url}`)
  }
  const data = await res.json()
  return (data.documents ?? []) as KakaoPlace[]
}

export function searchAddress(query: string): Promise<KakaoPlace[]> {
  return kakaoGet('/search/keyword.json', { query, size: '10' })
}

export function searchSubwayStations(lat: number, lng: number, radius: number): Promise<KakaoPlace[]> {
  return kakaoGet('/search/category.json', {
    category_group_code: 'SW8',
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    size: '10',
  })
}

export function searchBusTerminals(lat: number, lng: number, radius: number): Promise<KakaoPlace[]> {
  return kakaoGet('/search/keyword.json', {
    query: '버스터미널',
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    size: '5',
  })
}

export function searchPlacesByCategory(
  lat: number,
  lng: number,
  categoryCode: string,
  radius: number
): Promise<KakaoPlace[]> {
  return kakaoGet('/search/category.json', {
    category_group_code: categoryCode,
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    size: '15',
  })
}

export async function searchPlacesByKeyword(
  keyword: string,
  lat: number,
  lng: number,
  radius: number
): Promise<KakaoPlace[]> {
  return kakaoGet('/search/keyword.json', {
    query: keyword,
    x: String(lng),
    y: String(lat),
    radius: String(radius),
    size: '15',
  })
}
