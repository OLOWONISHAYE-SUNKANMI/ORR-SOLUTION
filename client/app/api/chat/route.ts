import { NextRequest, NextResponse } from 'next/server';
import { ORR_SYSTEM_PROMPT, generateKnowledgeResponse } from '@/lib/ai-knowledge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [], currentPath = '', aiPreference = 'concise' } = body;

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user' || m.sender === 'user')?.content ||
      [...messages].reverse().find((m: any) => m.sender === 'user')?.text || '';

    if (!lastUserMessage) {
      return NextResponse.json({ reply: "I didn't receive a valid message. How can I help you today?" });
    }

    // Determine tone instruction
    let toneInstruction = '';
    if (aiPreference === 'scientific') toneInstruction = 'Please maintain a highly scientific, technical, and analytical tone in your response.';
    else if (aiPreference === 'friendly') toneInstruction = 'Please maintain a friendly, warm, and conversational tone in your response.';
    else if (aiPreference === 'professional') toneInstruction = 'Please maintain a very formal, professional, and business-oriented tone in your response.';
    else toneInstruction = 'Please keep your response concise, clear, and straight to the point.';

    // 1. Try Backend Gemini AI endpoint (same service powering /ai-assistant)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://orr-backend-105825824472.asia-southeast2.run.app';
    if (backendUrl) {
      try {
        const conversationHistory = messages.map((m: any) => ({
          role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
          content: m.text || m.content || ''
        })).filter((m: any) => m.content);

        const backendRes = await fetch(`${backendUrl}/ai/chat/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: lastUserMessage,
            conversation_history: conversationHistory,
            session_id: 'chatbot_widget',
            ai_preference: aiPreference // Backend needs to know it too if it supports it
          })
        });

        if (backendRes.ok) {
          const backendData = await backendRes.json();
          const aiReply = backendData?.reply || backendData?.data?.reply;
          if (aiReply) {
            return NextResponse.json({ reply: aiReply });
          }
        }
      } catch (err) {
        console.warn('Backend Gemini API endpoint failed or unreachable, falling back to direct Gemini / knowledge engine:', err);
      }
    }

    // 2. Direct Gemini API Integration (v1beta gemini-1.5-flash / gemini-2.0-flash)
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (apiKey) {
      try {
        // Construct conversation contents with system context
        const contents: any[] = [
          {
            role: 'user',
            parts: [{ text: `${ORR_SYSTEM_PROMPT}\n\nCurrent Page Context: ${currentPath}\n\nIMPORTANT TONE INSTRUCTION: ${toneInstruction}` }]
          },
          {
            role: 'model',
            parts: [{ text: "Understood. I am ORR Assistant and I am ready to answer any questions about ORR Solution with full knowledge. I will also strictly follow your requested tone instruction." }]
          }
        ];

        // Format recent messages for multi-turn Gemini conversation
        messages.slice(-6).forEach((m: any) => {
          const role = (m.sender === 'user' || m.role === 'user') ? 'user' : 'model';
          const text = m.text || m.content;
          if (text) {
            contents.push({
              role,
              parts: [{ text }]
            });
          }
        });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 850,
              temperature: 0.7,
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({ reply: replyText });
          }
        }
      } catch (err) {
        console.warn('Direct Gemini API call failed, using fallback knowledge engine:', err);
      }
    }

    // 3. Fallback: Smart AI Knowledge Engine
    const reply = generateKnowledgeResponse(lastUserMessage, currentPath);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { reply: "ORR Solution Assistant is here! How can I help you with our services, methodology, or location?" },
      { status: 200 }
    );
  }
}
