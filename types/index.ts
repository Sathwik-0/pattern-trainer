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

export interface AnalysisResult {
  pattern: Pattern
  why: string
  signals: string[]
  similar: { title: string; difficulty: 'Easy' | 'Medium' | 'Hard'; reason: string }[]
  guessExplanation: string
  highlightedText: string
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
