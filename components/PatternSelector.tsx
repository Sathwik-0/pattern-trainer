'use client'

import { ALL_PATTERNS, type Pattern } from '@/types'

const PATTERN_ICONS: Record<string, string> = {
  'Sliding Window': '⊡',
  'Two Pointers': '⇄',
  'Binary Search': '⌖',
  'Dynamic Programming': '◫',
  'Graph BFS/DFS': '⬡',
  'Greedy': '↗',
  'Backtracking': '↺',
  'Monotonic Stack': '▲',
  'Heap/Priority Queue': '◉',
  'Hash Map': '#',
}

export default function PatternSelector({
  selected,
  onSelect,
}: {
  selected: Pattern | null
  onSelect: (p: Pattern) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ALL_PATTERNS.map(p => (
        <button
          key={p}
          onClick={() => onSelect(p)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
            selected === p
              ? 'bg-accent-violet/15 border-accent-violet/40 text-accent-violet2 glow-border'
              : 'bg-bg-secondary border-border-dim text-gray-400 hover:border-border-mid hover:text-gray-200'
          }`}
        >
          <span className="text-base w-5 text-center opacity-70">{PATTERN_ICONS[p]}</span>
          <span>{p}</span>
        </button>
      ))}
    </div>
  )
}
