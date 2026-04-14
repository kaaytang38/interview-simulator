import { NextRequest } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'A URL is required.' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return Response.json({ error: 'Invalid URL — please include https://' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return Response.json({ error: 'Only http and https URLs are supported.' }, { status: 400 })
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; InterviewSimulator/1.0; +https://interview-simulator.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      // @ts-expect-error — Node 18 fetch signal
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      return Response.json(
        { error: `Failed to fetch page: HTTP ${response.status}` },
        { status: 400 },
      )
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return Response.json(
        { error: 'URL does not return an HTML page. Try pasting the job description as text instead.' },
        { status: 400 },
      )
    }

    const html = await response.text()

    // Strip script, style, nav, header, footer blocks entirely
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      // Strip all remaining tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      // Collapse whitespace
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    // Cap at 3000 chars to stay within prompt context
    const text = stripped.length > 3000 ? stripped.slice(0, 3000) + '…' : stripped

    if (text.length < 50) {
      return Response.json(
        { error: "Couldn't extract readable text from that page. Try pasting the job description directly." },
        { status: 400 },
      )
    }

    return Response.json({ text })
  } catch (err) {
    console.error('[fetch-job-desc]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    // Provide a friendlier message for network errors
    const friendly = message.includes('fetch') || message.includes('network')
      ? "Couldn't reach that URL. The site may block automated requests — try pasting the text instead."
      : message
    return Response.json({ error: friendly }, { status: 500 })
  }
}
