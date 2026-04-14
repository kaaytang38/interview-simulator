import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Allow up to 60s for Vercel Pro; hobby tier caps at 10s
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TYPE_LABELS: Record<string, string> = {
  behavioral: 'STAR-method behavioral question about a past experience',
  case: 'open-ended case study or analytical problem-solving question',
  situational: 'hypothetical situational judgment question ("what would you do if…")',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'straightforward, entry-level appropriate',
  medium: 'moderately complex, mid-level professional appropriate',
  hard: 'highly nuanced and complex, senior/leadership level',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { questionType, difficulty, jobDescription, userProfile } = body

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not configured. Add it to your environment variables.' },
        { status: 500 },
      )
    }

    const profileContext = [
      userProfile?.name && `Name: ${userProfile.name}`,
      userProfile?.targetRole && `Target Role: ${userProfile.targetRole}`,
      userProfile?.industry && `Industry: ${userProfile.industry}`,
      userProfile?.experienceLevel && `Experience Level: ${userProfile.experienceLevel}`,
      userProfile?.skills && `Key Skills: ${userProfile.skills}`,
    ]
      .filter(Boolean)
      .join('\n')

    const jobContext = jobDescription?.trim()
      ? `Tailor this question specifically to this job/role context:\n${jobDescription.slice(0, 600)}`
      : userProfile?.targetRole
        ? `Tailor this question to someone targeting a ${userProfile.targetRole} role.`
        : 'Create a broadly applicable professional interview question.'

    const systemPrompt = `You are an expert interview coach and senior hiring manager with 20+ years of experience across multiple industries.
You craft realistic, insightful interview questions and coaching materials.

${profileContext ? `Candidate profile:\n${profileContext}` : 'No specific candidate profile provided.'}

Always respond with a single valid JSON object — no markdown, no prose, no code fences.`

    const userPrompt = `Generate one ${DIFFICULTY_LABELS[difficulty] || 'medium'} ${TYPE_LABELS[questionType] || 'behavioral'} interview question.

${jobContext}

Return ONLY a JSON object with exactly this structure:
{
  "question": "The full interview question text",
  "context": "1-2 sentences explaining why interviewers ask this and what they are really evaluating",
  "tips": "2-3 specific, actionable tips for answering this question well",
  "multipleChoiceOptions": [
    "A. [A comprehensive, structured, high-quality answer approach — the best choice]",
    "B. [A decent answer that hits some key points but lacks depth or structure]",
    "C. [A surface-level or overly generic answer that misses important elements]",
    "D. [A misguided or off-topic response that reflects a misunderstanding]"
  ]
}

The multiple-choice options should represent different quality levels of answer approaches (not facts), so the user can compare styles.`

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const response = await stream.finalMessage()

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'Model returned no text content' }, { status: 500 })
    }

    // Robustly extract JSON — strip any surrounding prose or code fences
    const raw = textBlock.text.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Model response was not valid JSON' }, { status: 500 })
    }

    const question = JSON.parse(jsonMatch[0])
    return Response.json(question)
  } catch (err) {
    console.error('[generate-question]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
