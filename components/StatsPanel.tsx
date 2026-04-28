'use client'

import { useEffect, useState } from 'react'
import { MASTERY_LABELS, MASTERY_COLORS, type PatternStat, type ConfusionEntry } from '@/types'

interface StatsData {
  stats: PatternStat[]
  confusion: ConfusionEntry[]
  streak: { current_streak: number; longest_streak: number; last_active_date: string } | null
}

export default function StatsPanel({ userId }: { userId: string }) {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/get-stats?userId=${userId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [userId])

  if (loading) return (
    <div className="panel p-6 text-center font-mono text-sm text-gray-600 animate-pulse-slow">
      loading profile...
    </div>
  )

  if (!data || data.stats.length === 0) return (
    <div className="panel p-6 text-center space-y-2">
      <p className="font-mono text-sm text-gray-500">no data yet.</p>
      <p className="font-mono text-xs text-gray-700">solve a few problems first.</p>
    </div>
  )

  const totalAttempts = data.stats.reduce((a, s) => a + s.total_attempts, 0)
  const totalCorrect = data.stats.reduce((a, s) => a + s.correct_count, 0)
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

  const weakest = [...data.stats]
    .filter(s => s.total_attempts >= 3)
    .sort((a, b) => (a.correct_count / a.total_attempts) - (b.correct_count / b.total_attempts))
    .slice(0, 3)

  return (
    <div className="space-y-5">

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'total solved', value: totalAttempts },
          { label: 'accuracy', value: `${overallAccuracy}%` },
          { label: 'streak', value: data.streak?.current_streak ?? 0 },
        ].map(s => (
          <div key={s.label} className="panel p-4 text-center space-y-1">
            <p className="font-mono text-2xl font-semibold text-white">{s.value}</p>
            <p className="font-mono text-xs text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pattern Mastery */}
      <div className="panel p-4 space-y-4">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">pattern mastery</span>
        <div className="space-y-3">
          {data.stats.map(s => {
            const acc = s.total_attempts > 0 ? s.correct_count / s.total_attempts : 0
            return (
              <div key={s.pattern} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-300">{s.pattern}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-600">{s.correct_count}/{s.total_attempts}</span>
                    <span
                      className="font-mono text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        color: MASTERY_COLORS[s.mastery_level],
                        background: `${MASTERY_COLORS[s.mastery_level]}18`,
                        border: `1px solid ${MASTERY_COLORS[s.mastery_level]}40`,
                      }}
                    >
                      {MASTERY_LABELS[s.mastery_level]}
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(acc * 100)}%`,
                      backgroundColor: MASTERY_COLORS[s.mastery_level],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weakness tracker */}
      {weakest.length > 0 && (
        <div className="panel p-4 space-y-3">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">⚠ weakest patterns</span>
          <div className="space-y-2">
            {weakest.map(s => {
              const acc = Math.round((s.correct_count / s.total_attempts) * 100)
              return (
                <div key={s.pattern} className="flex items-center justify-between panel-bright p-3 rounded-lg">
                  <span className="font-mono text-xs text-gray-300">{s.pattern}</span>
                  <span className="font-mono text-xs text-accent-red">{acc}% accuracy</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confusion matrix */}
      {data.confusion.length > 0 && (
        <div className="panel p-4 space-y-3">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">confusion matrix</span>
          <p className="text-xs text-gray-600 font-mono">what you confuse with what</p>
          <div className="space-y-2">
            {data.confusion.map((c, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap panel-bright p-3 rounded-lg">
                <span className="font-mono text-xs text-accent-red">{c.correct_pattern}</span>
                <span className="text-gray-700 font-mono text-xs">mistaken as</span>
                <span className="font-mono text-xs text-accent-amber">{c.guessed_pattern}</span>
                <span className="ml-auto font-mono text-xs text-gray-600">{c.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
