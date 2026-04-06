import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STRATEGIC_CHAT_SYSTEM_PROMPT = `You are a Strategic Communication Coach specializing in influence, persuasion, and tactical conversation guidance. You provide specific, actionable advice focused on achieving concrete outcomes.

Your expertise includes:
- Cialdini's principles of influence (reciprocity, authority, social proof, scarcity, liking, commitment/consistency)
- NLP communication patterns and anchoring techniques
- Power dynamics and frame control
- Negotiation tactics and positioning
- Relationship building and rapport techniques
- Risk assessment and tactical timing

Communication Style:
- Direct and tactical, never vague
- Provide specific scripts and exact wording when requested
- Explain the psychology behind each recommendation
- Assess risks and provide warnings when appropriate
- Focus on win-win outcomes when possible
- Always consider ethical implications

Response Format:
Structure your responses with:
1. **SITUATION ANALYSIS** - What's happening psychologically
2. **TACTICAL APPROACH** - Which specific techniques to use
3. **EXACT SCRIPTS** - Word-for-word responses when requested
4. **RISK ASSESSMENT** - Potential backfire scenarios
5. **NEXT STEPS** - What to do after this interaction

At the end of each response, include tactical guidance metadata in this format:
<!--GUIDANCE:{"nextMove":"Brief next recommended action","riskLevel":"LOW|MEDIUM|HIGH","riskExplanation":"Brief risk explanation","techniques":["Array","of","active","techniques"],"progressScore":0-100}-->

Focus on practical, implementable advice that drives real results while maintaining ethical standards.`;

// Get embedding for strategic coaching
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

// Search knowledge base for strategic coaching
async function searchStrategicKnowledge(userMessage: string, goal: string): Promise<string> {
  try {
    const searchQuery = `${userMessage} ${goal} strategic coaching tactical advice influence`;
    const embedding = await getEmbedding(searchQuery);
    if (embedding.length === 0) return '';

    const { data, error } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.32,
      match_count: 5,
    });

    if (error || !data || data.length === 0) return '';

    const context = data.map((chunk: any) => 
      `[${chunk.book_title} by ${chunk.author} - ${chunk.technique_name}]\n${chunk.content}`
    ).join('\n\n---\n\n');

    return `\n\nRELEVANT STRATEGIC TECHNIQUES FROM KNOWLEDGE BASE:
${context}

Draw from these specific concepts, frameworks, and techniques in your tactical guidance.`;
  } catch (e) {
    console.error('Knowledge search error:', e);
    return '';
  }
}

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, goal, goalTitle, session_id } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    // Resolve or create session for persistence
    let activeSessionId = session_id;
    if (!activeSessionId) {
      try {
        const { data: newSession } = await supabase
          .from('chat_sessions')
          .insert({
            title: goalTitle || 'Strategic Session',
            goal: goal || null,
            goal_title: goalTitle || null,
            session_type: 'strategic',
          })
          .select('id')
          .single();
        activeSessionId = newSession?.id;
      } catch (e) {
        console.error('Failed to create strategic session:', e);
      }
    }

    // Save user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    if (activeSessionId && lastUserMsg) {
      supabase
        .from('chat_messages')
        .insert({ session_id: activeSessionId, role: 'user', content: lastUserMsg.content })
        .then(({ error }) => { if (error) console.error('Save user msg error:', error); });
    }

    // Get the latest user message for knowledge search
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    
    // Search knowledge base for relevant techniques
    const knowledgeContext = lastUserMessage 
      ? await searchStrategicKnowledge(lastUserMessage.content, goalTitle)
      : '';

    // Add goal context to the system prompt
    const contextualPrompt = `${STRATEGIC_CHAT_SYSTEM_PROMPT}

CURRENT SESSION GOAL: "${goalTitle}" (${goal})
Tailor all advice and tactics specifically to support this objective. Consider the unique challenges and opportunities associated with this goal type.${knowledgeContext}`;

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
          { role: 'system', content: contextualPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', response.status, errorText);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    // Tee stream to persist assistant response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullAssistantContent = '';

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        fullAssistantContent += text;
        controller.enqueue(chunk);
      },
      flush() {
        // Save assistant message after stream completes
        if (activeSessionId && fullAssistantContent) {
          // Extract text content from SSE format
          let plainContent = '';
          const lines = fullAssistantContent.split('\n');
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) plainContent += content;
            } catch {}
          }
          if (plainContent) {
            // Strip guidance metadata for clean storage
            const cleanContent = plainContent.replace(/<!--GUIDANCE:[\s\S]*?-->/, '').trim();
            supabase
              .from('chat_messages')
              .insert({
                session_id: activeSessionId,
                role: 'assistant',
                content: cleanContent,
                metadata: {},
              })
              .then(({ error }) => { if (error) console.error('Save strategic assistant msg error:', error); });

            supabase
              .from('chat_sessions')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', activeSessionId)
              .then(() => {});
          }
        }
      },
    });

    const readableStream = response.body!.pipeThrough(transformStream);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...(activeSessionId ? { 'X-Session-Id': activeSessionId } : {}),
      },
    });

  } catch (error) {
    console.error('[STRATEGIC CHAT API] Error:', error);
    return NextResponse.json({ error: 'Failed to process strategic chat.' }, { status: 500 });
  }
}