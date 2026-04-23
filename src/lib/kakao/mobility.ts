interface Coord {
  lat: number
  lng: number
}

export async function getTravelDuration(origin: Coord, destination: Coord): Promise<number | null> {
  const params = new URLSearchParams({
    origin: `${origin.lng},${origin.lat}`,
    destination: `${destination.lng},${destination.lat}`,
  })
  try {
    const res = await fetch(`https://apis-navi.kakaomobility.com/v1/directions?${params}`, {
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_MOBILITY_API_KEY}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.routes?.[0]?.summary?.duration ?? null
  } catch {
    return null
  }
}
