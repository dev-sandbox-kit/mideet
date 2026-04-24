import { describe, it, expect, vi } from 'vitest'

const roomLogsEqFn = vi.fn().mockReturnValue({ error: null })
const roomLogsUpdateFn = vi.fn().mockReturnValue({ eq: roomLogsEqFn })

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => ({
    from: (table: string) => {
      if (table === 'room_logs') {
        return {
          update: roomLogsUpdateFn,
        }
      }
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'room1',
                status: 'waiting',
                participants: [
                  { id: 'p1', lat: 37.5, lng: 127.0, nickname: 'A', address_name: '강남구', room_id: 'room1', joined_at: '' },
                  { id: 'p2', lat: 37.6, lng: 127.1, nickname: 'B', address_name: '서초구', room_id: 'room1', joined_at: '' },
                ],
              },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ error: null }) }),
      }
    },
  }),
}))

vi.mock('@/lib/kakao/local', () => ({
  searchSubwayStations: vi.fn().mockResolvedValue([
    { id: 'st1', place_name: '강남역', x: '127.02', y: '37.49' },
  ]),
}))

vi.mock('@/lib/kakao/mobility', () => ({
  getTravelDuration: vi.fn().mockResolvedValue(600),
}))

vi.mock('@/lib/midpoint', () => ({
  calcGeographicCenter: vi.fn().mockReturnValue({ lat: 37.55, lng: 127.05 }),
  selectFastestStation: vi.fn().mockReturnValue({
    station: { id: 'st1', place_name: '강남역', x: '127.02', y: '37.49' },
  }),
  selectFairStation: vi.fn().mockReturnValue(null),
}))

describe('POST /api/rooms/[roomId]/midpoint', () => {
  it('완료 시 room_logs를 update한다', async () => {
    const { POST } = await import('@/app/api/rooms/[roomId]/midpoint/route')
    const req = new Request('http://localhost/api/rooms/room1/midpoint', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(200)
    expect(roomLogsEqFn).toHaveBeenCalledWith('room_id', 'room1')
    expect(roomLogsUpdateFn).toHaveBeenCalledWith(
      expect.objectContaining({
        actual_participants: 2,
        midpoint_station_id: 'st1',
        midpoint_station_name: '강남역',
      })
    )
  })

  it('room_logs update 실패 시에도 200을 반환한다', async () => {
    roomLogsEqFn.mockReturnValueOnce({ error: { message: 'db error' } })
    const { POST } = await import('@/app/api/rooms/[roomId]/midpoint/route')
    const req = new Request('http://localhost/api/rooms/room1/midpoint', { method: 'POST' })
    const res = await POST(req, { params: Promise.resolve({ roomId: 'room1' }) })
    expect(res.status).toBe(200)
  })
})
