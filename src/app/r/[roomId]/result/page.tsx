'use client'
import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import posthog from 'posthog-js'
import KakaoMap from '@/components/KakaoMap'
import CategoryFilter from '@/components/CategoryFilter'
import PlaceList from '@/components/PlaceList'
import ImageDownload from '@/components/ImageDownload'
import type { Room, Participant, KakaoPlace, PlaceCategory } from '@/types'

type ResultMode = 'fastest' | 'fair'

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [mode, setMode] = useState<ResultMode>('fastest')
  const [category, setCategory] = useState<PlaceCategory>('카페')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [placesLoading, setPlacesLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/rooms/${roomId}`)
      if (!res.ok) return
      const data = await res.json()
      setRoom(data)
      posthog.capture('result_viewed', { room_id: roomId })
      setParticipants(data.participants ?? [])
    }
    load()
  }, [roomId])

  const center = useMemo(() => {
    if (!room) return null
    if (mode === 'fair' && room.midpoint_fair_lat && room.midpoint_fair_lng) {
      return { lat: room.midpoint_fair_lat, lng: room.midpoint_fair_lng }
    }
    if (room.midpoint_lat && room.midpoint_lng) {
      return { lat: room.midpoint_lat, lng: room.midpoint_lng }
    }
    return null
  }, [room, mode])

  const station = useMemo<KakaoPlace | null>(() => {
    if (!room || !center) return null
    if (mode === 'fair' && room.midpoint_fair_station_id && room.midpoint_fair_station_name) {
      return {
        id: room.midpoint_fair_station_id,
        place_name: room.midpoint_fair_station_name,
        category_name: '지하철역',
        address_name: '',
        road_address_name: '',
        x: String(center.lng),
        y: String(center.lat),
        place_url: '',
      }
    }
    if (room.midpoint_station_id && room.midpoint_station_name) {
      return {
        id: room.midpoint_station_id,
        place_name: room.midpoint_station_name,
        category_name: '지하철역',
        address_name: '',
        road_address_name: '',
        x: String(center.lng),
        y: String(center.lat),
        place_url: '',
      }
    }
    return null
  }, [room, center, mode])

  const hasFair = !!(room?.midpoint_fair_lat && room?.midpoint_fair_lng) &&
    room.midpoint_fair_station_id !== room.midpoint_station_id

  useEffect(() => {
    if (!center) return
    setPlacesLoading(true)
    fetch(`/api/places?lat=${center.lat}&lng=${center.lng}&category=${encodeURIComponent(category)}&radius=1000`)
      .then((r) => r.json())
      .then((data) => setPlaces(data.places ?? []))
      .finally(() => setPlacesLoading(false))
  }, [center?.lat, center?.lng, category])

  if (!room) return <div className="p-6 text-center text-gray-400">불러오는 중...</div>
  if (!center) return <div className="p-6 text-center text-gray-400">결과를 계산하는 중...</div>

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-1">중간지점 결과</h1>
      {room.appointment_date && (
        <p className="text-sm text-gray-500 mb-3">
          약속 날짜: {new Date(room.appointment_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      )}

      {hasFair && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('fastest')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              mode === 'fastest'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            빠른 만남
          </button>
          <button
            onClick={() => setMode('fair')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
              mode === 'fair'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            공평한 만남
          </button>
        </div>
      )}

      <div className="mb-4" id="result-map">
        <KakaoMap center={center} participants={participants} station={station} />
      </div>

      <p className="text-xs text-gray-400 mb-4">
        * 교통 상황(혼잡도, 막차 등)은 반영되지 않습니다. 참고용으로 활용하세요.
      </p>

      <ImageDownload
        center={center}
        participants={participants}
        station={station}
        places={places}
        category={category}
      />

      <div className="mt-6">
        <h2 className="text-base font-semibold mb-3">주변 장소</h2>
        <CategoryFilter active={category} onChange={setCategory} />
        <div className="mt-3">
          <PlaceList places={places} loading={placesLoading} />
        </div>
      </div>
    </main>
  )
}
