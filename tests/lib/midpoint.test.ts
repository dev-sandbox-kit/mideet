import { describe, it, expect } from 'vitest'
import { calcGeographicCenter, selectFastestStation, selectFairStation } from '@/lib/midpoint'
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

describe('selectFastestStation', () => {

  it('총 이동시간 합이 가장 적은 역을 선택한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [600, 1200],  // 합: 1800초
      B: [500, 500],   // 합: 1000초
    }
    const result = selectFastestStation(stations, travelTimes)
    expect(result!.station.id).toBe('B')
  })

  it('이동시간 정보가 없는 역은 제외한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [600, 900],
    }
    const result = selectFastestStation(stations, travelTimes)
    expect(result!.station.id).toBe('A')
  })

  it('모든 역에 이동시간 정보가 없으면 null을 반환한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const result = selectFastestStation(stations, {})
    expect(result).toBeNull()
  })
})

describe('selectFairStation', () => {
  it('이동시간 분산이 가장 낮은 역을 선택한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [600, 1800],  // 합: 2400, 분산: 360000
      B: [1000, 1400], // 합: 2400, 분산: 40000
    }
    const result = selectFairStation(stations, travelTimes)
    expect(result!.station.id).toBe('B')
  })

  it('threshold 1.5 초과 역은 후보에서 제외한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const travelTimes: Record<string, number[]> = {
      A: [500, 500],   // 합: 1000 (최소)
      B: [500, 1100],  // 합: 1600 > 1000 * 1.5 = 1500, 제외됨
    }
    const result = selectFairStation(stations, travelTimes)
    expect(result!.station.id).toBe('A')
  })

  it('합계가 동일하면 분산 낮은 역 선택', () => {
    const stations = [makeStation('A'), makeStation('B'), makeStation('C')]
    const travelTimes: Record<string, number[]> = {
      A: [300, 900],   // 합: 1200, 분산: 90000
      B: [600, 600],   // 합: 1200, 분산: 0
      C: [200, 1000],  // 합: 1200, 분산: 160000
    }
    const result = selectFairStation(stations, travelTimes)
    expect(result!.station.id).toBe('B')
  })

  it('이동시간 정보가 없으면 null을 반환한다', () => {
    const stations = [makeStation('A'), makeStation('B')]
    const result = selectFairStation(stations, {})
    expect(result).toBeNull()
  })
})
