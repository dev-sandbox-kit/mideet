'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import posthog from 'posthog-js'
import { createClient } from '@/lib/supabase/client'
import AddressSearch from '@/components/AddressSearch'
import ParticipantList from '@/components/ParticipantList'
import EmptyRoomScene from '@/components/mascot/EmptyRoomScene'
import WaitingScene from '@/components/mascot/WaitingScene'
import MeetingAnimation from '@/components/mascot/MeetingAnimation'
import SadPinScene from '@/components/mascot/SadPinScene'
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

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setParticipants((prev) => {
            const next = payload.new as Participant
            if (prev.some((p) => p.id === next.id)) return prev
            return [...prev, next]
          })
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const updated = payload.new as { status: string }
          if (updated.status === 'calculating') setCalculating(true)
          if (updated.status === 'done') router.push(`/r/${roomId}/result`)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') fetchRoom()
      })
    return () => { supabase.removeChannel(channel) }
  }, [roomId, router, fetchRoom])

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
  const remaining = (room?.max_participants ?? 0) - participants.length
  const selfIndex = participants.length - 1
  const isAlone = participants.length === 1
  const allDone = room && participants.length >= room.max_participants

  if (!room) {
    return (
      <main className="min-h-screen flex items-center justify-center text-ink-mute text-body">
        불러오는 중...
      </main>
    )
  }

  if (calculating && allDone) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <MeetingAnimation />
        <p className="text-title text-ink mt-6">중간지점을 찾고 있어요</p>
        <p className="text-body text-ink-mute mt-2">잠시만 기다려주세요</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-6 max-w-md mx-auto">
      <header className="flex items-baseline justify-between mb-6">
        <h1 className="text-title text-ink">약속 잡기</h1>
        {room.appointment_date && (
          <span className="text-caption text-ink-mute">
            {new Date(room.appointment_date).toLocaleDateString('ko-KR', {
              month: 'long', day: 'numeric', weekday: 'short',
            })}
          </span>
        )}
      </header>

      <button
        onClick={copyLink}
        className="w-full bg-surface-card rounded-lg shadow-md p-4 mb-6 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-10 h-10 rounded-md bg-primary-100 flex items-center justify-center text-lg flex-shrink-0">
          📤
        </span>
        <span className="flex-1">
          <span className="block text-body font-bold text-ink">
            {copied ? '링크 복사됨!' : '친구 초대 링크 복사'}
          </span>
          <span className="block text-caption text-ink-mute mt-0.5">
            카톡으로 보내세요
          </span>
        </span>
        <span className="text-primary text-xl">›</span>
      </button>

      {isAlone && !submitted && <EmptyRoomScene />}
      {!isAlone && (
        <div className="mb-6">
          <ParticipantList participants={participants} maxParticipants={room.max_participants} />
        </div>
      )}

      {!submitted ? (
        <div className="flex flex-col gap-2 mt-6">
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            className="w-full bg-surface-card rounded-lg shadow-sm px-3.5 py-3 text-body text-ink placeholder:text-ink-mute focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
          <AddressSearch onSelect={setSelectedPlace} />
          {selectedPlace && (
            <p className="text-caption text-primary-700 px-1">
              ✓ {selectedPlace.place_name || selectedPlace.address_name}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!selectedPlace || loading}
            className="w-full bg-primary text-white rounded-lg py-3.5 text-body font-bold shadow-cta hover:bg-primary-hover transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? '등록 중...' : '입력 완료'}
          </button>
          {calcError && (
            <SadPinScene
              message={calcError}
              onRetry={() => { setCalcError(null); triggerMidpoint() }}
              retryLabel={calculating ? '계산 중...' : '다시 시도'}
            />
          )}
          {canForceStart && (
            <button
              onClick={() => { setCalcError(null); triggerMidpoint() }}
              disabled={calculating}
              className="w-full bg-primary-100 text-primary-700 rounded-lg py-2.5 text-body font-bold disabled:opacity-50 mt-1"
            >
              {calculating ? '계산 중...' : `지금 결과 보기 (${participants.length}명)`}
            </button>
          )}
        </div>
      ) : (
        <WaitingScene
          selfIndex={selfIndex}
          selfNickname={nickname}
          remaining={remaining}
        />
      )}
    </main>
  )
}
