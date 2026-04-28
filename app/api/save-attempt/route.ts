import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcMasteryLevel } from '@/lib/mastery'
import { nextReviewDate } from '@/lib/spacedRepetition'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      problemText,
      correctPattern,
      guessedPattern,
      confidence,
      isCorrect,
      signals,
      explanation,
      guessExplanation,
      similarProblems,
    } = await req.json()

    const reviewAt = isCorrect === false ? nextReviewDate(0).toISOString() : null

    // Save attempt
    await supabase.from('attempts').insert({
      user_id: userId,
      problem_text: problemText,
      correct_pattern: correctPattern,
      guessed_pattern: guessedPattern || null,
      confidence: confidence || null,
      is_correct: isCorrect ?? null,
      signals: signals || [],
      explanation,
      guess_explanation: guessExplanation || null,
      similar_problems: similarProblems || [],
      next_review_at: reviewAt,
      review_count: 0,
    })

    // Upsert pattern_stats
    const { data: existing } = await supabase
      .from('pattern_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern', correctPattern)
      .single()

    const total = (existing?.total_attempts || 0) + 1
    const correct = (existing?.correct_count || 0) + (isCorrect ? 1 : 0)
    const mastery = calcMasteryLevel(total, correct)

    await supabase.from('pattern_stats').upsert({
      user_id: userId,
      pattern: correctPattern,
      total_attempts: total,
      correct_count: correct,
      mastery_level: mastery,
      last_seen: new Date().toISOString(),
    }, { onConflict: 'user_id,pattern' })

    // Update confusion matrix if guess was wrong
    if (guessedPattern && guessedPattern !== correctPattern) {
      const { data: conf } = await supabase
        .from('pattern_confusion')
        .select('*')
        .eq('user_id', userId)
        .eq('correct_pattern', correctPattern)
        .eq('guessed_pattern', guessedPattern)
        .single()

      await supabase.from('pattern_confusion').upsert({
        user_id: userId,
        correct_pattern: correctPattern,
        guessed_pattern: guessedPattern,
        count: (conf?.count || 0) + 1,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id,correct_pattern,guessed_pattern' })
    }

    // Update streak
    const today = new Date().toISOString().split('T')[0]
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!streak) {
      await supabase.from('user_streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
      })
    } else {
      const last = streak.last_active_date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yStr = yesterday.toISOString().split('T')[0]

      let newStreak = streak.current_streak
      if (last === today) {
        // already active today, no change
      } else if (last === yStr) {
        newStreak += 1
      } else {
        newStreak = 1
      }

      await supabase.from('user_streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_active_date: today,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Save attempt error:', err)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
