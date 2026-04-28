'use client'

import { useEffect, useState } from 'react'
import { ALL_PATTERNS, type Pattern } from '@/types'
import PatternSelector from './PatternSelector'

interface Challenge {
  id: string
  challenge_date: string
  problem_text: string
  correct_pattern: string
}

export default function DailyChallenge({ userId }: { userId: string }) {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [guess, setGuess] = useState<Pattern | null>(null)
  const [confidence, setConfidence] = useState(50)
  const [revealed, setRevealed] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<{ why: string; guessExplanation: string; signals: string[] } | null>(null)

  const todayKey = `pt_daily_${new Date().toISOString().split('T')[0]}`

  useEffect(() => {
    const done = localStorage.getItem(todayKey)
    if (done) setRevealed(true)

    fetch('/api/daily-challenge')
      .then(r => r.json())
      .then(d => { setChallenge(d); setLoading(false) })
  }, [])

  async function handleReveal() {
    if (!challenge || !guess) return
    setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: challenge.problem_text,
          userGuess: guess,
          confidence,
        }),
      })
      const data = await res.json()
      setResult(data)
      setRevealed(true)
      localStorage.setItem(todayKey, '1')

      const isCorrect = guess === challenge.correct_pattern
      await fetch('/api/save-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          problemText: challenge.problem_text,
          correctPattern: challenge.correct_pattern,
          guessedPattern: guess,
          confidence,
          isCorrect,
          signals: data.signals || [],
          explanation: data.why,
          guessExplanation: data.guessExplanation,
          similarProblems: data.similar || [],
        }),
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) return (
    <div className="panel p-6 text-center font-mono text-sm text-gray-600 animate-pulse-slow">
      loading today's challenge...
    </div>
  )

  if (!challenge) return null

  const isCorrect = guess === challenge.correct_pattern

  return (
    <div className="space-y-4">
      <div className="panel p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">today's problem</span>
          <span className="font-mono text-xs text-gray-600">{challenge.challenge_date}</span>
        </div>
        <p className="text-sm font-mono text-gray-300 leading-relaxed">{challenge.problem_text}</p>
      </div>

      {!revealed && (
        <div className="space-y-4">
          <PatternSelector selected={guess} onSelect={setGuess} />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">confidence</span>
              <span className="font-mono text-xs text-accent-violet">{confidence}%</span>
            </div>
            <input type="range" min={25} max={100} step={25} value={confidence}
              onChange={e => setConfidence(Number(e.target.value))}
              className="w-full accent-violet-500" />
          </div>
          <button
            onClick={handleReveal}
            disabled={!guess || analyzing}
            className="w-full py-3 font-mono text-sm font-medium bg-accent-violet/10 border border-accent-violet/30 text-accent-violet2 rounded-lg hover:bg-accent-violet/20 transition-all disabled:opacity-30"
          >
            {analyzing ? 'analyzing...' : '→ reveal answer'}
          </button>
        </div>
      )}

      {revealed && (
        <div className="space-y-3 animate-slide-up">
          <div className={`panel p-4 flex items-center gap-3 ${isCorrect ? 'glow-border-green' : 'glow-border-red'}`}>
            <span className={`text-xl ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
              {isCorrect ? '✓' : '✗'}
            </span>
            <div>
              <p className={`font-mono text-sm font-medium ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
                {isCorrect ? 'correct!' : 'incorrect'}
              </p>
              <p className="font-mono text-xs text-gray-500">
                answer: <span className="text-accent-violet2">{challenge.correct_pattern}</span>
              </p>
            </div>
          </div>
          {result?.guessExplanation && (
            <div className="panel p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{result.guessExplanation}</p>
            </div>
          )}
          <div className="panel p-4 text-center">
            <p className="font-mono text-xs text-gray-600">come back tomorrow for the next challenge</p>
          </div>
        </div>
      )}
    </div>
  )
}
