import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (_table: string) => ({
      insert: vi.fn().mockReturnValue({ error: null }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'abc123',
              max_participants: 3,
              status: 'waiting',
              appointment_date: null,
              participants: [],
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

vi.mock('@/lib/room-id', () => ({ generateRoomId: () => 'abc123' }))

describe('POST /api/rooms', () => {
  it('유효한 요청에 201과 room id를 반환한다', async () => {
    const { POST } = await import('@/app/api/rooms/route')
    const req = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ max_participants: 3 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('abc123')
  })

  it('max_participants가 범위를 벗어나면 400을 반환한다', async () => {
    const { POST } = await import('@/app/api/rooms/route')
    const req = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ max_participants: 11 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
