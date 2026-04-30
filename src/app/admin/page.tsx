'use client'
import { useState } from 'react'
import type { AdminStats } from '@/types'

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${password}` },
    })
    if (!res.ok) { setError('비밀번호가 틀렸습니다.'); setLoading(false); return }
    setStats(await res.json())
    setLoading(false)
  }

  if (!stats) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xs space-y-3">
          <h1 className="text-lg font-bold text-center">어드민</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="비밀번호"
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-6">어드민 통계</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: '전체 방', value: stats.total_rooms },
          { label: '오늘 방', value: stats.rooms_today },
          { label: '이번 주 방', value: stats.rooms_this_week },
          { label: '전체 참여자', value: stats.total_participants },
        ].map((s) => (
          <div key={s.label} className="border rounded-lg p-4 text-center">
            <p className="text-2xl font-bold">{s.value ?? 0}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2">인기 지역 Top 5</h2>
        <ul className="space-y-1">
          {stats.top_regions.map((r, i) => (
            <li key={r.address} className="flex justify-between text-sm">
              <span>{i + 1}. {r.address}</span>
              <span className="text-gray-500">{r.count}회</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-2">일별 방 생성 (최근 30일)</h2>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {stats.daily_rooms.map((d) => (
            <div key={d.date} className="flex justify-between text-sm">
              <span>{d.date}</span>
              <span>{d.count}개</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
