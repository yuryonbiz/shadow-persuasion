import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: text.slice(0, 8000),
    }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data?.[0]?.embedding || [];
}

async function searchKnowledge(query: string, limit: number = 4) {
  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: limit,
    });

    if (error || !data || data.length === 0) return '';

    return data
      .map(
        (chunk: any) =>
          `[Source: "${chunk.book_title}" by ${chunk.author} | Technique: ${chunk.technique_name}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');
  } catch (e) {
    console.error('RAG search error:', e);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'debrief') {
      return handleDebrief(body);
    } else if (action === 'weekly-review') {
      return handleWeeklyReview(body);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[JOURNAL API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleDebrief(body: any) {
  const { report } = body;

  const searchQuery = `${report.techniques?.join(' ')} ${report.situation} ${report.goal}`;
  const ragContext = await searchKnowledge(searchQuery);

  const systemPrompt = `You are an elite influence and persuasion coach analyzing a field report from a student practicing social influence techniques. You provide direct, tactical feedback.

${ragContext ? `RELEVANT KNOWLEDGE BASE EXCERPTS:\n${ragContext}\n\n---\n` : ''}

Respond with a JSON object containing exactly these keys:
- "verdict": A one-line tactical assessment (e.g., "Strong frame control but you lost initiative in the close")
- "whatWorked": Array of 2-4 specific things that worked well, referencing the techniques used
- "whatToImprove": Array of 2-4 specific, actionable improvements with concrete suggestions
- "techniqueGrade": Object mapping each technique name to a letter grade (A/B/C/D/F) with a one-line reason, e.g. {"Anchoring": {"grade": "B+", "reason": "Good opening number but you adjusted too quickly"}}
- "patternInsight": A deeper insight about the student's approach, tendencies, or a pattern you notice

Be specific, reference their actual words/actions, and be direct without being harsh. Grade honestly.`;

  const userContent = `FIELD REPORT:
Who: ${report.who || 'Not specified'}
Situation: ${report.situation}
Goal: ${report.goal}
Techniques Used: ${report.techniques?.join(', ') || 'None specified'}
What I Said/Did: ${report.whatIDid}
Their Response: ${report.theirResponse}
Outcome: ${report.outcome}/5 stars
Notes: ${report.notes || 'None'}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
      'X-Title': 'Shadow Persuasion',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', response.status, errorText);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const analysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
  }
}

async function handleWeeklyReview(body: any) {
  const { reports } = body;

  if (!reports || reports.length === 0) {
    return NextResponse.json({
      summary: 'No reports this week. Start logging your interactions to get weekly insights.',
      techniqueBreakdown: {},
      strengths: [],
      weaknesses: [],
      recommendation: 'Submit your first field report to begin tracking your progress.',
    });
  }

  const techniquesList = reports.flatMap((r: any) => r.techniques || []);
  const searchQuery = `improving ${[...new Set(techniquesList)].join(' ')} persuasion techniques weekly review`;
  const ragContext = await searchKnowledge(searchQuery);

  const systemPrompt = `You are an elite influence and persuasion coach conducting a weekly performance review. Analyze the student's field reports from this week and provide strategic guidance.

${ragContext ? `RELEVANT KNOWLEDGE BASE EXCERPTS:\n${ragContext}\n\n---\n` : ''}

Respond with a JSON object containing exactly these keys:
- "summary": A 2-3 sentence overview of the week's performance
- "techniqueBreakdown": Object mapping each technique used to {"attempts": number, "avgOutcome": number, "assessment": "one line"}
- "strengths": Array of 2-3 specific strengths observed across all reports
- "weaknesses": Array of 2-3 areas needing improvement with actionable advice
- "recommendation": A specific, actionable recommendation for next week (1-2 sentences)
- "trend": "improving" | "steady" | "declining" based on outcome patterns`;

  const reportsText = reports
    .map(
      (r: any, i: number) =>
        `Report ${i + 1} (${r.date}):
  Situation: ${r.situation}
  Goal: ${r.goal}
  Techniques: ${r.techniques?.join(', ')}
  What they did: ${r.whatIDid}
  Response: ${r.theirResponse}
  Outcome: ${r.outcome}/5
  AI Verdict: ${r.aiAnalysis?.verdict || 'N/A'}`
    )
    .join('\n\n');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_KEY}`,
      'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
      'X-Title': 'Shadow Persuasion',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `WEEKLY FIELD REPORTS (${reports.length} total):\n\n${reportsText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenRouter error:', response.status, errorText);
    return NextResponse.json({ error: 'AI service error' }, { status: 502 });
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  try {
    const analysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw: content }, { status: 500 });
  }
}
