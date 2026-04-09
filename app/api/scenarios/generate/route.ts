import { NextRequest, NextResponse } from 'next/server';
import { supabase, searchKnowledge } from '@/lib/rag';
import { RAG_ENFORCEMENT } from '@/lib/prompts';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { category, count = 3 } = await req.json();

    // Search knowledge base for techniques in the given category
    const searchQuery = category
      ? `${category} persuasion influence techniques scenarios practice`
      : 'persuasion influence negotiation rapport social dynamics techniques';

    const ragContext = await searchKnowledge(searchQuery, { count: 10 });

    if (!ragContext) {
      return NextResponse.json(
        { error: 'No knowledge base content found to generate scenarios.' },
        { status: 400 }
      );
    }

    // Fetch existing scenario IDs to avoid duplicates
    const { data: existingScenarios } = await supabase
      .from('scenarios')
      .select('id, title');

    const existingTitles = (existingScenarios || []).map((s: any) => s.title);

    const generatePrompt = `${RAG_ENFORCEMENT}

You are generating realistic practice scenarios for a persuasion/influence training platform.

KNOWLEDGE BASE CONTENT:
${ragContext}

EXISTING SCENARIOS (do NOT duplicate these):
${existingTitles.join(', ')}

Generate exactly ${Math.min(count, 5)} NEW unique practice scenarios${category ? ` in the "${category}" category` : ''}.

Each scenario must:
1. Be grounded in real techniques from the knowledge base excerpts above
2. Have a realistic, specific situation (not generic)
3. Include 2-4 techniques from the knowledge base that are relevant
4. Have a clear, measurable objective
5. Have a difficulty rating (1=beginner, 2=intermediate, 3=advanced)

Return a JSON object with this exact structure:
{
  "scenarios": [
    {
      "id": "kebab-case-unique-id",
      "title": "Short Descriptive Title",
      "category": "${category || 'Career|Relationships|Sales|Social|Defense'}",
      "difficulty": 1,
      "description": "Vivid 1-2 sentence scenario setup that puts the user in a specific situation.",
      "objective": "Clear goal the user should achieve through influence techniques.",
      "techniques": ["Technique Name 1", "Technique Name 2", "Technique Name 3"],
      "source_books": ["Book Title 1"]
    }
  ]
}

IMPORTANT: The category must be one of: Career, Relationships, Sales, Social, Defense.
Use actual technique names and book titles from the knowledge base excerpts.`;

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
          { role: 'system', content: generatePrompt },
          { role: 'user', content: `Generate ${count} new training scenarios${category ? ` for the ${category} category` : ''}.` },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[SCENARIOS/GENERATE]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content returned from AI' }, { status: 502 });
    }

    let parsed: { scenarios: any[] };
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error('[SCENARIOS/GENERATE]', 'Failed to parse JSON:', content);
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 502 });
    }

    if (!parsed.scenarios || !Array.isArray(parsed.scenarios)) {
      return NextResponse.json({ error: 'Invalid scenario format from AI' }, { status: 502 });
    }

    // Insert into Supabase
    const toInsert = parsed.scenarios.map((s: any) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      difficulty: s.difficulty || 1,
      description: s.description,
      objective: s.objective,
      techniques: s.techniques || [],
      is_generated: true,
      source_books: s.source_books || [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('scenarios')
      .upsert(toInsert, { onConflict: 'id' })
      .select();

    if (insertError) {
      console.error('[SCENARIOS/GENERATE]', 'Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save scenarios.' }, { status: 500 });
    }

    return NextResponse.json({ scenarios: inserted || toInsert });
  } catch (err) {
    console.error('[SCENARIOS/GENERATE]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
