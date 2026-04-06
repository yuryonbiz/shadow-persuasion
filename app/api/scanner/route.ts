import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

async function searchKnowledge(): Promise<string> {
  try {
    const searchQuery =
      'manipulation tactics defense counter influence detection persuasion resistance';
    const embedding = await getEmbedding(searchQuery);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data
      .map(
        (chunk: any) =>
          `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
      )
      .join('\n\n---\n\n');

    return `\n\nRELEVANT MANIPULATION & INFLUENCE KNOWLEDGE:\n${context}\n\nUse these frameworks to identify and categorize tactics found in the text.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

const SYSTEM_PROMPT = `You are a manipulation detection expert. Analyze the provided text and identify every influence/manipulation tactic being used. For each tactic found, identify the exact quote, name the tactic, categorize it, explain how it works psychologically, and provide a counter-response.

You MUST respond with valid JSON in this exact format:
{
  "threatScore": <number 1-10>,
  "tactics": [
    {
      "quote": "exact quoted text from the message",
      "tactic": "Name of the tactic",
      "category": "Urgency|Social Proof|Authority|Guilt|Misdirection|Scarcity|Fear|Flattery|Reciprocity|Anchoring",
      "explanation": "How this tactic works psychologically",
      "counterResponse": "Exact words to say to neutralize this tactic"
    }
  ],
  "overallAssessment": "Summary of the manipulation landscape in this text",
  "counterScript": "A complete response that neutralizes all tactics at once"
}

Be thorough - find EVERY tactic. Even subtle ones. Rate the threat score based on how aggressive and layered the manipulation is. A casual request with one mild tactic is 1-3. Multiple layered tactics with emotional pressure is 7-10.`;

export const maxDuration = 60;

async function extractTextFromImage(base64Image: string): Promise<string> {
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
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract ALL text from this screenshot. Return only the text content, preserving the conversation structure. Include who said what if it\'s a conversation.' },
            { type: 'image_url', image_url: { url: base64Image } },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });

  if (!response.ok) throw new Error('Failed to extract text from image');
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function POST(req: NextRequest) {
  try {
    let textToScan = '';
    let isImage = false;

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Image upload
      const formData = await req.formData();
      const file = formData.get('image') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const base64 = `data:${file.type};base64,${Buffer.from(bytes).toString('base64')}`;
      textToScan = await extractTextFromImage(base64);
      isImage = true;
    } else {
      // Text input
      const { text } = await req.json();
      if (!text || typeof text !== 'string') {
        return NextResponse.json({ error: 'Text to scan is required.' }, { status: 400 });
      }
      textToScan = text;
    }

    const knowledgeContext = await searchKnowledge();

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
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + knowledgeContext },
          { role: 'user', content: `Analyze this text for manipulation tactics:\n\n${textToScan}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    // Include extracted text so the frontend can display it for image uploads
    if (isImage) {
      parsed.extractedText = textToScan;
    }
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[SCANNER API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process scan request.' },
      { status: 500 }
    );
  }
}
