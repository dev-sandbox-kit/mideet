import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { safeEqual } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.ADMIN_PASSWORD ?? ''}`
  if (!safeEqual(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalRooms },
    { count: roomsToday },
    { count: roomsThisWeek },
    { count: totalParticipants },
    { data: participantsData },
    { data: dailyData },
  ] = await Promise.all([
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('rooms').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('participants').select('*', { count: 'exact', head: true }),
    supabase.from('participants').select('address_name').gte('joined_at', monthStart),
    supabase.from('rooms').select('created_at').gte('created_at', monthStart),
  ])

  const regionCount: Record<string, number> = {}
  participantsData?.forEach((p) => {
    const region = p.address_name.split(' ').slice(0, 2).join(' ')
    regionCount[region] = (regionCount[region] ?? 0) + 1
  })
  const topRegions = Object.entries(regionCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([address, count]) => ({ address, count }))

  const dailyCount: Record<string, number> = {}
  dailyData?.forEach((r) => {
    const date = r.created_at.slice(0, 10)
    dailyCount[date] = (dailyCount[date] ?? 0) + 1
  })
  const dailyRooms = Object.entries(dailyCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    total_rooms: totalRooms,
    rooms_today: roomsToday,
    rooms_this_week: roomsThisWeek,
    total_participants: totalParticipants,
    top_regions: topRegions,
    daily_rooms: dailyRooms,
  })
}
