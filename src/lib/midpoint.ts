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

function calcVariance(times: number[]): number {
  const mean = times.reduce((a, b) => a + b, 0) / times.length
  return times.reduce((sum, t) => sum + (t - mean) ** 2, 0) / times.length
}

export function selectFastestStation(
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

// 총합이 최소 대비 1.5배 이내인 후보들 중 이동시간 분산이 가장 낮은 역 선택
export function selectFairStation(
  stations: KakaoPlace[],
  travelTimes: Record<string, number[]>,
  threshold = 1.5
): StationResult | null {
  const candidates = stations
    .filter((s) => travelTimes[s.id]?.length > 0)
    .map((s) => ({
      station: s,
      travel_times: travelTimes[s.id],
      total_seconds: travelTimes[s.id].reduce((a, b) => a + b, 0),
      variance: calcVariance(travelTimes[s.id]),
    }))

  if (candidates.length === 0) return null

  const minTotal = Math.min(...candidates.map((c) => c.total_seconds))
  const reasonable = candidates.filter((c) => c.total_seconds <= minTotal * threshold)
  return reasonable.reduce((best, cur) => (cur.variance < best.variance ? cur : best))
}
