import type { PlaceCategory } from '@/types'

export const ROOM_TTL_MS = 3 * 24 * 60 * 60 * 1000

export const MIDPOINT_SEARCH_RADII = [5000, 10000, 15000] as const

export const PLACES_DEFAULT_RADIUS_M = 1000

export const KAKAO_CATEGORY_CODE: Record<Exclude<PlaceCategory, '술집'>, string> = {
  카페: 'CE7',
  식당: 'FD6',
  문화시설: 'CT1',
  쇼핑: 'MT1',
}

export const KAKAO_BAR_KEYWORD = '주점'
