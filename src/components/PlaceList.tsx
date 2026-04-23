import type { KakaoPlace } from '@/types'

interface Props {
  places: KakaoPlace[]
  loading: boolean
}

export default function PlaceList({ places, loading }: Props) {
  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">장소를 불러오는 중...</p>
  if (places.length === 0) return <p className="text-sm text-gray-400 py-4 text-center">주변 장소가 없습니다.</p>

  return (
    <div>
      <ul className="space-y-2">
        {places.map((place) => (
          <li key={place.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{place.place_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{place.road_address_name || place.address_name}</p>
              </div>
              {place.distance && (
                <span className="text-xs text-gray-400 ml-2 whitespace-nowrap">{Number(place.distance) >= 1000 ? `${(Number(place.distance) / 1000).toFixed(1)}km` : `${place.distance}m`}</span>
              )}
            </div>
            <a href={place.place_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 mt-1 inline-block">
              지도에서 보기
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mt-3 text-center">
        영업시간이 실제와 다를 수 있으니 방문 전 직접 확인해주세요.
      </p>
    </div>
  )
}
