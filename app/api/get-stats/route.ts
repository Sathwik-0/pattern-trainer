import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const [statsRes, confusionRes, streakRes, reviewRes] = await Promise.all([
    supabase.from('pattern_stats').select('*').eq('user_id', userId).order('total_attempts', { ascending: false }),
    supabase.from('pattern_confusion').select('*').eq('user_id', userId).order('count', { ascending: false }).limit(10),
    supabase.from('user_streaks').select('*').eq('user_id', userId).single(),
    supabase.from('attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_correct', false)
      .lte('next_review_at', new Date().toISOString())
      .order('next_review_at', { ascending: true })
      .limit(5),
  ])

  return NextResponse.json({
    stats: statsRes.data || [],
    confusion: confusionRes.data || [],
    streak: streakRes.data || null,
    reviewQueue: reviewRes.data || [],
  })
}
