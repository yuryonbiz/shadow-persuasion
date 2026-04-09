import { NextRequest, NextResponse } from 'next/server';
import { HANDLER_SYSTEM_PROMPT, RAG_ENFORCEMENT, HANDLER_VOICE } from '@/lib/prompts';
import { supabase, searchKnowledge } from '@/lib/rag';

export const maxDuration = 60;

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { messages, scenarioId } = await req.json();

    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (scenarioError || !scenario) {
      return NextResponse.json({ error: 'Scenario not found.' }, { status: 404 });
    }

    // Extract latest user message for RAG search
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');

    // Search knowledge base with scenario context + user message
    const searchQuery = lastUserMessage
      ? `${lastUserMessage.content} ${scenario.description} ${scenario.objective} ${scenario.techniques.join(' ')}`
      : `${scenario.objective} ${scenario.description} ${scenario.techniques.join(' ')}`;
    const ragContext = await searchKnowledge(searchQuery);
    const knowledgeContext = ragContext ? `\n\n${RAG_ENFORCEMENT}\n\nRELEVANT TECHNIQUES FROM KNOWLEDGE BASE:\n${ragContext}` : '';

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

    const systemContent = `${HANDLER_VOICE}\n${HANDLER_SYSTEM_PROMPT}\n\n${scenarioPrompt}${knowledgeContext}`;

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
      console.error('[SCENARIOS]', 'OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    if (!response.body) {
      return NextResponse.json({ error: 'No response body from AI service' }, { status: 502 });
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
          console.error('[SCENARIOS]', 'Stream error:', e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });

  } catch (error) {
    console.error('[SCENARIOS]', error);
    return NextResponse.json({ error: 'Failed to get scenario response.' }, { status: 500 });
  }
}
