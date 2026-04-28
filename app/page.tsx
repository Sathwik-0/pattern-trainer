'use client'

import { useState, useEffect } from 'react'
import { getUserId } from '@/lib/userId'
import { ALL_PATTERNS, type Pattern, type AnalysisResult } from '@/types'
import PatternSelector from '@/components/PatternSelector'
import ResultPanel from '@/components/ResultPanel'
import StatsPanel from '@/components/StatsPanel'
import DailyChallenge from '@/components/DailyChallenge'
import ReviewQueue from '@/components/ReviewQueue'
import Nav from '@/components/Nav'

type Mode = 'train' | 'stats' | 'daily'
type Step = 'input' | 'guess' | 'result'

export default function Home() {
  const [mode, setMode] = useState<Mode>('train')
  const [step, setStep] = useState<Step>('input')
  const [problemText, setProblemText] = useState('')
  const [userGuess, setUserGuess] = useState<Pattern | null>(null)
  const [confidence, setConfidence] = useState<number>(50)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [guessMode, setGuessMode] = useState(true)
  const [userId, setUserId] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setUserId(getUserId())
  }, [])

  async function handleAnalyze() {
    if (!problemText.trim()) return
    if (guessMode && step === 'input') {
      setStep('guess')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemText, userGuess, confidence }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setStep('result')

      // Auto-save
      const isCorrect = userGuess ? userGuess === data.pattern : null
      await fetch('/api/save-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          problemText,
          correctPattern: data.pattern,
          guessedPattern: userGuess,
          confidence: userGuess ? confidence : null,
          isCorrect,
          signals: data.signals,
          explanation: data.why,
          guessExplanation: data.guessExplanation,
          similarProblems: data.similar,
        }),
      })
      setSaved(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setProblemText('')
    setUserGuess(null)
    setConfidence(50)
    setResult(null)
    setStep('input')
    setSaved(false)
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Nav mode={mode} setMode={setMode} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">

        {mode === 'train' && (
          <div className="space-y-6 animate-fade-in">

            {/* Header */}
            <div className="space-y-1">
              <h1 className="font-mono text-2xl font-semibold text-white tracking-tight">
                pattern<span className="text-accent-violet">_</span>trainer
              </h1>
              <p className="text-sm text-gray-500 font-mono">
                train recognition, not memorization
              </p>
            </div>

            {/* Guess mode toggle */}
            {step === 'input' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuessMode(!guessMode)}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${guessMode ? 'bg-accent-violet' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${guessMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm font-mono text-gray-400">
                  guess-first mode {guessMode ? <span className="text-accent-violet">ON</span> : <span className="text-gray-600">OFF</span>}
                </span>
              </div>
            )}

            {/* Step: Input */}
            {step === 'input' && (
              <div className="space-y-4 animate-slide-up">
                <div className="panel p-4 space-y-3">
                  <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">
                    paste problem
                  </label>
                  <textarea
                    value={problemText}
                    onChange={e => setProblemText(e.target.value)}
                    placeholder="Given an array of integers nums and an integer k, return the maximum sum of any contiguous subarray of size k..."
                    className="w-full h-48 bg-transparent text-sm font-mono text-gray-200 placeholder-gray-700 resize-none outline-none leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={!problemText.trim()}
                  className="w-full py-3 font-mono text-sm font-medium bg-accent-violet/10 border border-accent-violet/30 text-accent-violet2 rounded-lg hover:bg-accent-violet/20 hover:border-accent-violet/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed glow-border"
                >
                  {guessMode ? '→ identify pattern first' : '→ analyze problem'}
                </button>
                {error && <p className="text-accent-red text-sm font-mono">{error}</p>}
              </div>
            )}

            {/* Step: Guess */}
            {step === 'guess' && (
              <div className="space-y-5 animate-slide-up">
                <div className="panel p-4">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">problem</p>
                  <p className="text-sm font-mono text-gray-300 leading-relaxed">{problemText}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">which pattern is this?</p>
                  <PatternSelector selected={userGuess} onSelect={setUserGuess} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">confidence</p>
                    <span className="text-sm font-mono text-accent-violet">{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min={25} max={100} step={25}
                    value={confidence}
                    onChange={e => setConfidence(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs font-mono text-gray-700">
                    <span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    className="px-4 py-2.5 font-mono text-sm text-gray-500 border border-border-dim rounded-lg hover:border-border-mid transition-colors"
                  >
                    ← back
                  </button>
                  <button
                    onClick={handleAnalyze}
                    disabled={!userGuess || loading}
                    className="flex-1 py-2.5 font-mono text-sm font-medium bg-accent-violet/10 border border-accent-violet/30 text-accent-violet2 rounded-lg hover:bg-accent-violet/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loading ? 'analyzing...' : '→ reveal answer'}
                  </button>
                </div>
                {error && <p className="text-accent-red text-sm font-mono">{error}</p>}
              </div>
            )}

            {/* Step: Result */}
            {step === 'result' && result && (
              <div className="animate-slide-up">
                <ResultPanel
                  result={result}
                  userGuess={userGuess}
                  confidence={confidence}
                  originalText={problemText}
                  onReset={handleReset}
                />
              </div>
            )}

          </div>
        )}

        {mode === 'stats' && (
          <div className="animate-fade-in space-y-6">
            <div className="space-y-1">
              <h1 className="font-mono text-2xl font-semibold text-white tracking-tight">
                your<span className="text-accent-violet">_</span>profile
              </h1>
              <p className="text-sm text-gray-500 font-mono">weakness analysis + pattern mastery</p>
            </div>
            <ReviewQueue userId={userId} />
            <StatsPanel userId={userId} />
          </div>
        )}

        {mode === 'daily' && (
          <div className="animate-fade-in space-y-6">
            <div className="space-y-1">
              <h1 className="font-mono text-2xl font-semibold text-white tracking-tight">
                daily<span className="text-accent-violet">_</span>challenge
              </h1>
              <p className="text-sm text-gray-500 font-mono">one problem every day. keep the streak alive.</p>
            </div>
            <DailyChallenge userId={userId} />
          </div>
        )}

      </main>
    </div>
  )
}
