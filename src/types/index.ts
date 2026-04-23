export type RoomStatus = 'waiting' | 'done'

export interface Room {
  id: string
  created_at: string
  expires_at: string
  max_participants: number
  appointment_date: string | null
  status: RoomStatus
  midpoint_station_id: string | null
  midpoint_station_name: string | null
  midpoint_lat: number | null
  midpoint_lng: number | null
  midpoint_fair_station_id: string | null
  midpoint_fair_station_name: string | null
  midpoint_fair_lat: number | null
  midpoint_fair_lng: number | null
}

export interface Participant {
  id: string
  room_id: string
  nickname: string
  address_name: string
  lat: number
  lng: number
  joined_at: string
}

export interface KakaoPlace {
  id: string
  place_name: string
  category_name: string
  address_name: string
  road_address_name: string
  x: string  // 경도 (lng)
  y: string  // 위도 (lat)
  place_url: string
  distance?: string
}

export type PlaceCategory = '카페' | '식당' | '술집' | '문화시설' | '쇼핑'

export interface MidpointResult {
  station: KakaoPlace
  travel_times: Array<{ nickname: string; duration_seconds: number }>
  fallback: boolean
}

export interface AdminStats {
  total_rooms: number
  rooms_today: number
  rooms_this_week: number
  total_participants: number
  top_regions: Array<{ address: string; count: number }>
  daily_rooms: Array<{ date: string; count: number }>
}
