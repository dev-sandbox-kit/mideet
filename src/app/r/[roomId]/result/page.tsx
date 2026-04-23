'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import posthog from 'posthog-js'
import KakaoMap from '@/components/KakaoMap'
import CategoryFilter from '@/components/CategoryFilter'
import PlaceList from '@/components/PlaceList'
import ImageDownload from '@/components/ImageDownload'
import type { Room, Participant, KakaoPlace, PlaceCategory } from '@/types'

export default function ResultPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [station, setStation] = useState<KakaoPlace | null>(null)
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

      if (data.midpoint_station_id && data.midpoint_station_name) {
        setStation({
          id: data.midpoint_station_id,
          place_name: data.midpoint_station_name,
          category_name: '지하철역',
          address_name: '',
          road_address_name: '',
          x: String(data.midpoint_lng),
          y: String(data.midpoint_lat),
          place_url: '',
        })
      }
    }
    load()
  }, [roomId])

  useEffect(() => {
    if (!room?.midpoint_lat || !room?.midpoint_lng) return
    setPlacesLoading(true)
    fetch(`/api/places?lat=${room.midpoint_lat}&lng=${room.midpoint_lng}&category=${encodeURIComponent(category)}&radius=1000`)
      .then((r) => r.json())
      .then((data) => setPlaces(data.places ?? []))
      .finally(() => setPlacesLoading(false))
  }, [room, category])

  if (!room) return <div className="p-6 text-center text-gray-400">불러오는 중...</div>

  const center = room.midpoint_lat && room.midpoint_lng
    ? { lat: room.midpoint_lat, lng: room.midpoint_lng }
    : null

  if (!center) return <div className="p-6 text-center text-gray-400">결과를 계산하는 중...</div>

  return (
    <main className="min-h-screen p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-1">중간지점 결과</h1>
      {room.appointment_date && (
        <p className="text-sm text-gray-500 mb-3">
          약속 날짜: {new Date(room.appointment_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
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
