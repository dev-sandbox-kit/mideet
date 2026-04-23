import { NextResponse } from 'next/server'

const ALLOWED_HOSTNAME = 'dapi.kakao.com'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mapUrl = searchParams.get('url')
  if (!mapUrl) return NextResponse.json({ error: 'url required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(mapUrl)
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (parsed.hostname !== ALLOWED_HOSTNAME) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  const res = await fetch(mapUrl, {
    headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
  })

  if (!res.ok) {
    return NextResponse.json({ error: `Kakao API error: ${res.status}` }, { status: res.status })
  }

  const buffer = await res.arrayBuffer()
  return new Response(buffer, {
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'image/png' },
  })
}
