'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import posthog from 'posthog-js'
import { createClient } from '@/lib/supabase/client'
import AddressSearch from '@/components/AddressSearch'
import ParticipantList from '@/components/ParticipantList'
import type { Room, Participant, KakaoPlace } from '@/types'

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null)
  const [nickname, setNickname] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const calculatingRef = useRef(false)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchRoom = useCallback(async () => {
    const res = await fetch(`/api/rooms/${roomId}`)
    if (!res.ok) return
    const data = await res.json()
    setRoom(data)
    setParticipants(data.participants ?? [])
    if (data.status === 'done') router.push(`/r/${roomId}/result`)
  }, [roomId, router])

  useEffect(() => { fetchRoom() }, [fetchRoom])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setParticipants((prev) => [...prev, payload.new as Participant])
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as { status: string }
          if (updated.status === 'calculating') setCalculating(true)
          if (updated.status === 'done') router.push(`/r/${roomId}/result`)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, router])

  const triggerMidpoint = useCallback(async () => {
    if (calculatingRef.current) return
    calculatingRef.current = true
    setCalculating(true)
    const res = await fetch(`/api/rooms/${roomId}/midpoint`, { method: 'POST' })
    if (res.ok) {
      router.push(`/r/${roomId}/result`)
    } else if (res.status === 409) {
      const data = await res.json()
      if (data.error === 'Already calculated') {
        router.push(`/r/${roomId}/result`)
      }
      // 'Already calculating' — 실시간 구독으로 done 이벤트 대기
    } else {
      calculatingRef.current = false
      setCalculating(false)
      const data = await res.json().catch(() => ({}))
      const msg = data?.error ?? ''
      if (msg.includes('limit') || msg.includes('exceeded')) {
        setCalcError('Kakao API 요청이 일시적으로 제한됐어요. 잠시 후 다시 시도해주세요.')
      } else {
        setCalcError('중간지점 계산에 실패했어요. 다시 시도해주세요.')
      }
    }
  }, [roomId, router])

  useEffect(() => {
    if (!room || participants.length < room.max_participants) return
    triggerMidpoint()
  }, [participants, room, triggerMidpoint])

  async function handleSubmit() {
    if (!selectedPlace) return
    setLoading(true)
    await fetch(`/api/rooms/${roomId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname,
        address_name: selectedPlace.address_name || selectedPlace.place_name,
        lat: parseFloat(selectedPlace.y),
        lng: parseFloat(selectedPlace.x),
      }),
    })
    posthog.capture('participant_joined', { room_id: roomId })
    setSubmitted(true)
    setLoading(false)
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canForceStart = participants.length >= 2 && !submitted

  if (!room) return <div className="p-6 text-center text-gray-400">불러오는 중...</div>

  return (
    <main className="min-h-screen p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">약속 잡기</h1>
      {room.appointment_date && (
        <p className="text-sm text-gray-500 mb-4">
          약속 날짜: {new Date(room.appointment_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}
        </p>
      )}

      <button onClick={copyLink} className="w-full border rounded-lg py-2 text-sm mb-6">
        {copied ? '링크 복사됨!' : '링크 복사하기'}
      </button>

      <div className="mb-6">
        <ParticipantList participants={participants} maxParticipants={room.max_participants} />
      </div>

      {!submitted ? (
        <div className="space-y-3">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          <AddressSearch onSelect={setSelectedPlace} />
          {selectedPlace && (
            <p className="text-xs text-green-600">선택됨: {selectedPlace.place_name || selectedPlace.address_name}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!selectedPlace || loading}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
          >
            {loading ? '등록 중...' : '입력 완료'}
          </button>
          {calcError && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{calcError}</p>
          )}
          {canForceStart && (
            <button
              onClick={() => { setCalcError(null); triggerMidpoint() }}
              disabled={calculating}
              className="w-full border border-blue-600 text-blue-600 rounded-lg py-2 text-sm disabled:opacity-50"
            >
              {calculating ? '계산 중...' : `지금 결과 보기 (${participants.length}명으로 계산)`}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p className="font-medium">위치 입력 완료!</p>
          <p className="text-sm mt-1">다른 참여자들의 입력을 기다리는 중...</p>
        </div>
      )}
    </main>
  )
}
