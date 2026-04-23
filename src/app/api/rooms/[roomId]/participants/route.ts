import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const body = await req.json()
  const { nickname, address_name, lat, lng } = body

  if (!address_name || lat == null || lng == null) {
    return NextResponse.json({ error: 'address_name, lat, lng are required' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('max_participants, status')
    .eq('id', roomId)
    .single()

  if (roomError || !room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  if (room.status === 'done') return NextResponse.json({ error: 'Room is closed' }, { status: 409 })

  const { data: existing, error: countError } = await supabase
    .from('participants')
    .select('id')
    .eq('room_id', roomId)

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

  const currentCount = existing?.length ?? 0
  // TOCTOU: concurrent requests may both pass this check before either inserts.
  // Acceptable for MVP; fix with DB-level unique constraint or Postgres RPC if needed.
  if (currentCount >= room.max_participants) {
    return NextResponse.json({ error: 'Room is full' }, { status: 409 })
  }

  const participantNickname = nickname?.trim() || `참여자 ${currentCount + 1}`

  const { error } = await supabase.from('participants').insert({
    room_id: roomId,
    nickname: participantNickname,
    address_name,
    lat,
    lng,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
