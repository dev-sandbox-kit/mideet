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
  const mapInstanceRef = useRef<any>(null)
  const overlaysRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current) return

    function setup() {
      if (!mapRef.current) return
      const { maps } = window.kakao

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center: new maps.LatLng(center.lat, center.lng),
          level: 5,
        })
      } else {
        mapInstanceRef.current.setCenter(new maps.LatLng(center.lat, center.lng))
        mapInstanceRef.current.setLevel(5)
      }

      const map = mapInstanceRef.current

      overlaysRef.current.forEach((o) => {
        if (typeof o.close === 'function') o.close()
        else o.setMap(null)
      })
      overlaysRef.current = []

      if (station) {
        const stationPos = new maps.LatLng(parseFloat(station.y), parseFloat(station.x))

        const stationMarker = new maps.Marker({ map, position: stationPos, title: station.place_name })
        const iw = new maps.InfoWindow({
          content: `<div style="padding:4px 8px;font-size:12px;font-weight:bold">${station.place_name}</div>`,
        })
        iw.open(map, stationMarker)
        overlaysRef.current.push(stationMarker, iw)

        participants.forEach((p) => {
          const pos = new maps.LatLng(p.lat, p.lng)
          const marker = new maps.Marker({ map, position: pos, title: p.nickname })
          const polyline = new maps.Polyline({
            map,
            path: [pos, stationPos],
            strokeWeight: 2,
            strokeColor: '#EF4444',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          })
          overlaysRef.current.push(marker, polyline)
        })
      } else {
        participants.forEach((p) => {
          const marker = new maps.Marker({
            map,
            position: new maps.LatLng(p.lat, p.lng),
            title: p.nickname,
          })
          overlaysRef.current.push(marker)
        })
      }
    }

    if (window.kakao) {
      window.kakao.maps.load(setup)
      return
    }

    const timer = setInterval(() => {
      if (window.kakao) {
        clearInterval(timer)
        window.kakao.maps.load(setup)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [center, participants, station])

  return <div ref={mapRef} className="w-full h-80 rounded-lg bg-gray-100" />
}
