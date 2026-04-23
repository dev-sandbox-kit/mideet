'use client'
import { useEffect, useRef } from 'react'
import type { Participant, KakaoPlace } from '@/types'

declare global {
  interface Window {
    kakao: any
  }
}

interface Props {
  center: { lat: number; lng: number }
  participants: Participant[]
  station: KakaoPlace | null
}

export default function KakaoMap({ center, participants, station }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    function initMap() {
      if (!mapRef.current) return
      const { maps } = window.kakao

      const map = new maps.Map(mapRef.current, {
        center: new maps.LatLng(center.lat, center.lng),
        level: 5,
      })

      if (station) {
        const stationPos = new maps.LatLng(parseFloat(station.y), parseFloat(station.x))

        const stationMarker = new maps.Marker({
          map,
          position: stationPos,
          title: station.place_name,
        })

        new maps.InfoWindow({
          content: `<div style="padding:4px 8px;font-size:12px;font-weight:bold">${station.place_name}</div>`,
        }).open(map, stationMarker)

        participants.forEach((p) => {
          const participantPos = new maps.LatLng(p.lat, p.lng)

          new maps.Marker({
            map,
            position: participantPos,
            title: p.nickname,
          })

          new maps.Polyline({
            map,
            path: [participantPos, stationPos],
            strokeWeight: 2,
            strokeColor: '#EF4444',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          })
        })
      } else {
        participants.forEach((p) => {
          new maps.Marker({
            map,
            position: new maps.LatLng(p.lat, p.lng),
            title: p.nickname,
          })
        })
      }
    }

    if (window.kakao) {
      window.kakao.maps.load(initMap)
      return
    }

    const timer = setInterval(() => {
      if (window.kakao) {
        clearInterval(timer)
        window.kakao.maps.load(initMap)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [center, participants, station])

  return <div ref={mapRef} className="w-full h-80 rounded-lg bg-gray-100" />
}
