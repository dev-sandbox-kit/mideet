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

  const { data, error } = await supabase.rpc('add_participant_if_not_full', {
    p_room_id: roomId,
    p_nickname: nickname ?? null,
    p_address_name: address_name,
    p_lat: lat,
    p_lng: lng,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = data as { id?: string; error?: string }
  if (result.error === 'not_found') return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  if (result.error === 'closed') return NextResponse.json({ error: 'Room is closed' }, { status: 409 })
  if (result.error === 'full') return NextResponse.json({ error: 'Room is full' }, { status: 409 })

  return NextResponse.json({ ok: true, id: result.id }, { status: 201 })
}
