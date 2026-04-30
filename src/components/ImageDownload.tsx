'use client'
import { useState } from 'react'
import { buildStaticMapUrl } from '@/lib/kakao/static-map'
import posthog from 'posthog-js'
import type { Participant, KakaoPlace, PlaceCategory, Station } from '@/types'

interface Props {
  center: { lat: number; lng: number }
  participants: Participant[]
  station: Station | null
  places: KakaoPlace[]
  category: PlaceCategory
}

export default function ImageDownload({ center, participants, station, places, category }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setLoading(true)
    setError('')
    try {
      const lineHeight = 24
      const padding = 16
      const mapHeight = 400
      const listHeight = Math.max(places.length, 0) > 0
        ? Math.min(places.length, 5) * lineHeight + padding * 2 + 40
        : 0

      let mapImg: HTMLImageElement | null = null
      try {
        const mapUrl = buildStaticMapUrl({
          center,
          participants,
          station,
          width: 640,
          height: mapHeight,
        })
        const proxyUrl = `/api/static-map?url=${encodeURIComponent(mapUrl)}`
        const imgRes = await fetch(proxyUrl)
        if (imgRes.ok) {
          const blob = await imgRes.blob()
          const objectUrl = URL.createObjectURL(blob)
          mapImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = objectUrl
          })
          URL.revokeObjectURL(objectUrl)
        }
      } catch {
        // Static map unavailable — proceed with text-only header
      }

      const canvas = document.createElement('canvas')
      canvas.width = 640
      canvas.height = mapHeight + listHeight

      const ctx = canvas.getContext('2d')!

      if (mapImg) {
        ctx.drawImage(mapImg, 0, 0, 640, mapHeight)
      } else {
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(0, 0, 640, mapHeight)
        ctx.fillStyle = '#6b7280'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('mideet — 중간지점 결과', 320, mapHeight / 2 - 10)
        ctx.font = '13px sans-serif'
        ctx.fillText(`위도 ${center.lat.toFixed(4)}  경도 ${center.lng.toFixed(4)}`, 320, mapHeight / 2 + 16)
        ctx.textAlign = 'left'
      }

      if (listHeight > 0) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, mapHeight, 640, listHeight)

        ctx.fillStyle = '#111827'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`주변 ${category} 추천`, padding, mapHeight + padding + 16)

        ctx.font = '13px sans-serif'
        ctx.fillStyle = '#374151'
        places.slice(0, 5).forEach((p, i) => {
          ctx.fillText(`${i + 1}. ${p.place_name}  ${p.road_address_name || p.address_name}`, padding, mapHeight + padding + 40 + i * lineHeight)
        })
      }

      const link = document.createElement('a')
      link.download = 'mideet-result.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
      posthog.capture('image_downloaded')
    } catch (e) {
      setError(e instanceof Error ? e.message : '이미지 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full border border-gray-300 rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? '이미지 생성 중...' : '결과 이미지 저장'}
      </button>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  )
}
