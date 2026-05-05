// Simple spaced repetition intervals in days
// review_count: 0→1d, 1→3d, 2→7d, 3→14d, 4+→30d
export function nextReviewDate(reviewCount: number): Date {
  const intervals = [1, 3, 7, 14, 30]
  const days = intervals[Math.min(reviewCount, intervals.length - 1)]
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}

export function isDueForReview(nextReviewAt: string | null): boolean {
  if (!nextReviewAt) return false
  return new Date(nextReviewAt) <= new Date()
}
