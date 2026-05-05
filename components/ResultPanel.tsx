'use client'

import { useState } from 'react'
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

const VERDICT_CONFIG = {
  strong: { color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/25', label: 'Strong Signal', icon: '◆' },
  acceptable: { color: 'text-accent-amber', bg: 'bg-accent-amber/10 border-accent-amber/25', label: 'Acceptable', icon: '◈' },
  weak: { color: 'text-accent-red', bg: 'bg-accent-red/10 border-accent-red/25', label: 'Weak Signal', icon: '◇' },
}

type Tab = 'overview' | 'approaches' | 'recruiter' | 'practice'

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
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [expandedApproach, setExpandedApproach] = useState<number>(0)
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  const guessWasMade = !!userGuess
  const isCorrect = userGuess === result.pattern
  const verdict = result.recruiterInsight?.verdict || 'acceptable'
  const verdictCfg = VERDICT_CONFIG[verdict]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'analysis' },
    { id: 'approaches', label: 'solutions' },
    { id: 'recruiter', label: 'interview lens' },
    { id: 'practice', label: 'practice next' },
  ]

  function copyTemplate() {
    navigator.clipboard.writeText(result.patternTemplate || '')
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }

  return (
    <div className="space-y-4">

      {/* Guess verdict */}
      {guessWasMade && (
        <div className={`panel p-4 flex items-start gap-3 ${isCorrect ? 'glow-border-green' : 'glow-border-red'}`}>
          <span className={`text-xl mt-0.5 ${isCorrect ? 'text-accent-green' : 'text-accent-red'}`}>
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

      {/* Pattern + difficulty header */}
      <div className="panel p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">pattern</span>
              {result.difficulty && (
                <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[result.difficulty]}`}>
                  {result.difficulty}
                </span>
              )}
            </div>
            <p className="font-mono text-xl font-semibold text-accent-violet2">{result.pattern}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{result.why}</p>
          </div>
        </div>
        {result.keyIntuition && (
          <div className="mt-3 pt-3 border-t border-border-dim">
            <p className="text-xs font-mono text-accent-amber uppercase tracking-widest mb-1.5">key intuition</p>
            <p className="text-sm text-gray-200 leading-relaxed font-medium">{result.keyIntuition}</p>
          </div>
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 panel p-1.5 rounded-lg">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 font-mono text-xs rounded transition-all ${
              activeTab === t.id
                ? 'bg-accent-violet/15 text-accent-violet2 border border-accent-violet/25'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4 animate-fade-in">

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

          {/* Pattern Template */}
          {result.patternTemplate && (
            <div className="panel p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">pattern template</span>
                <button
                  onClick={copyTemplate}
                  className="font-mono text-xs text-gray-600 hover:text-accent-violet2 transition-colors px-2 py-0.5 rounded border border-border-dim hover:border-accent-violet/25"
                >
                  {copiedTemplate ? '✓ copied' : 'copy'}
                </button>
              </div>
              <pre className="text-sm font-mono text-gray-300 leading-relaxed bg-bg-primary/50 rounded p-3 overflow-x-auto whitespace-pre-wrap border border-border-dim">
                {result.patternTemplate}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab: Approaches */}
      {activeTab === 'approaches' && (
        <div className="space-y-3 animate-fade-in">
          {(result.approaches || []).map((approach, i) => {
            const isOptimal = approach.name === result.optimalApproach
            const isExpanded = expandedApproach === i
            return (
              <div
                key={i}
                className={`panel rounded-lg overflow-hidden ${isOptimal ? 'glow-border' : ''}`}
              >
                <button
                  onClick={() => setExpandedApproach(isExpanded ? -1 : i)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm font-semibold ${isOptimal ? 'text-accent-violet2' : 'text-gray-300'}`}>
                      {approach.name}
                    </span>
                    {isOptimal && (
                      <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-accent-violet/15 text-accent-violet2 border border-accent-violet/25">
                        optimal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs text-accent-green">{approach.timeComplexity}</span>
                    <span className="font-mono text-xs text-gray-600">{approach.spaceComplexity} space</span>
                    <span className={`text-gray-600 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border-dim pt-4 animate-fade-in">
                    <div>
                      <p className="text-xs font-mono text-gray-600 mb-1">core idea</p>
                      <p className="text-sm text-gray-300">{approach.idea}</p>
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-600 mb-1">when to use this</p>
                      <p className="text-sm text-gray-400">{approach.whenToUse}</p>
                    </div>
                    {approach.steps && approach.steps.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-gray-600 mb-2">step-by-step</p>
                        <div className="space-y-2">
                          {approach.steps.map((step, si) => (
                            <div key={si} className="flex gap-3">
                              <span className="font-mono text-xs text-accent-violet2 w-5 shrink-0 mt-0.5">{step.step}.</span>
                              <div className="space-y-1 flex-1">
                                <p className="text-sm font-medium text-gray-200">{step.title}</p>
                                <p className="text-xs text-gray-500">{step.detail}</p>
                                {step.code && (
                                  <pre className="text-xs font-mono text-gray-400 bg-bg-primary/50 rounded p-2 mt-1 border border-border-dim overflow-x-auto">
                                    {step.code}
                                  </pre>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-mono text-gray-600 mb-1">tradeoffs</p>
                      <p className="text-sm text-gray-400">{approach.tradeoffs}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Recruiter / Interview Lens */}
      {activeTab === 'recruiter' && result.recruiterInsight && (
        <div className="space-y-4 animate-fade-in">

          <div className={`panel p-4 border ${verdictCfg.bg} space-y-2`}>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold ${verdictCfg.color}`}>
                {verdictCfg.icon} {verdictCfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{result.recruiterInsight.summary}</p>
          </div>

          <div className="panel p-4 space-y-3">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">what interviewers watch for</p>
            <div className="space-y-2">
              {(result.recruiterInsight.whatInterviewerLooksFor || []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-accent-green text-xs mt-1 shrink-0">✓</span>
                  <p className="text-sm text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4 space-y-3">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">common mistakes</p>
            <div className="space-y-2">
              {(result.recruiterInsight.commonMistakes || []).map((m, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-accent-red text-xs mt-1 shrink-0">✗</span>
                  <p className="text-sm text-gray-400">{m}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-4 space-y-3">
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">edge cases to mention</p>
            <div className="flex flex-wrap gap-2">
              {(result.recruiterInsight.edgeCases || []).map((e, i) => (
                <span key={i} className="font-mono text-xs px-2 py-1 rounded bg-accent-red/5 text-accent-red/80 border border-accent-red/15">
                  {e}
                </span>
              ))}
            </div>
          </div>

          {result.recruiterInsight.optimalFollowUp && (
            <div className="panel p-4 space-y-2 border border-accent-amber/20">
              <p className="text-xs font-mono text-accent-amber uppercase tracking-widest">separator question</p>
              <p className="text-sm text-gray-200">{result.recruiterInsight.optimalFollowUp}</p>
            </div>
          )}

          {result.recruiterInsight.interviewTip && (
            <div className="panel p-4 space-y-2 border border-accent-blue/20">
              <p className="text-xs font-mono text-accent-blue uppercase tracking-widest">interview tip</p>
              <p className="text-sm text-gray-300 italic leading-relaxed">"{result.recruiterInsight.interviewTip}"</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Practice Next */}
      {activeTab === 'practice' && (
        <div className="space-y-4 animate-fade-in">

          {result.similar && (
            <div className="panel p-4 space-y-3">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">similar problems</p>
              <div className="space-y-3">
                {result.similar.map((p, i) => (
                  <div key={i} className="panel-bright p-3 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                      {p.leetcodeNumber && (
                        <span className="font-mono text-xs text-gray-700">#{p.leetcodeNumber}</span>
                      )}
                      <span className="font-mono text-sm text-gray-200 font-medium">{p.title}</span>
                    </div>
                    <p className="text-xs text-gray-500">{p.reason}</p>
                    {p.keyDifference && (
                      <div className="flex gap-1.5">
                        <span className="text-accent-amber text-xs shrink-0 mt-0.5">△</span>
                        <p className="text-xs text-accent-amber/80">{p.keyDifference}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.followUpVariants && result.followUpVariants.length > 0 && (
            <div className="panel p-4 space-y-3">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">interviewer follow-ups</p>
              <p className="text-xs text-gray-700 font-mono">variants they'll use to probe deeper</p>
              <div className="space-y-2">
                {result.followUpVariants.map((v, i) => (
                  <div key={i} className="flex gap-2 panel-bright p-3 rounded-lg">
                    <span className="font-mono text-xs text-gray-700 shrink-0">{i + 1}.</span>
                    <p className="text-sm text-gray-300">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
