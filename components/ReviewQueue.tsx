'use client'

import { useEffect, useState } from 'react'
import { type Attempt } from '@/types'

export default function ReviewQueue({ userId }: { userId: string }) {
  const [queue, setQueue] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetch(`/api/get-stats?userId=${userId}`)
      .then(r => r.json())
      .then(d => {
        setQueue(d.reviewQueue || [])
        setLoading(false)
      })
  }, [userId])

  if (loading || queue.length === 0) return null

  return (
    <div className="panel p-4 space-y-3 glow-border">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-accent-amber uppercase tracking-widest">⟳ review queue</span>
        <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
          {queue.length} due
        </span>
      </div>
      <p className="text-xs text-gray-600 font-mono">problems you got wrong — due for review</p>
      <div className="space-y-2">
        {queue.map(a => (
          <div key={a.id} className="panel-bright p-3 space-y-1">
            <p className="font-mono text-xs text-gray-300 line-clamp-2">{a.problem_text}</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-accent-red">{a.correct_pattern}</span>
              <span className="font-mono text-xs text-gray-700">review #{a.review_count + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
