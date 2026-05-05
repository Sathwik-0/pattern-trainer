import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pattern Trainer — Train DSA Pattern Recognition',
  description: 'Train your brain to recognize DSA patterns, not just solve problems.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen grid-bg">{children}</body>
    </html>
  )
}
