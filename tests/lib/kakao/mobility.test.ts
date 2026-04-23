import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTravelDuration } from '@/lib/kakao/mobility'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => mockFetch.mockReset())

describe('getTravelDuration', () => {
  it('routes[0].summary.duration을 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        routes: [{ summary: { duration: 1200 } }],
      }),
    })
    const result = await getTravelDuration(
      { lat: 37.5, lng: 127.0 },
      { lat: 37.55, lng: 127.05 }
    )
    expect(result).toBe(1200)
  })

  it('API 실패 시 null을 반환한다', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 })
    const result = await getTravelDuration(
      { lat: 37.5, lng: 127.0 },
      { lat: 37.55, lng: 127.05 }
    )
    expect(result).toBeNull()
  })
})
