import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchAddress, searchSubwayStations, searchPlacesByCategory } from '@/lib/kakao/local'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const kakaoPlace = {
  id: '1',
  place_name: '강남역',
  category_name: '지하철역',
  address_name: '서울 강남구',
  road_address_name: '서울 강남구 강남대로',
  x: '127.0276',
  y: '37.4979',
  place_url: 'http://place.map.kakao.com/1',
  distance: '100',
}

beforeEach(() => mockFetch.mockReset())

describe('searchAddress', () => {
  it('카카오 API 응답에서 장소 목록을 반환한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [kakaoPlace] }),
    })
    const result = await searchAddress('강남역')
    expect(result).toHaveLength(1)
    expect(result[0].place_name).toBe('강남역')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('keyword.json'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: expect.stringContaining('KakaoAK') }),
      })
    )
  })
})

describe('searchSubwayStations', () => {
  it('category_group_code=SW8로 지하철역을 검색한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [kakaoPlace] }),
    })
    await searchSubwayStations(37.4979, 127.0276, 5000)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('category_group_code=SW8')
  })
})

describe('searchPlacesByCategory', () => {
  it('카페 카테고리 코드 CE7로 검색한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ documents: [] }),
    })
    await searchPlacesByCategory(37.4979, 127.0276, 'CE7', 1000)
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain('category_group_code=CE7')
  })
})
