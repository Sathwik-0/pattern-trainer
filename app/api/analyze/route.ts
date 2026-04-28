import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are an elite DSA coach specializing in LeetCode pattern recognition.

Given a LeetCode problem, return ONLY valid JSON — no markdown, no preamble, no explanation outside the JSON.

Return exactly this shape:
{
  "pattern": "<one of: Sliding Window | Two Pointers | Binary Search | Dynamic Programming | Graph BFS/DFS | Greedy | Backtracking | Monotonic Stack | Heap/Priority Queue | Hash Map>",
  "why": "<2-3 sentence explanation of why this pattern fits>",
  "signals": ["<exact phrase from problem that signals this pattern>", "<another signal phrase>", "<another>"],
  "similar": [
    {"title": "<LeetCode problem name>", "difficulty": "Easy", "reason": "<why it uses same pattern>"},
    {"title": "<LeetCode problem name>", "difficulty": "Medium", "reason": "<why>"},
    {"title": "<LeetCode problem name>", "difficulty": "Hard", "reason": "<why>"}
  ],
  "guessExplanation": "<if userGuess provided: if correct reinforce with WHY; if wrong explain what they missed and what signals they overlooked. Be direct and surgical. If no guess, return empty string.>",
  "highlightedText": "<copy the problem text back, but wrap each signal phrase with [SIGNAL]...[/SIGNAL] tags so they can be highlighted>"
}`

export async function POST(req: NextRequest) {
  try {
    const { problemText, userGuess, confidence } = await req.json()

    if (!problemText?.trim()) {
      return NextResponse.json({ error: 'Problem text is required' }, { status: 400 })
    }

    const userContent = userGuess
      ? `Problem:\n${problemText}\n\nUser guessed: ${userGuess} (confidence: ${confidence}%)`
      : `Problem:\n${problemText}`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 1200,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    const raw = data.choices[0].message.content
    const clean = raw.replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: 'Failed to analyze problem' }, { status: 500 })
  }
}
