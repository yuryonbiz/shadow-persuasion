import { NextRequest, NextResponse } from 'next/server';
import { supabase, searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 });
    }

    // Build context for RAG search from user messages + scenario
    const userMessages = messages.filter((m: any) => m.role === 'user').map((m: any) => m.content).join(' ');
    const searchContext = `${scenario.title} ${scenario.objective} ${scenario.techniques.join(' ')} ${userMessages.slice(0, 2000)}`;
    const ragContext = await searchKnowledge(searchContext);
    const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nKNOWLEDGE BASE REFERENCE (use these to ground your evaluation):\n${ragContext}` : '';

    // Strip coaching annotations from conversation for clean analysis
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content.replace(/<!--COACHING:.*?-->/gs, '').trim(),
    }));

    const conversationTranscript = cleanMessages
      .map((m: any) => `${m.role === 'user' ? 'USER' : 'COUNTERPART'}: ${m.content}`)
      .join('\n\n');

    const debriefPrompt = `You are an expert scenario debrief analyst for a persuasion/influence training platform.

SCENARIO: "${scenario.title}"
Description: ${scenario.description}
Objective: ${scenario.objective}
Target techniques: ${scenario.techniques.join(', ')}
${knowledgeContext}

CONVERSATION TRANSCRIPT:
${conversationTranscript}

Analyze the user's performance in this role-play scenario. Return a JSON object with exactly this structure:
{
  "score": <number 1-100>,
  "techniquesUsed": [
    { "name": "<technique name>", "example": "<quote or paraphrase from user's message>", "effectiveness": <1-10> }
  ],
  "missedOpportunities": [
    { "moment": "<describe the moment>", "technique": "<what they should have used>", "suggestedResponse": "<what they could have said>" }
  ],
  "turningPoints": [
    { "moment": "<describe the key moment>", "impact": "positive|negative", "explanation": "<why this was significant>" }
  ],
  "suggestions": [
    "<specific actionable improvement suggestion>"
  ]
}

Be specific. Reference actual messages from the conversation. Ground your analysis in the knowledge base techniques. Score fairly: 50 is average, 80+ is excellent, below 30 is poor.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: debriefPrompt },
          { role: 'user', content: 'Analyze the conversation and provide the debrief JSON.' },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[DEBRIEF]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No debrief content returned' }, { status: 502 });
    }

    try {
      const debrief = JSON.parse(content);
      return NextResponse.json(debrief);
    } catch {
      console.error('[DEBRIEF]', 'Failed to parse debrief JSON:', content);
      return NextResponse.json({ error: 'Invalid debrief response' }, { status: 502 });
    }

  } catch (error) {
    console.error('[DEBRIEF]', error);
    return NextResponse.json({ error: 'Failed to generate debrief.' }, { status: 500 });
  }
}
