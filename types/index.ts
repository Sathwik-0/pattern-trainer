export type Pattern =
  | 'Sliding Window'
  | 'Two Pointers'
  | 'Binary Search'
  | 'Dynamic Programming'
  | 'Graph BFS/DFS'
  | 'Greedy'
  | 'Backtracking'
  | 'Monotonic Stack'
  | 'Heap/Priority Queue'
  | 'Hash Map'

export const ALL_PATTERNS: Pattern[] = [
  'Sliding Window',
  'Two Pointers',
  'Binary Search',
  'Dynamic Programming',
  'Graph BFS/DFS',
  'Greedy',
  'Backtracking',
  'Monotonic Stack',
  'Heap/Priority Queue',
  'Hash Map',
]

export const MASTERY_LABELS = ['Novice', 'Apprentice', 'Practitioner', 'Master']
export const MASTERY_COLORS = ['#888899', '#fbbf24', '#60a5fa', '#22d3a0']

export interface SimilarProblem {
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  reason: string
  keyDifference: string
  leetcodeNumber?: number
}

export interface ApproachStep {
  step: number
  title: string
  detail: string
  code?: string
}

export interface Approach {
  name: string
  timeComplexity: string
  spaceComplexity: string
  idea: string
  whenToUse: string
  steps: ApproachStep[]
  tradeoffs: string
}

export interface RecruiterInsight {
  verdict: 'strong' | 'acceptable' | 'weak'
  summary: string
  whatInterviewerLooksFor: string[]
  commonMistakes: string[]
  optimalFollowUp: string
  edgeCases: string[]
  interviewTip: string
}

export interface AnalysisResult {
  pattern: Pattern
  why: string
  signals: string[]
  similar: SimilarProblem[]
  guessExplanation: string
  highlightedText: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  approaches: Approach[]
  optimalApproach: string
  recruiterInsight: RecruiterInsight
  patternTemplate: string
  keyIntuition: string
  followUpVariants: string[]
}

export interface PatternStat {
  pattern: string
  total_attempts: number
  correct_count: number
  mastery_level: number
  last_seen: string
}

export interface ConfusionEntry {
  correct_pattern: string
  guessed_pattern: string
  count: number
}

export interface Attempt {
  id: string
  problem_text: string
  correct_pattern: string
  guessed_pattern: string | null
  confidence: number | null
  is_correct: boolean | null
  explanation: string
  created_at: string
  next_review_at: string | null
  review_count: number
}
