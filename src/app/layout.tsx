import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interview Simulator — AI-Powered Practice',
  description:
    'Practice behavioral, case, and situational interview questions with AI-powered feedback tailored to your background and target role.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  )
}
