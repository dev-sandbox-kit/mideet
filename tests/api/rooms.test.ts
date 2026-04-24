import { describe, it, expect, vi } from 'vitest'

const roomsInsertFn = vi.fn().mockReturnValue({ error: null })
const roomLogsInsertFn = vi.fn().mockReturnValue({ error: null })

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (table: string) => {
      if (table === 'room_logs') return { insert: roomLogsInsertFn }
      return { insert: roomsInsertFn }
    },
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

  it('방 생성 시 room_logs에도 insert한다', async () => {
    roomLogsInsertFn.mockClear()
    const { POST } = await import('@/app/api/rooms/route')

    // appointment_date 있는 경우
    const req1 = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ max_participants: 3, appointment_date: '2026-05-01' }),
    })
    await POST(req1)
    expect(roomLogsInsertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'abc123',
        max_participants: 3,
        appointment_date: '2026-05-01',
      })
    )

    // appointment_date 없는 경우
    roomLogsInsertFn.mockClear()
    const req2 = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ max_participants: 3 }),
    })
    await POST(req2)
    expect(roomLogsInsertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        room_id: 'abc123',
        max_participants: 3,
        appointment_date: null,
      })
    )
  })

  it('rooms insert 실패 시 room_logs에 insert하지 않는다', async () => {
    roomsInsertFn.mockReturnValueOnce({ error: { message: 'db error' } })
    roomLogsInsertFn.mockClear()
    const { POST } = await import('@/app/api/rooms/route')
    const req = new Request('http://localhost/api/rooms', {
      method: 'POST',
      body: JSON.stringify({ max_participants: 3 }),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
    expect(roomLogsInsertFn).not.toHaveBeenCalled()
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
