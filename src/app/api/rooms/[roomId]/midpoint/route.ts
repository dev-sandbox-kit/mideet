import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calcGeographicCenter, selectOptimalStation } from '@/lib/midpoint'
import { searchSubwayStations } from '@/lib/kakao/local'
import { getTravelDuration } from '@/lib/kakao/mobility'
import type { Participant } from '@/types'

export async function POST(_req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = createServerClient()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('*, participants(*)')
    .eq('id', roomId)
    .single()

  if (roomError) {
    if (roomError.code === 'PGRST116') return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    return NextResponse.json({ error: roomError.message }, { status: 500 })
  }
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  if (room.status === 'done') return NextResponse.json({ error: 'Already calculated' }, { status: 409 })

  const participants: Participant[] = room.participants
  if (participants.length < 2) {
    return NextResponse.json({ error: 'At least 2 participants required' }, { status: 400 })
  }

  const center = calcGeographicCenter(participants)
  const stations = await searchSubwayStations(center.lat, center.lng, 5000)

  let midpointLat = center.lat
  let midpointLng = center.lng
  let midpointStationId: string | null = null
  let midpointStationName: string | null = null
  let fallback = false

  if (stations.length === 0) {
    fallback = true
  } else {
    const travelTimes: Record<string, number[]> = {}
    await Promise.all(
      stations.map(async (station) => {
        const times = await Promise.all(
          participants.map((p) =>
            getTravelDuration(
              { lat: p.lat, lng: p.lng },
              { lat: parseFloat(station.y), lng: parseFloat(station.x) }
            )
          )
        )
        const validTimes = times.filter((t): t is number => t !== null)
        if (validTimes.length > 0) travelTimes[station.id] = validTimes
      })
    )

    const result = selectOptimalStation(stations, travelTimes)
    if (result) {
      midpointLat = parseFloat(result.station.y)
      midpointLng = parseFloat(result.station.x)
      midpointStationId = result.station.id
      midpointStationName = result.station.place_name
    } else {
      fallback = true
    }
  }

  const { error: updateError } = await supabase
    .from('rooms')
    .update({
      status: 'done',
      midpoint_lat: midpointLat,
      midpoint_lng: midpointLng,
      midpoint_station_id: midpointStationId,
      midpoint_station_name: midpointStationName,
    })
    .eq('id', roomId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  return NextResponse.json({ lat: midpointLat, lng: midpointLng, fallback })
}
