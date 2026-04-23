import { describe, it, expect } from 'vitest'
import { calcGeographicCenter, selectOptimalStation } from '@/lib/midpoint'
import type { Participant, KakaoPlace } from '@/types'

const makeParticipant = (lat: number, lng: number): Participant => ({
  id: 'uuid',
  room_id: 'room1',
  nickname: '참여자',
  address_name: '주소',
  lat,
  lng,
  joined_at: '',
})

describe('calcGeographicCenter', () => {
  it('2명의 좌표 평균을 반환한다', () => {
    const result = calcGeographicCenter([
      makeParticipant(37.5, 127.0),
      makeParticipant(37.7, 127.2),
    ])
    expect(result.lat).toBeCloseTo(37.6)
    expect(result.lng).toBeCloseTo(127.1)
  })

  it('단독 참여자의 경우 본인 위치를 반환한다', () => {
    const result = calcGeographicCenter([makeParticipant(37.5, 127.0)])
    expect(result.lat).toBe(37.5)
    expect(result.lng).toBe(127.0)
  })
})

const makeStation = (id: string): KakaoPlace => ({
  id,
  place_name: `${id}역`,
  category_name: '지하철역',
  address_name: '',
  road_address_name: '',
  x: '127.0',
  y: '37.5',
  place_url: '',
})

describe('selectOptimalStation', () => {
  it('총 이동시간 합이 가장 적은 역을 선택한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [600, 1200],  // 합: 1800초
      B: [500, 500],   // 합: 1000초
    }
    const result = selectOptimalStation(stations, travelTimes)
    expect(result!.station.id).toBe('B')
  })

  it('이동시간 정보가 없는 역은 제외한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [600, 900],
    }
    const result = selectOptimalStation(stations, travelTimes)
    expect(result!.station.id).toBe('A')
  })

  it('모든 역에 이동시간 정보가 없으면 null을 반환한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const result = selectOptimalStation(stations, {})
    expect(result).toBeNull()
  })
})
