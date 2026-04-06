import { NextRequest } from 'next/server';
import { HANDLER_SYSTEM_PROMPT } from '@/lib/prompts';
import { scenarios } from '@/lib/scenarios';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getEmbedding(text: string): Promise<number[]> {
  try {
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
  } catch (e) {
    console.error('Embedding error:', e);
    return [];
  }
}

async function searchScenarioKnowledge(userMessage: string, scenario: { title: string; description: string; objective: string; techniques: string[] }): Promise<string> {
  try {
    const searchQuery = `${userMessage} ${scenario.description} ${scenario.objective} ${scenario.techniques.join(' ')}`;
    const embedding = await getEmbedding(searchQuery);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data.map((chunk: any) =>
      `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    return `\n\nRELEVANT TECHNIQUES FROM KNOWLEDGE BASE:
${context}

Incorporate these specific techniques and frameworks into your role-play responses. Reference them naturally as part of the scenario guidance.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return new Response('Scenario not found.', { status: 404 });
    }

    // Extract latest user message for RAG search
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');

    // Search knowledge base with scenario context + user message
    const knowledgeContext = lastUserMessage
      ? await searchScenarioKnowledge(lastUserMessage.content, scenario)
      : await searchScenarioKnowledge(scenario.objective, scenario);

    const scenarioPrompt = `You are role-playing a SCENARIO SIMULATION. The scenario is: "${scenario.title}".
Description: ${scenario.description}
Objective for the user: ${scenario.objective}
Key techniques they should practice: ${scenario.techniques.join(', ')}

YOUR ROLE: Play the OTHER person in this scenario (e.g., the boss, the client, the date, the manipulator). Stay in character and respond realistically. Make it challenging but winnable.

IMPORTANT RULES:
1. Stay in character as the other party at all times
2. React realistically to the user's influence attempts — don't give in too easily
3. If they use techniques well, show gradual yielding
4. If they make mistakes, push back harder

After EACH of your in-character responses, append a coaching annotation on a new line in this exact format:
<!--COACHING:{"feedback":"Brief evaluation of the user's last message","score":NUMBER_1_TO_10,"technique":"Name of primary technique used or attempted","tip":"Specific actionable suggestion for next message"}-->

The coaching annotation must be valid JSON inside the COACHING comment. Score 1-10 where 10 is masterful. If this is the opening message (no user input yet), still include a coaching annotation with general guidance.`;

    const systemContent = `${HANDLER_SYSTEM_PROMPT}\n\n${scenarioPrompt}${knowledgeContext}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://shadow-persuasion.vercel.app',
        'X-Title': 'Shadow Persuasion',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          { role: 'system', content: systemContent },
          ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return new Response(`AI service error: ${response.status}`, { status: 502 });
    }

    if (!response.body) {
      return new Response('No response body', { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;
              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) controller.enqueue(encoder.encode(content));
              } catch {}
            }
          }
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });

  } catch (error) {
    console.error('[SCENARIOS API] Error:', error);
    return new Response('Failed to get scenario response.', { status: 500 });
  }
}
