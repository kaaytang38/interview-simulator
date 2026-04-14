'use client'

import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = 'behavioral' | 'case' | 'situational'
type Difficulty = 'easy' | 'medium' | 'hard'
type AnswerMode = 'freeform' | 'multiple-choice'
type AppView = 'landing' | 'setup' | 'loading' | 'question' | 'submitting' | 'feedback'

interface UserProfile {
  name: string
  industry: string
  experienceLevel: string
  targetRole: string
  skills: string
}

interface SetupConfig {
  questionType: QuestionType
  difficulty: Difficulty
  jobDescription: string
  userProfile: UserProfile
}

interface QuestionData {
  question: string
  context: string
  tips: string
  multipleChoiceOptions: string[]
}

interface STARAnalysis {
  situation: string
  task: string
  action: string
  result: string
  missing: string[]
}

interface FeedbackData {
  overallScore: number
  grade: string
  strengths: string[]
  improvements: string[]
  starAnalysis?: STARAnalysis | null
  detailedFeedback: string
  keyTakeaway: string
}

// ─── Shared UI pieces ─────────────────────────────────────────────────────────

function Spinner({ size = 10 }: { size?: number }) {
  return (
    <div
      className={`w-${size} h-${size} border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}
    />
  )
}

function TopBar({
  right,
  title = 'Interview Simulator',
}: {
  right?: React.ReactNode
  title?: string
}) {
  return (
    <div className="border-b border-slate-800 px-4 py-3.5 sticky top-0 z-10 bg-slate-950/90 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-500/20 rounded-lg flex items-center justify-center text-base">
            🎯
          </div>
          <span className="font-semibold text-white text-sm">{title}</span>
        </div>
        {right}
      </div>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 42
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 10) * circ
  const color =
    score >= 8 ? '#10b981' : score >= 6 ? '#6366f1' : score >= 4 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white leading-none">{score}</span>
        <span className="text-xs text-slate-400 mt-0.5">/ 10</span>
      </div>
    </div>
  )
}

// ─── Landing View ─────────────────────────────────────────────────────────────

function LandingView({ onStart }: { onStart: () => void }) {
  const features = [
    {
      icon: '🧠',
      title: 'AI-Generated Questions',
      desc: 'Questions tailored to your industry, role, and experience — or paste a job description for pinpoint accuracy.',
    },
    {
      icon: '✍️',
      title: 'Two Answer Modes',
      desc: 'Write a free-form response for full practice, or pick from multiple-choice options to compare answer quality.',
    },
    {
      icon: '📊',
      title: 'Deep AI Feedback',
      desc: 'Get scored, graded, and coached on strengths vs. gaps. Behavioral answers also get STAR framework analysis.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-4xl mb-8 shadow-xl shadow-indigo-500/10">
          🎯
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight">
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            Interview Simulator
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-xl mb-10 leading-relaxed">
          Practice behavioral, case, and situational interview questions with
          <span className="text-slate-200"> AI-powered feedback</span> personalized to your
          background and target role.
        </p>

        <button
          onClick={onStart}
          className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl text-white font-semibold text-lg hover:from-indigo-400 hover:to-violet-400 transition-all duration-200 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Practicing →
        </button>

        <p className="mt-4 text-sm text-slate-500">No sign-up required · Questions generated fresh each time</p>
      </div>

      {/* Features */}
      <div className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 hover:border-slate-600/60 transition-colors"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Setup View ───────────────────────────────────────────────────────────────

function SetupView({
  setup,
  onChange,
  onGenerate,
  onBack,
}: {
  setup: SetupConfig
  onChange: (s: SetupConfig) => void
  onGenerate: () => void
  onBack: () => void
}) {
  const [showProfile, setShowProfile] = useState(false)
  const [showJobDesc, setShowJobDesc] = useState(!!setup.jobDescription)
  const [urlInput, setUrlInput] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)

  async function handleFetchUrl() {
    if (!urlInput.trim()) return
    setFetchingUrl(true)
    setUrlError(null)
    try {
      const res = await fetch('/api/fetch-job-desc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onChange({ ...setup, jobDescription: data.text })
    } catch (e) {
      setUrlError(e instanceof Error ? e.message : 'Failed to fetch URL')
    } finally {
      setFetchingUrl(false)
    }
  }

  const questionTypes: { id: QuestionType; icon: string; label: string; desc: string }[] = [
    {
      id: 'behavioral',
      icon: '⭐',
      label: 'Behavioral',
      desc: 'Tell me about a time when… (STAR method)',
    },
    {
      id: 'case',
      icon: '🔍',
      label: 'Case Study',
      desc: 'Analytical and open-ended problem solving',
    },
    {
      id: 'situational',
      icon: '💡',
      label: 'Situational',
      desc: 'Hypothetical "what would you do?" scenarios',
    },
  ]

  const difficulties: { id: Difficulty; label: string; ring: string; pill: string }[] = [
    {
      id: 'easy',
      label: 'Easy',
      ring: 'border-emerald-500',
      pill: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400',
    },
    {
      id: 'medium',
      label: 'Medium',
      ring: 'border-amber-500',
      pill: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
    },
    {
      id: 'hard',
      label: 'Hard',
      ring: 'border-rose-500',
      pill: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
    },
  ]

  const profileFields: { key: keyof UserProfile; label: string; placeholder: string }[] = [
    { key: 'name', label: 'Your Name', placeholder: 'e.g., Alex Chen' },
    { key: 'targetRole', label: 'Target Role', placeholder: 'e.g., Product Manager' },
    { key: 'industry', label: 'Industry', placeholder: 'e.g., Tech, Finance, Healthcare' },
    {
      key: 'experienceLevel',
      label: 'Experience Level',
      placeholder: 'e.g., 3 years, Senior, Entry-level',
    },
  ]

  return (
    <div className="min-h-screen">
      <TopBar
        right={
          <button
            onClick={onBack}
            className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </button>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-7">
        <div>
          <h2 className="text-2xl font-bold text-white">Set Up Your Session</h2>
          <p className="text-slate-400 mt-1 text-sm">Customize your interview practice</p>
        </div>

        {/* Question Type */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Question Type
          </label>
          <div className="space-y-2.5">
            {questionTypes.map((qt) => {
              const selected = setup.questionType === qt.id
              return (
                <button
                  key={qt.id}
                  onClick={() => onChange({ ...setup, questionType: qt.id })}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{qt.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{qt.label}</div>
                    <div className="text-sm text-slate-400">{qt.desc}</div>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Difficulty */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Difficulty
          </label>
          <div className="flex gap-3">
            {difficulties.map((d) => {
              const selected = setup.difficulty === d.id
              return (
                <button
                  key={d.id}
                  onClick={() => onChange({ ...setup, difficulty: d.id })}
                  className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-all ${
                    selected
                      ? `${d.ring} ${d.pill}`
                      : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* Job Description accordion */}
        <section className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowJobDesc((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📋</span>
              <div>
                <div className="text-sm font-medium text-white">Job Description</div>
                <div className="text-xs text-slate-400">
                  {setup.jobDescription ? 'Added ✓' : 'Optional — paste for targeted questions'}
                </div>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${showJobDesc ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showJobDesc && (
            <div className="px-4 pb-4 space-y-3">
              {/* URL fetch row */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste a job posting URL to auto-fill…"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setUrlError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={!urlInput.trim() || fetchingUrl}
                  className="px-3 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 flex-shrink-0"
                >
                  {fetchingUrl ? (
                    <>
                      <Spinner size={3} />
                      Fetching…
                    </>
                  ) : (
                    '⬇ Fetch'
                  )}
                </button>
              </div>
              {urlError && (
                <p className="text-xs text-rose-400 flex items-start gap-1.5">
                  <span className="flex-shrink-0">⚠️</span>
                  {urlError}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="flex-1 h-px bg-slate-700/50" />
                or paste text directly
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>
              <textarea
                rows={4}
                placeholder="Paste a job description or describe the role (e.g., 'Infrastructure PE Associate at Brookfield, focused on energy transition assets')…"
                value={setup.jobDescription}
                onChange={(e) => onChange({ ...setup, jobDescription: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          )}
        </section>

        {/* User Profile accordion */}
        <section className="bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">👤</span>
              <div>
                <div className="text-sm font-medium text-white">Your Profile</div>
                <div className="text-xs text-slate-400">Optional — personalizes questions & feedback</div>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-slate-400 transition-transform ${showProfile ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showProfile && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-3">
              {profileFields.map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-slate-400 mb-1 block">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={setup.userProfile[f.key]}
                    onChange={(e) =>
                      onChange({
                        ...setup,
                        userProfile: { ...setup.userProfile, [f.key]: e.target.value },
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-slate-400 mb-1 block">Key Skills</label>
                <input
                  type="text"
                  placeholder="e.g., Python, data analysis, cross-functional leadership"
                  value={setup.userProfile.skills}
                  onChange={(e) =>
                    onChange({
                      ...setup,
                      userProfile: { ...setup.userProfile, skills: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}
        </section>

        <button
          onClick={onGenerate}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl text-white font-semibold text-base hover:from-indigo-400 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99]"
        >
          Generate Question →
        </button>
      </div>
    </div>
  )
}

// ─── Question View ────────────────────────────────────────────────────────────

function QuestionView({
  question,
  questionType,
  difficulty,
  answer,
  answerMode,
  onAnswerChange,
  onModeChange,
  onSubmit,
  onBack,
  questionCount,
  submitting,
}: {
  question: QuestionData
  questionType: QuestionType
  difficulty: Difficulty
  answer: string
  answerMode: AnswerMode
  onAnswerChange: (a: string) => void
  onModeChange: (m: AnswerMode) => void
  onSubmit: () => void
  onBack: () => void
  questionCount: number
  submitting: boolean
}) {
  const [showTips, setShowTips] = useState(false)

  const difficultyPill: Record<Difficulty, string> = {
    easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    hard: 'text-rose-400 bg-rose-400/10 border-rose-400/30',
  }

  const typeLabel: Record<QuestionType, string> = {
    behavioral: 'Behavioral',
    case: 'Case Study',
    situational: 'Situational',
  }

  const canSubmit = answer.trim().length > 0 && !submitting

  return (
    <div className="min-h-screen">
      <TopBar
        right={
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md border text-xs font-medium ${difficultyPill[difficulty]}`}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
            <span className="px-2 py-0.5 rounded-md border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium">
              {typeLabel[questionType]}
            </span>
            <span className="text-slate-500 text-xs">#{questionCount}</span>
          </div>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Question card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
              💬
            </div>
            <p className="text-white text-[1.05rem] leading-relaxed font-medium pt-0.5">
              {question.question}
            </p>
          </div>

          <button
            onClick={() => setShowTips((v) => !v)}
            className="mt-4 ml-11 flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showTips ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showTips ? 'Hide' : 'Show'} tips &amp; context
          </button>

          {showTips && (
            <div className="mt-4 ml-11 pl-4 border-l-2 border-indigo-500/30 space-y-3">
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                  Why this is asked
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{question.context}</p>
              </div>
              <div>
                <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">
                  Tips
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{question.tips}</p>
              </div>
            </div>
          )}
        </div>

        {/* Answer mode tabs */}
        <div className="flex bg-slate-800/50 border border-slate-700/50 rounded-xl p-1 gap-1">
          {(['freeform', 'multiple-choice'] as AnswerMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                onModeChange(mode)
                onAnswerChange('')
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                answerMode === mode ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'freeform' ? '✍️  Write Answer' : '🎯  Multiple Choice'}
            </button>
          ))}
        </div>

        {/* Answer input */}
        {answerMode === 'freeform' ? (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Your Answer</label>
              {questionType === 'behavioral' && (
                <span className="text-xs text-slate-500">Try the STAR format</span>
              )}
            </div>
            <textarea
              rows={8}
              placeholder={
                questionType === 'behavioral'
                  ? 'Situation: Set the scene…\nTask: Describe your responsibility…\nAction: Explain what you did…\nResult: Share the outcome…'
                  : 'Write your answer here…'
              }
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 text-sm leading-relaxed resize-none focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {answer.length > 0 ? `${answer.trim().split(/\s+/).length} words` : 'Start typing your answer'}
              </span>
              <span className="text-xs text-slate-600">{answer.length} chars</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">
              Select the best approach to answering this question:
            </label>
            {question.multipleChoiceOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => onAnswerChange(opt)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  answer === opt
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700/50 bg-slate-800/20 hover:border-slate-600 hover:bg-slate-800/40'
                }`}
              >
                <p className="text-slate-200 text-sm leading-relaxed">{opt}</p>
              </button>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl text-white font-semibold text-base hover:from-indigo-400 hover:to-violet-400 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:hover:scale-100"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size={5} />
              Analyzing…
            </span>
          ) : (
            'Get Feedback →'
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back to setup
        </button>
      </div>
    </div>
  )
}

// ─── Feedback View ────────────────────────────────────────────────────────────

function FeedbackView({
  feedback,
  questionType,
  question,
  answer,
  onNextQuestion,
  onNewSetup,
  loadingNext,
}: {
  feedback: FeedbackData
  questionType: QuestionType
  question: QuestionData
  answer: string
  onNextQuestion: () => void
  onNewSetup: () => void
  loadingNext: boolean
}) {
  const gradeColor: Record<string, string> = {
    'A+': 'text-emerald-300',
    A: 'text-emerald-400',
    'A-': 'text-emerald-400',
    'B+': 'text-indigo-300',
    B: 'text-indigo-400',
    'B-': 'text-indigo-400',
    'C+': 'text-amber-300',
    C: 'text-amber-400',
    'C-': 'text-amber-400',
    D: 'text-orange-400',
    F: 'text-rose-400',
  }

  return (
    <div className="min-h-screen">
      <TopBar
        title="Feedback"
        right={
          <button
            onClick={onNewSetup}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            New Setup
          </button>
        }
      />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* Score banner */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 flex items-center gap-6">
          <ScoreRing score={feedback.overallScore} />
          <div className="min-w-0">
            <div className="flex items-baseline gap-3 mb-2">
              <span className={`text-5xl font-bold leading-none ${gradeColor[feedback.grade] ?? 'text-white'}`}>
                {feedback.grade}
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{feedback.keyTakeaway}</p>
          </div>
        </div>

        {/* Strengths */}
        {feedback.strengths?.length > 0 && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              ✅ What You Did Well
            </h3>
            <ul className="space-y-2.5">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-emerald-500 mt-0.5 flex-shrink-0 font-bold">+</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements?.length > 0 && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-amber-400 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              💡 Areas to Improve
            </h3>
            <ul className="space-y-2.5">
              {feedback.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">→</span>
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* STAR Analysis */}
        {questionType === 'behavioral' && feedback.starAnalysis && (
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5">
            <h3 className="font-semibold text-indigo-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              ⭐ STAR Framework Breakdown
            </h3>
            <div className="space-y-4">
              {(
                [
                  { key: 'situation', color: 'violet' },
                  { key: 'task', color: 'indigo' },
                  { key: 'action', color: 'blue' },
                  { key: 'result', color: 'cyan' },
                ] as const
              ).map(({ key, color }) => (
                <div key={key} className="flex gap-3">
                  <div
                    className={`w-6 h-6 rounded bg-${color}-500/20 border border-${color}-500/30 text-${color}-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    {key[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                      {key}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {feedback.starAnalysis![key]}
                    </p>
                  </div>
                </div>
              ))}

              {feedback.starAnalysis.missing?.length > 0 && (
                <div className="pt-3 border-t border-indigo-500/20">
                  <div className="text-xs font-semibold text-rose-400 mb-2">Missing / Weak</div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.starAnalysis.missing.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/30 rounded-full text-rose-300 text-xs"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed feedback */}
        <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
            📝 Detailed Feedback
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {feedback.detailedFeedback}
          </p>
        </div>

        {/* Question asked */}
        <details className="bg-slate-800/20 border border-slate-700/30 rounded-xl group">
          <summary className="px-4 py-3 cursor-pointer text-sm text-slate-500 hover:text-slate-300 transition-colors select-none list-none flex items-center justify-between">
            <span>View the question</span>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4">
            <p className="text-slate-400 text-sm leading-relaxed">{question.question}</p>
          </div>
        </details>

        {/* Your answer */}
        <details className="bg-slate-800/20 border border-slate-700/30 rounded-xl group">
          <summary className="px-4 py-3 cursor-pointer text-sm text-slate-500 hover:text-slate-300 transition-colors select-none list-none flex items-center justify-between">
            <span>View your answer</span>
            <svg
              className="w-4 h-4 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-4">
            <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{answer}</p>
          </div>
        </details>

        {/* Action buttons */}
        <div className="flex gap-3 pt-1 pb-6">
          <button
            onClick={onNewSetup}
            className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 font-medium text-sm hover:border-slate-600 hover:text-white transition-all"
          >
            ← New Setup
          </button>
          <button
            onClick={onNextQuestion}
            disabled={loadingNext}
            className="flex-[2] py-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl text-white font-semibold text-sm hover:from-indigo-400 hover:to-violet-400 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingNext ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={4} />
                Generating…
              </span>
            ) : (
              'Next Question →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-white font-medium">{message}</p>
        <p className="text-slate-500 text-sm">Powered by Claude — this may take a moment</p>
      </div>
    </div>
  )
}

// ─── Error Toast ──────────────────────────────────────────────────────────────

function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-rose-950 border border-rose-500/40 rounded-xl px-4 py-3 shadow-2xl flex items-start gap-3">
        <span className="text-rose-400 text-lg flex-shrink-0">⚠️</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white text-sm">Something went wrong</div>
          <div className="text-rose-300 text-xs mt-0.5 break-words">{message}</div>
        </div>
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-white transition-colors flex-shrink-0 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────

const DEFAULT_SETUP: SetupConfig = {
  questionType: 'behavioral',
  difficulty: 'medium',
  jobDescription: '',
  userProfile: {
    name: 'Katherine',
    industry: 'Infrastructure Private Equity',
    experienceLevel: 'MBA-entry level',
    targetRole: 'Infrastructure PE Associate / Analyst',
    skills: 'LBO analysis, financial modeling, infrastructure asset valuation',
  },
}

export default function App() {
  const [view, setView] = useState<AppView>('landing')
  const [setup, setSetup] = useState<SetupConfig>(DEFAULT_SETUP)
  const [question, setQuestion] = useState<QuestionData | null>(null)
  const [answer, setAnswer] = useState('')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('freeform')
  const [feedback, setFeedback] = useState<FeedbackData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [loadingNext, setLoadingNext] = useState(false)

  async function generateQuestion(fromFeedback = false) {
    if (fromFeedback) {
      setLoadingNext(true)
    } else {
      setView('loading')
    }
    setError(null)

    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setQuestion(data)
      setAnswer('')
      setAnswerMode('freeform')
      setFeedback(null)
      setQuestionCount((n) => n + 1)
      setView('question')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate question')
      if (!fromFeedback) setView('setup')
    } finally {
      setLoadingNext(false)
    }
  }

  async function analyzeAnswer() {
    if (!question) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/analyze-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          answer,
          answerType: answerMode,
          questionType: setup.questionType,
          multipleChoiceOptions: question.multipleChoiceOptions,
          userProfile: setup.userProfile,
          difficulty: setup.difficulty,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setFeedback(data)
      setView('feedback')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze answer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-950 min-h-screen">
      {view === 'landing' && <LandingView onStart={() => setView('setup')} />}

      {view === 'setup' && (
        <SetupView
          setup={setup}
          onChange={setSetup}
          onGenerate={() => generateQuestion(false)}
          onBack={() => setView('landing')}
        />
      )}

      {view === 'loading' && <LoadingScreen message="Generating your question…" />}

      {view === 'question' && question && (
        <QuestionView
          question={question}
          questionType={setup.questionType}
          difficulty={setup.difficulty}
          answer={answer}
          answerMode={answerMode}
          onAnswerChange={setAnswer}
          onModeChange={setAnswerMode}
          onSubmit={analyzeAnswer}
          onBack={() => setView('setup')}
          questionCount={questionCount}
          submitting={submitting}
        />
      )}

      {view === 'feedback' && feedback && question && (
        <FeedbackView
          feedback={feedback}
          questionType={setup.questionType}
          question={question}
          answer={answer}
          onNextQuestion={() => generateQuestion(true)}
          onNewSetup={() => {
            setFeedback(null)
            setQuestion(null)
            setAnswer('')
            setView('setup')
          }}
          loadingNext={loadingNext}
        />
      )}

      {error && <ErrorToast message={error} onDismiss={() => setError(null)} />}
    </div>
  )
}
