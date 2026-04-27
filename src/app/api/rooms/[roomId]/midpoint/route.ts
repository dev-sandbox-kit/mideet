import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { calcGeographicCenter, selectFastestStation, selectFairStation } from '@/lib/midpoint'
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
  const stations = (await searchSubwayStations(center.lat, center.lng, 5000)).slice(0, 3)

  let midpointLat = center.lat
  let midpointLng = center.lng
  let midpointStationId: string | null = null
  let midpointStationName: string | null = null
  let midpointFairLat: number | null = null
  let midpointFairLng: number | null = null
  let midpointFairStationId: string | null = null
  let midpointFairStationName: string | null = null
  let fallback = false

  console.log(`[midpoint] roomId=${roomId} stations=(${stations.map((s) => s.place_name).join(', ') || 'none'})`)

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

    const fastest = selectFastestStation(stations, travelTimes)
    const fair = selectFairStation(stations, travelTimes)

    if (fastest) {
      midpointLat = parseFloat(fastest.station.y)
      midpointLng = parseFloat(fastest.station.x)
      midpointStationId = fastest.station.id
      midpointStationName = fastest.station.place_name
    } else {
      fallback = true
    }

    if (fair) {
      midpointFairLat = parseFloat(fair.station.y)
      midpointFairLng = parseFloat(fair.station.x)
      midpointFairStationId = fair.station.id
      midpointFairStationName = fair.station.place_name
    }

    console.log(
      `[midpoint] roomId=${roomId} fastest=${midpointStationName ?? 'fallback'} fair=${midpointFairStationName ?? '-'}`
    )
  }

  const { error: updateError } = await supabase
    .from('rooms')
    .update({
      status: 'done',
      midpoint_lat: midpointLat,
      midpoint_lng: midpointLng,
      midpoint_station_id: midpointStationId,
      midpoint_station_name: midpointStationName,
      midpoint_fair_lat: midpointFairLat,
      midpoint_fair_lng: midpointFairLng,
      midpoint_fair_station_id: midpointFairStationId,
      midpoint_fair_station_name: midpointFairStationName,
    })
    .eq('id', roomId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const { error: logError } = await supabase
    .from('room_logs')
    .update({
      completed_at: new Date().toISOString(),
      actual_participants: participants.length,
      midpoint_station_id: midpointStationId,
      midpoint_station_name: midpointStationName,
    })
    .eq('room_id', roomId)
  if (logError) console.error('[room_logs] update failed', logError.message)

  return NextResponse.json({ lat: midpointLat, lng: midpointLng, fallback })
}
