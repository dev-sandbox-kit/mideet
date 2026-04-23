import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(_req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('rooms')
    .select('*, participants(*)')
    .eq('id', roomId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  return NextResponse.json(data)
}
