import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateRoomId } from '@/lib/room-id'
import { ROOM_TTL_MS } from '@/lib/constants'

export async function POST(req: Request) {
  const body = await req.json()
  const { max_participants, appointment_date } = body

  if (!max_participants || max_participants < 2 || max_participants > 10) {
    return NextResponse.json({ error: 'max_participants must be 2–10' }, { status: 400 })
  }

  const id = generateRoomId()
  const supabase = createServerClient()

  const expiresAt = new Date(Date.now() + ROOM_TTL_MS).toISOString()

  const { error } = await supabase.from('rooms').insert({
    id,
    max_participants,
    appointment_date: appointment_date ?? null,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: logError } = await supabase.from('room_logs').insert({
    room_id: id,
    max_participants,
    appointment_date: appointment_date ?? null,
  })
  if (logError) console.error('[room_logs] insert failed', logError.message)

  return NextResponse.json({ id }, { status: 201 })
}
