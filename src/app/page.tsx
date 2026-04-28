'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import posthog from 'posthog-js'
import HeroPinTrio from '@/components/mascot/HeroPinTrio'

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
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <section className="w-full max-w-sm flex flex-col items-center text-center mb-10">
        <HeroPinTrio />
        <h1 className="text-display text-ink mt-6">
          친구들이랑<br />중간에서 만나요
        </h1>
        <p className="text-body text-ink-mute mt-3">
          출발지만 입력하면<br />
          모두에게 가까운 만날 곳을 찾아드려요.
        </p>
      </section>

      <div className="w-full max-w-sm flex flex-col gap-4">
        <div className="bg-surface-card rounded-lg shadow-md p-4">
          <label className="block text-caption text-ink-mute mb-2">인원수 (2~10명)</label>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setMaxParticipants((n) => Math.max(2, n - 1))}
              disabled={maxParticipants <= 2}
              className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-xl font-bold disabled:opacity-30 transition-colors"
              aria-label="인원수 감소"
            >
              −
            </button>
            <span className="text-number text-primary w-12 text-center">{maxParticipants}</span>
            <button
              type="button"
              onClick={() => setMaxParticipants((n) => Math.min(10, n + 1))}
              disabled={maxParticipants >= 10}
              className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 text-xl font-bold disabled:opacity-30 transition-colors"
              aria-label="인원수 증가"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-surface-card rounded-lg shadow-md p-4">
          <label className="block text-caption text-ink-mute mb-2">약속 날짜 (선택)</label>
          <input
            type="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            className="w-full bg-surface rounded-md px-3 py-2.5 text-body text-ink focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
        </div>

        {error && <p className="text-danger text-body text-center">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-primary text-white rounded-lg py-3.5 text-body font-bold shadow-cta hover:bg-primary-hover transition-colors disabled:opacity-50"
        >
          {loading ? '만드는 중...' : '약속 만들기'}
        </button>
      </div>
    </main>
  )
}
