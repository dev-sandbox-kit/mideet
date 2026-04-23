'use client'
import { useState } from 'react'
import { buildStaticMapUrl } from '@/lib/kakao/static-map'
import posthog from 'posthog-js'
import type { Participant, KakaoPlace, PlaceCategory } from '@/types'

interface Props {
  center: { lat: number; lng: number }
  participants: Participant[]
  station: KakaoPlace | null
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
      const mapUrl = buildStaticMapUrl({
        center,
        participants,
        station: station ?? { id: '', place_name: '', category_name: '', address_name: '', road_address_name: '', x: String(center.lng), y: String(center.lat), place_url: '' },
        width: 640,
        height: 400,
      })

      const proxyUrl = `/api/static-map?url=${encodeURIComponent(mapUrl)}`
      const imgRes = await fetch(proxyUrl)
      if (!imgRes.ok) throw new Error(`지도 이미지를 불러올 수 없습니다. (${imgRes.status})`)
      const blob = await imgRes.blob()
      const mapBitmap = await createImageBitmap(blob)

      const canvas = document.createElement('canvas')
      const lineHeight = 24
      const padding = 16
      const listHeight = Math.min(places.length, 5) * lineHeight + padding * 2 + 40
      canvas.width = 640
      canvas.height = 400 + listHeight

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(mapBitmap, 0, 0, 640, 400)

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 400, 640, listHeight)

      ctx.fillStyle = '#111827'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`주변 ${category} 추천`, padding, 400 + padding + 16)

      ctx.font = '13px sans-serif'
      ctx.fillStyle = '#374151'
      places.slice(0, 5).forEach((p, i) => {
        ctx.fillText(`${i + 1}. ${p.place_name}  ${p.road_address_name || p.address_name}`, padding, 400 + padding + 40 + i * lineHeight)
      })

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
