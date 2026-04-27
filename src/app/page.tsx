'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'

export default function HomePage() {
  const router = useRouter()
  const [maxParticipants, setMaxParticipants] = useState(2)
  const [appointmentDate, setAppointmentDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_participants: maxParticipants,
          appointment_date: appointmentDate || null,
        }),
      })
      if (!res.ok) throw new Error('방 생성에 실패했습니다.')
      const { id } = await res.json()
      posthog.capture('room_created', { max_participants: maxParticipants })
      router.push(`/r/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-2">mideet</h1>
      <p className="text-gray-500 mb-8 text-center">여러 곳에서 모이는 사람들을 위한 중간지점 약속 서비스</p>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">인원수 (2~10명)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMaxParticipants((n) => Math.max(2, n - 1))}
              disabled={maxParticipants <= 2}
              className="w-9 h-9 rounded-full border text-lg font-medium disabled:opacity-30"
            >
              −
            </button>
            <span className="w-8 text-center font-medium">{maxParticipants}</span>
            <button
              type="button"
              onClick={() => setMaxParticipants((n) => Math.min(10, n + 1))}
              disabled={maxParticipants >= 10}
              className="w-9 h-9 rounded-full border text-lg font-medium disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">약속 날짜 (선택)</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? '생성 중...' : '방 만들기'}
        </button>
      </div>
    </main>
  )
}
