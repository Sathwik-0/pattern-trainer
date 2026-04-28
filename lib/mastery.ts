// Mastery: 0=Novice, 1=Apprentice, 2=Practitioner, 3=Master
export function calcMasteryLevel(totalAttempts: number, correctCount: number): number {
  if (totalAttempts < 3) return 0
  const accuracy = correctCount / totalAttempts
  if (totalAttempts >= 20 && accuracy >= 0.9) return 3
  if (totalAttempts >= 10 && accuracy >= 0.75) return 2
  if (totalAttempts >= 5 && accuracy >= 0.6) return 1
  return 0
}
