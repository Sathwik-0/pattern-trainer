'use client'

type Mode = 'train' | 'stats' | 'daily'

export default function Nav({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const tabs: { id: Mode; label: string }[] = [
    { id: 'train', label: 'train' },
    { id: 'daily', label: 'daily' },
    { id: 'stats', label: 'stats' },
  ]

  return (
    <nav className="border-b border-border-dim bg-bg-primary/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-mono text-sm font-semibold text-white">
          pt<span className="text-accent-violet">.</span>dev
        </span>
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`px-3 py-1.5 font-mono text-xs rounded-md transition-all ${
                mode === t.id
                  ? 'bg-accent-violet/15 text-accent-violet2 border border-accent-violet/25'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
