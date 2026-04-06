import { NextRequest, NextResponse } from 'next/server';
import { DECODE_SYSTEM_PROMPT } from '@/lib/prompts';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const maxDuration = 60;

// Get embedding for conversation analysis
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

// Search knowledge base using a query derived from conversation content
async function searchConversationKnowledge(query: string): Promise<string> {
  try {
    const embedding = await getEmbedding(query);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.35,
      match_count: 4,
    });

    if (error || !data || data.length === 0) return '';

    const context = data.map((chunk: any) =>
      `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    return `\n\nRELEVANT ANALYSIS TECHNIQUES FROM KNOWLEDGE BASE:
${context}

Apply these specific concepts and frameworks in your conversation analysis and response recommendations.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
    }

    const imageBuffer = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:${image.type};base64,${imageBase64}`;

    // PASS 1: Ask the LLM to summarize the conversation from the image
    const summaryResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          { role: 'system', content: 'You are a conversation analyst. Provide a brief text summary of the conversation in this screenshot: who is speaking, what they said, what the dynamic is, and what influence or persuasion techniques (if any) are being used. Keep it under 300 words.' },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageDataUrl } },
              { type: 'text', text: 'Summarize this conversation screenshot.' },
            ],
          },
        ],
      }),
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error('OpenRouter summary error:', summaryResponse.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const summaryData = await summaryResponse.json();
    const conversationSummary = summaryData.choices[0].message.content;

    // Use the summary to search for relevant knowledge base techniques
    const knowledgeContext = await searchConversationKnowledge(conversationSummary);
    const enhancedPrompt = DECODE_SYSTEM_PROMPT + knowledgeContext;

    // PASS 2: Full analysis with image + RAG context
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
            content: [
              { type: 'image_url', image_url: { url: imageDataUrl } },
              { type: 'text', text: 'Analyze this conversation screenshot. Provide your full analysis.' },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse as JSON for enhanced analysis, fall back to legacy format
    try {
      const enhancedAnalysis = JSON.parse(content);
      return NextResponse.json(enhancedAnalysis);
    } catch (parseError) {
      // Fallback to legacy format if JSON parsing fails
      return NextResponse.json({ 
        analysis: content,
        suggestions: [],
        techniques_identified: [] 
      });
    }

  } catch (error) {
    console.error('[DECODE API] Error:', error);
    return NextResponse.json({ error: 'Failed to analyze screenshot.' }, { status: 500 });
  }
}
