import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      question,
      answer,
      answerType,
      questionType,
      multipleChoiceOptions,
      userProfile,
      difficulty,
    } = body

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not configured.' },
        { status: 500 },
      )
    }

    const profileContext = [
      userProfile?.targetRole && `Target Role: ${userProfile.targetRole}`,
      userProfile?.industry && `Industry: ${userProfile.industry}`,
      userProfile?.experienceLevel && `Experience Level: ${userProfile.experienceLevel}`,
    ]
      .filter(Boolean)
      .join(' | ')

    const formattedAnswer =
      answerType === 'multiple-choice'
        ? `The candidate selected this multiple-choice option:\n"${answer}"\n\nAll options presented were:\n${(multipleChoiceOptions as string[]).join('\n')}`
        : `The candidate wrote:\n"${answer}"`

    const starBlock =
      questionType === 'behavioral'
        ? `  "starAnalysis": {
    "situation": "Evaluate how clearly and specifically they described the Situation/context",
    "task": "Evaluate how well they articulated the Task or challenge they faced",
    "action": "Evaluate how specifically and thoroughly they described the Actions they took",
    "result": "Evaluate how concretely and quantifiably they described the Results/outcome",
    "missing": ["List of STAR components that were absent, vague, or weak — empty array if all were strong"]
  },`
        : '  "starAnalysis": null,'

    const systemPrompt = `You are an expert interview coach providing detailed, honest, and constructive feedback.
Be specific: reference the candidate's actual words when praising or critiquing.
Be actionable: every improvement suggestion should include a concrete "instead, try…" example.
Be calibrated: score relative to ${difficulty || 'medium'} difficulty and ${profileContext || 'a general professional'}.

Always respond with a single valid JSON object — no markdown, no prose, no code fences.`

    const userPrompt = `Evaluate this ${questionType || 'behavioral'} interview answer.

QUESTION: ${question}

ANSWER:
${formattedAnswer}

Return ONLY a JSON object with exactly this structure:
{
  "overallScore": <integer 1–10>,
  "grade": "<one of: A+, A, A-, B+, B, B-, C+, C, C-, D, F>",
  "strengths": [
    "<Specific strength with direct reference to their answer>",
    "<Another specific strength>"
  ],
  "improvements": [
    "<Specific weakness + concrete suggestion with an example of how to reframe it>",
    "<Another specific improvement>",
    "<Third improvement if applicable>"
  ],
${starBlock}
  "detailedFeedback": "<2–3 paragraphs of narrative feedback: what worked, what was missing, and how to improve — be specific and encouraging>",
  "keyTakeaway": "<One crisp, actionable sentence summarizing the single most important thing for them to work on>"
}`

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const response = await stream.finalMessage()

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return Response.json({ error: 'Model returned no text content' }, { status: 500 })
    }

    const raw = textBlock.text.trim()
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'Model response was not valid JSON' }, { status: 500 })
    }

    const feedback = JSON.parse(jsonMatch[0])
    return Response.json(feedback)
  } catch (err) {
    console.error('[analyze-answer]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
