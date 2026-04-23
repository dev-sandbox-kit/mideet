import type { Participant, KakaoPlace } from '@/types'

export interface StationResult {
  station: KakaoPlace
  total_seconds: number
  travel_times: number[]
}

export function calcGeographicCenter(participants: Participant[]): { lat: number; lng: number } {
  const lat = participants.reduce((sum, p) => sum + p.lat, 0) / participants.length
  const lng = participants.reduce((sum, p) => sum + p.lng, 0) / participants.length
  return { lat, lng }
}

export function selectOptimalStation(
  stations: KakaoPlace[],
  travelTimes: Record<string, number[]>
): StationResult | null {
  const candidates = stations
    .filter((s) => travelTimes[s.id]?.length > 0)
    .map((s) => ({
      station: s,
      travel_times: travelTimes[s.id],
      total_seconds: travelTimes[s.id].reduce((a, b) => a + b, 0),
    }))

  if (candidates.length === 0) return null

  return candidates.reduce((best, cur) => (cur.total_seconds < best.total_seconds ? cur : best))
}
