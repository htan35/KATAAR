import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, type CoreMessage } from 'ai';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const maxDuration = 30;

function buildFallbackReply(userText: string) {
  return [
    'I can help you book QR entry for any historic place.',
    '',
    userText.toLowerCase().includes('near me')
      ? 'Please share your city or area first, then I can suggest nearby monuments, forts, museums, galleries, palaces, memorials, or heritage sites.'
      : 'Tell me the city or exact place, then I will help with date, time, visitor count, and checkout.',
    '',
    'Example: "Find historic places in Jaipur" or "Book tickets for Qutub Minar tomorrow for 2 adults."',
  ].join('\n');
}

async function persistChatTurn({
  chatId,
  userId,
  userText,
  assistantText,
}: {
  chatId: string;
  userId: string;
  userText: string;
  assistantText: string;
}) {
  await prisma.message.create({
    data: {
      chatId,
      role: 'user',
      content: userText,
    },
  });

  const assistantMessage = await prisma.message.create({
    data: {
      chatId,
      role: 'assistant',
      content: assistantText,
    },
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  const chat = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  });

  if (chat && chat.title === 'New Chat') {
    const title = userText.length > 25 ? `${userText.substring(0, 25)}...` : userText;
    await prisma.chat.update({
      where: { id: chatId },
      data: { title: title || 'Chat Session' },
    });
  }

  return assistantMessage.id;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { message, chatId } = (await req.json()) as { message?: string; chatId?: string };
    const userText = message?.trim();

    if (!userText) {
      return new Response('Message is required', { status: 400 });
    }

    if (!chatId) {
      return new Response('chatId is required', { status: 400 });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chat) {
      return new Response('Chat session not found', { status: 404 });
    }

    const dbMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
    });

    const messages: CoreMessage[] = dbMessages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
    messages.push({ role: 'user', content: userText });

    const system = `
      You are KATAAR E-Ticketing AI.
      KATAAR reduces queues by helping users book QR tickets for any historic or cultural place: monuments, forts, palaces, museums, galleries, archaeological sites, memorials, and heritage locations.
      If the user asks for places "near me" without a city or area, ask for their location.
      Keep replies concise and guide the user toward place, date, time, visitor count, confirmation, and payment.
      If booking details are in progress, append:
      [BOOKING_STATE: {"step": "attraction|date_time|members|confirm|payment|completed", "attraction": "Name", "date": "DD-MM-YYYY", "time": "HH:MM AM/PM", "tickets": {"adult": 0, "child": 0, "foreigner": 0}, "totalPrice": 0}]
      Only append valid JSON in that exact block when a booking is actually in progress.
    `;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    let reply = buildFallbackReply(userText);

    if (apiKey) {
      try {
        const google = createGoogleGenerativeAI({ apiKey });
        const result = await generateText({
          model: google('gemini-3.5-flash'),
          system,
          messages,
          timeout: 20000,
          providerOptions: {
            google: {
              useSearchGrounding: true,
            },
          },
        });
        reply = result.text || reply;
      } catch (modelError: any) {
        console.error('Gemini chat failed:', modelError);
        if (modelError.message?.includes('Quota exceeded') || modelError.message?.includes('rate-limit') || modelError.status === 429) {
          reply = "System: You have hit the Google Gemini Free Tier rate limit (max 15 requests per minute). Please wait 10 seconds and try again.";
        } else {
          reply = `System: The AI provider encountered an error: ${modelError.message || 'Please try again later.'}`;
        }
      }
    }

    const messageId = await persistChatTurn({
      chatId,
      userId: session.user.id,
      userText,
      assistantText: reply,
    });

    return Response.json({ reply, messageId });
  } catch (error) {
    console.error('Chat JSON route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
