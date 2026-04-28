'use client'

import { type AnalysisResult, type Pattern } from '@/types'

function renderHighlighted(text: string) {
  const parts = text.split(/(\[SIGNAL\].*?\[\/SIGNAL\])/g)
  return parts.map((part, i) => {
    const match = part.match(/\[SIGNAL\](.*?)\[\/SIGNAL\]/)
    if (match) {
      return <mark key={i} className="signal-highlight not-italic">{match[1]}</mark>
    }
    return <span key={i}>{part}</span>
  })
}

const DIFFICULTY_COLORS = {
  Easy: 'text-accent-green border-accent-green/30 bg-accent-green/10',
  Medium: 'text-accent-amber border-accent-amber/30 bg-accent-amber/10',
  Hard: 'text-accent-red border-accent-red/30 bg-accent-red/10',
}

export default function ResultPanel({
  result,
  userGuess,
  confidence,
  originalText,
  onReset,
}: {
  result: AnalysisResult
  userGuess: Pattern | null
  confidence: number
  originalText: string
  onReset: () => void
}) {
  const guessWasMade = !!userGuess
  const isCorrect = userGuess === result.pattern

  return (
    <div className="space-y-4">

      {/* Guess verdict */}
      {guessWasMade && (
        <div className={`panel p-4 flex items-start gap-3 ${isCorrect ? 'glow-border-green' : 'glow-border-red'}`}>
          <span className={`text-xl ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
            {isCorrect ? '✓' : '✗'}
          </span>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-mono text-sm font-medium ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
                {isCorrect ? 'correct' : 'incorrect'}
              </span>
              <span className="font-mono text-xs text-gray-600">@{confidence}% confidence</span>
              {!isCorrect && confidence >= 75 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent-red/10 text-accent-red border border-accent-red/20">
                  ⚠ dangerous blind spot
                </span>
              )}
              {isCorrect && confidence <= 25 && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                  shaky — needs reinforcement
                </span>
              )}
            </div>
            {result.guessExplanation && (
              <p className="text-sm text-gray-400 leading-relaxed">{result.guessExplanation}</p>
            )}
          </div>
        </div>
      )}

      {/* Pattern */}
      <div className="panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">pattern</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xl font-semibold text-accent-violet2">{result.pattern}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{result.why}</p>
      </div>

      {/* Signal Fingerprint */}
      <div className="panel p-4 space-y-3">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">signal fingerprint</span>
        <div className="text-sm font-mono text-gray-400 leading-relaxed">
          {renderHighlighted(result.highlightedText || originalText)}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {result.signals.map((s, i) => (
            <span key={i} className="font-mono text-xs px-2 py-1 rounded bg-accent-violet/10 text-accent-violet2 border border-accent-violet/20">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Similar Problems */}
      <div className="panel p-4 space-y-3">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">next problems</span>
        <div className="space-y-2">
          {result.similar.map((p, i) => (
            <div key={i} className="flex items-start gap-3 panel-bright p-3">
              <span className={`font-mono text-xs px-1.5 py-0.5 rounded border shrink-0 ${DIFFICULTY_COLORS[p.difficulty]}`}>
                {p.difficulty}
              </span>
              <div className="space-y-0.5">
                <p className="text-sm font-mono text-gray-200">{p.title}</p>
                <p className="text-xs text-gray-500">{p.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full py-3 font-mono text-sm text-gray-500 border border-border-dim rounded-lg hover:border-border-mid hover:text-gray-300 transition-all"
      >
        ← train next problem
      </button>
    </div>
  )
}
