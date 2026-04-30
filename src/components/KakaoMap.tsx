'use client'
import { useEffect, useRef } from 'react'
import type { Participant, KakaoPlace, Station } from '@/types'
import type { KakaoMap as KakaoMapInstance, KakaoOverlay } from '@/types/kakao-maps'
import { getPinColor } from './pin/pin-colors'

interface Props {
  center: { lat: number; lng: number }
  participants: Participant[]
  station: Station | null
  places?: KakaoPlace[]
  onPlaceSelect?: (place: KakaoPlace) => void
}

function makeParticipantOverlay(nickname: string, color: string): HTMLElement {
  const root = document.createElement('div')
  root.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:default'
  root.innerHTML = `
    <div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>
    <span style="margin-top:3px;font-size:11px;font-weight:700;color:${color};background:white;padding:1px 5px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap"></span>
  `
  ;(root.querySelector('span') as HTMLSpanElement).textContent = nickname
  return root
}

function makePlaceOverlay(name: string, onClick: () => void): HTMLElement {
  const root = document.createElement('div')
  root.style.cssText = 'position:relative;display:flex;justify-content:center;cursor:pointer;width:14px;height:14px;'
  root.innerHTML = `
    <div style="width:10px;height:10px;border-radius:50%;background:#1F2937;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35);margin:auto"></div>
    <span class="place-tooltip" style="visibility:hidden;position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:600;color:#1F2937;background:white;padding:1px 5px;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.2);white-space:nowrap;z-index:10"></span>
  `
  const tooltip = root.querySelector('.place-tooltip') as HTMLSpanElement
  tooltip.textContent = name
  root.addEventListener('mouseenter', () => { tooltip.style.visibility = 'visible' })
  root.addEventListener('mouseleave', () => { tooltip.style.visibility = 'hidden' })
  root.addEventListener('click', onClick)
  return root
}

export default function KakaoMap({ center, participants, station, places = [], onPlaceSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null)
  const overlaysRef = useRef<KakaoOverlay[]>([])
  const onPlaceSelectRef = useRef(onPlaceSelect)
  useEffect(() => { onPlaceSelectRef.current = onPlaceSelect }, [onPlaceSelect])

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

      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []

      if (station) {
        const stationPos = new maps.LatLng(station.lat, station.lng)

        const stationMarker = new maps.Marker({ map, position: stationPos, title: station.name })
        const stationLabel = document.createElement('div')
        stationLabel.style.cssText = 'padding:4px 8px;font-size:12px;font-weight:bold;background:white;border-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,0.2)'
        stationLabel.textContent = station.name
        const iw = new maps.InfoWindow({ content: stationLabel.outerHTML })
        iw.open(map, stationMarker)
        overlaysRef.current.push(stationMarker, iw)

        participants.forEach((p, i) => {
          const color = getPinColor(i, p.nickname)
          const pos = new maps.LatLng(p.lat, p.lng)
          const overlay = new maps.CustomOverlay({
            map,
            position: pos,
            content: makeParticipantOverlay(p.nickname, color),
            yAnchor: 0,
          })
          const polyline = new maps.Polyline({
            map,
            path: [pos, stationPos],
            strokeWeight: 2,
            strokeColor: color,
            strokeOpacity: 0.6,
            strokeStyle: 'solid',
          })
          overlaysRef.current.push(overlay, polyline)
        })
      } else {
        participants.forEach((p, i) => {
          const color = getPinColor(i, p.nickname)
          const overlay = new maps.CustomOverlay({
            map,
            position: new maps.LatLng(p.lat, p.lng),
            content: makeParticipantOverlay(p.nickname, color),
            yAnchor: 0,
          })
          overlaysRef.current.push(overlay)
        })
      }

      places.forEach((place) => {
        const overlay = new maps.CustomOverlay({
          map,
          position: new maps.LatLng(parseFloat(place.y), parseFloat(place.x)),
          content: makePlaceOverlay(place.place_name, () => onPlaceSelectRef.current?.(place)),
          yAnchor: 0,
        })
        overlaysRef.current.push(overlay)
      })
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
  }, [center, participants, station, places])

  return <div ref={mapRef} className="w-full h-80 rounded-lg bg-gray-100" />
}
