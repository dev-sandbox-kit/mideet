import type { Participant, Station } from '@/types'

interface StaticMapOptions {
  center: { lat: number; lng: number }
  participants: Participant[]
  station: Station | null
  width?: number
  height?: number
  level?: number
}

export function buildStaticMapUrl({
  center,
  participants,
  station,
  width = 640,
  height = 400,
  level = 5,
}: StaticMapOptions): string {
  const base = 'https://dapi.kakao.com/v2/maps/staticmap'
  const query = `center=${center.lng},${center.lat}&level=${level}&w=${width}&h=${height}`
  const stationMarker = station
    ? `markers=color%3Ared%7Clabel%3AS%7C${station.lng}%2C${station.lat}`
    : ''
  const participantMarkers = participants
    .map((p, i) => `markers=color%3Ablue%7Clabel%3A${i + 1}%7C${p.lng}%2C${p.lat}`)
    .join('&')

  const markerSegments = [stationMarker, participantMarkers].filter(Boolean).join('&')
  return `${base}?${query}&${markerSegments}`
}
