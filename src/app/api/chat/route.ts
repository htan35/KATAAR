import { createGoogleGenerativeAI } from '@ai-sdk/google';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export const maxDuration = 30;

type IncomingMessage = {
  id?: string;
  role?: string;
  content?: string;
  parts?: Array<{ type?: string; text?: string }>;
};

function getMessageText(message: IncomingMessage | undefined) {
  if (!message) return '';
  if (typeof message.content === 'string') return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((part) => part.type === 'text' && typeof part.text === 'string')
      .map((part) => part.text)
      .join('');
  }
  return '';
}

async function persistChatTurn({
  chatId,
  userText,
  assistantText,
}: {
  chatId: string;
  userText: string;
  assistantText: string;
}) {
  if (userText) {
    await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: userText,
      },
    });
  }

  await prisma.message.create({
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

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
  });

  if (chat && chat.title === 'New Chat') {
    const newTitle = userText.length > 25 ? userText.substring(0, 25) + '...' : userText;
    await prisma.chat.update({
      where: { id: chatId },
      data: { title: newTitle || 'Chat Session' },
    });
  }
}

function fallbackResponse({
  messages,
  chatId,
  userText,
}: {
  messages: UIMessage[];
  chatId: string;
  userText: string;
}) {
  const text = [
    'I can help you book QR entry for any historic place.',
    '',
    'Tell me the city or exact location first, then I can help you choose a monument, museum, fort, gallery, palace, memorial, or heritage site and continue with date, time, visitors, and checkout.',
    '',
    userText.toLowerCase().includes('near me')
      ? 'For "near me" searches, please share your city or area so I can suggest relevant historic places.'
      : 'You can say something like: "Find historic places in Jaipur" or "Book tickets for Qutub Minar tomorrow for 2 adults."',
  ].join('\n');

  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    execute: ({ writer }) => {
      const id = `fallback-${Date.now()}`;
      writer.write({ type: 'text-start', id });
      writer.write({ type: 'text-delta', id, delta: text });
      writer.write({ type: 'text-end', id });
    },
    onFinish: async () => {
      try {
        await persistChatTurn({ chatId, userText, assistantText: text });
      } catch (dbError) {
        console.error('Failed to save fallback chat turn:', dbError);
      }
    },
  });

  return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { messages, chatId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Invalid request payload', { status: 400 });
    }

    if (!chatId) {
      return new Response('chatId is required for persistence', { status: 400 });
    }

    // Verify user owns the chat session
    const chatExists = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
    });

    if (!chatExists) {
      return new Response('Chat session not found', { status: 404 });
    }

    const lastUserMsg = messages[messages.length - 1] as IncomingMessage | undefined;
    const lastUserText = getMessageText(lastUserMsg);

    const systemInstruction = `
      You are KATAAR E-Ticketing AI, a premium conversational helper.
      Your goal is to assist users with general questions, map/location discovery, booking details, and real-time inquiries for ANY historic location, museum, monument, fort, palace, gallery, archaeological site, memorial, or heritage place worldwide.
      
      You have access to Google Search grounding to answer questions requiring live/up-to-date web information.
      Be concise, professional, and helpful. Format your output using clear markdown (e.g. bold headings, bullet lists, tables where relevant).
      
      DYNAMIC PLACE DISCOVERY AND BOOKING:
      - KATAAR exists to reduce queues at ANY historic or cultural place, not a preset list. Use Google Search grounding to find real places from the user's location or query, such as "near me", "heritage places in Jaipur", "Book ticket for Qutub Minar", or "historic sites in Paris".
      - When the user says "near me" and you do not have their location, ask for their city or area before suggesting places.
      - Mention that KATAAR will show a map preview for the selected place. Do not claim KATAAR owns or officially partners with that place.
      - Provide real, live information about their opening timings and days closed.
      - Provide real ticket pricing if available. If exact pricing is not immediately found, clearly label a reasonable estimated KATAAR checkout price in INR or local currency so the demo booking flow can continue.
      - If the user wants to book tickets, seamlessly guide them through date, time, and ticket counts conversationally. 

      CRITICAL: If the user is actively booking a ticket, at the very end of your response, append a hidden status block in this format:
      [BOOKING_STATE: {"step": "attraction|date_time|members|confirm|payment|completed", "attraction": "Name of Attraction", "date": "DD-MM-YYYY", "time": "HH:MM AM/PM", "tickets": {"adult": X, "child": Y, "foreigner": Z}, "totalPrice": 123}]
      
      Choose the step based on user progress:
      - "attraction": if they chosen or are choosing an attraction.
      - "date_time": if they specified attraction and are now selecting date & time.
      - "members": if attraction and date/time are set, and they are specifying visitor counts.
      - "confirm": if all details (attraction, date, time, counts, total price) are set, and you are asking them to confirm before payment.
      - "payment": if they have explicitly confirmed the details (e.g., said "yes", "proceed", "pay").
      - "completed": if payment is completed.
      
      Ensure the JSON is strictly valid. Do not format the JSON inside markdown ticks. Only append this block if a booking is in progress.
    `;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return fallbackResponse({ messages, chatId, userText: lastUserText });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const modelMessages = await convertToModelMessages(messages);

    const result = await streamText({
      model: google('gemini-2.5-flash'),
      messages: modelMessages,
      system: systemInstruction,
      timeout: 20000,
      providerOptions: {
        google: {
          useSearchGrounding: true,
        },
      },
      onFinish: async ({ text }) => {
        try {
          await persistChatTurn({ chatId, userText: lastUserText, assistantText: text });
        } catch (dbError) {
          console.error('Failed to save messages to PostgreSQL via Prisma:', dbError);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error: any) {
    console.error('API Chat route error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
