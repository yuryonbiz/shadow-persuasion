import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REWRITE_SYSTEM_PROMPT = `You are a message optimization expert specializing in psychological influence and persuasion. Your task is to transform weak, boring, or ineffective messages into psychologically optimized communications.

For each message rewrite, provide 4 different versions using these categories:

1. **AUTHORITY BUILDING** - Establish credibility, expertise, and social proof
2. **INTRIGUE CREATION** - Generate curiosity, mystery, and emotional engagement  
3. **RECIPROCITY GENERATION** - Create obligation, value offering, and social debt
4. **FRAME REORIENTATION** - Control conversation direction and underlying assumptions

Each rewrite should:
- Be concise and natural (not obviously "salesy")
- Use specific psychological principles
- Include embedded presuppositions where appropriate
- Match the original message length approximately
- Feel authentic to the sender's voice

Respond in this exact JSON format:
{
  "versions": [
    {
      "type": "Authority Building",
      "description": "Brief explanation of the approach",
      "message": "The actual rewritten message",
      "explanation": "Why this works psychologically",
      "powerIncrease": [percentage increase in influence power],
      "riskLevel": "LOW|MEDIUM|HIGH"
    },
    ... (4 total versions)
  ],
  "originalPowerScore": [score 1-10 of original message],
  "confidence": [confidence percentage in analysis]
}

Focus on legitimate influence techniques - authority, social proof, scarcity, reciprocity, consistency, and liking. Avoid obvious manipulation that would trigger resistance.`;

// Get embedding for the user's message
async function getEmbedding(text: string): Promise<number[]> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
  } catch (e) {
    console.error('Embedding error:', e);
    return [];
  }
}

// Search knowledge base for relevant techniques
async function searchKnowledge(query: string): Promise<string> {
  try {
    const embedding = await getEmbedding(query + ' message rewrite communication influence');
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: 3,
    });

    if (error || !data || data.length === 0) return '';

    const context = data.map((chunk: any) => 
      `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    return `\n\nRELEVANT TECHNIQUES FROM KNOWLEDGE BASE:
${context}

Use specific concepts and terminology from these sources in your rewrite suggestions.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { message, goal } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided.' }, { status: 400 });
    }

    const contextualPrompt = goal 
      ? `The user's specific goal is: "${goal}". Optimize the rewrite suggestions to support this objective.`
      : '';

    // Search knowledge base for relevant techniques
    const knowledgeContext = await searchKnowledge(message + (goal ? ` ${goal}` : ''));
    const goalInstruction = goal
      ? `\n\nIMPORTANT: The user's primary goal is "${goal}". Prioritize and emphasize this goal across ALL rewrite versions. Each version should be optimized to support "${goal}" while still applying its respective category strategy. The best version for achieving "${goal}" should be listed first.`
      : '';
    const enhancedPrompt = REWRITE_SYSTEM_PROMPT + goalInstruction + knowledgeContext;

    console.log('[REWRITE API] Calling OpenRouter with model: openai/gpt-4o');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: enhancedPrompt },
          {
            role: 'user',
            content: `Rewrite this message for maximum psychological impact: "${message}"\n\n${contextualPrompt}`
          },
        ],
        stream: false, // Explicitly disable streaming
      }),
    });

    console.log('[REWRITE API] OpenRouter response status:', response.status);
    console.log('[REWRITE API] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[REWRITE API] OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    console.log('[REWRITE API] OpenRouter response structure:', {
      choices: data.choices?.length || 0,
      hasContent: !!data.choices?.[0]?.message?.content
    });
    
    const content = data.choices[0].message.content;
    console.log('[REWRITE API] Raw AI content (first 200 chars):', content.slice(0, 200));

    // Parse the JSON response
    try {
      const result = JSON.parse(content);
      console.log('[REWRITE API] Successfully parsed JSON, versions count:', result.versions?.length || 0);
      return NextResponse.json(result);
    } catch (parseError) {
      console.error('[REWRITE API] Failed to parse AI response as JSON. Full content:', content);
      console.error('[REWRITE API] Parse error:', parseError);
      
      // Return a fallback response
      return NextResponse.json({
        error: 'AI response parsing failed',
        debug: {
          contentPreview: content.slice(0, 500),
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[REWRITE API] Error:', error);
    return NextResponse.json({ error: 'Failed to rewrite message.' }, { status: 500 });
  }
}