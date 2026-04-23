import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'room1', max_participants: 3, status: 'waiting' },
            error: null,
          }),
          data: [{ id: 'p1' }],
          error: null,
        }),
      }),
      insert: vi.fn().mockReturnValue({ error: null }),
    }),
  }),
}))

describe('POST /api/rooms/[roomId]/participants', () => {
  it('유효한 요청에 201을 반환한다', async () => {
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ nickname: '철수', address_name: '강남구', lat: 37.5, lng: 127.0 }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(201)
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ nickname: '철수' }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(400)
  })
})
