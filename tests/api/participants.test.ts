import { describe, it, expect, vi } from 'vitest'

const rpcMock = vi.fn().mockResolvedValue({ data: { id: 'new-uuid' }, error: null })

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    rpc: rpcMock,
  }),
}))

describe('POST /api/rooms/[roomId]/participants', () => {
  it('유효한 요청에 201을 반환한다', async () => {
    rpcMock.mockResolvedValueOnce({ data: { id: 'new-uuid' }, error: null })
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ nickname: '철수', address_name: '강남구', lat: 37.5, lng: 127.0 }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(201)
    expect(rpcMock).toHaveBeenCalledWith('add_participant_if_not_full', expect.objectContaining({
      p_room_id: 'room1',
      p_nickname: '철수',
      p_address_name: '강남구',
      p_lat: 37.5,
      p_lng: 127.0,
    }))
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

  it('방이 가득 찼으면 409를 반환한다', async () => {
    rpcMock.mockResolvedValueOnce({ data: { error: 'full' }, error: null })
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ address_name: '강남구', lat: 37.5, lng: 127.0 }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(409)
  })

  it('방이 종료됐으면 409를 반환한다', async () => {
    rpcMock.mockResolvedValueOnce({ data: { error: 'closed' }, error: null })
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ address_name: '강남구', lat: 37.5, lng: 127.0 }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(409)
  })

  it('방이 없으면 404를 반환한다', async () => {
    rpcMock.mockResolvedValueOnce({ data: { error: 'not_found' }, error: null })
    const { POST } = await import('@/app/api/rooms/[roomId]/participants/route')
    const req = new Request('http://localhost/api/rooms/room1/participants', {
      method: 'POST',
      body: JSON.stringify({ address_name: '강남구', lat: 37.5, lng: 127.0 }),
    })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(404)
  })
})
