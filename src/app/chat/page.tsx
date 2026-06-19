'use client';

import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import MessageBubble from '@/components/MessageBubble';
import WeatherWidget from '@/components/WeatherWidget';
import { 
  Send, 
  Plus, 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  Ticket as TicketIcon, 
  User, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { createChat, getChatMessages, createTicket } from '@/lib/actions';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: 'text'; text: string }>;
  createdAt?: Date | string;
};

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-bg-primary text-text-secondary gap-4">
        <Loader2 className="animate-spin text-accent-purple" size={32} />
        <span>Loading Workspace...</span>
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const { data: session } = useSession();

  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [bookingState, setBookingState] = useState<any>({ step: 'idle' });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [localChatId, setLocalChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [chatError, setChatError] = useState<Error | undefined>();
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const isLoading = requestLoading;

  const createActiveChat = async () => {
    const newChat = await createChat('New Chat');
    setLocalChatId(newChat.id);
    window.history.replaceState(null, '', `/chat?id=${newChat.id}`);
    return newChat.id;
  };

  // Scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, processingPayment]);

  // Load chat history when chatId changes
  useEffect(() => {
    if (localChatId === chatId) {
      return;
    }

    if (chatId) {
      setLoadingHistory(true);
      getChatMessages(chatId)
        .then((dbMsgs) => {
          if (dbMsgs.length > 0) {
            setMessages(
            dbMsgs.map((m: any) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant' | 'system',
              parts: [{ type: 'text', text: m.content }],
                createdAt: m.createdAt,
              }))
            );
          }
        })
        .catch((err) => console.error('Failed to load chat history:', err))
        .finally(() => setLoadingHistory(false));
    } else {
      setMessages([]);
    }
  }, [chatId]); // Removed setMessages dependency to fix infinite rendering loop

  // Parse booking state from messages
  useEffect(() => {
    const assistantMsgs = messages.filter((m) => m.role === 'assistant');
    const lastAssistantMsg = assistantMsgs[assistantMsgs.length - 1];

    if (lastAssistantMsg && lastAssistantMsg.parts) {
      const textPart = lastAssistantMsg.parts.find((p) => p.type === 'text');
      if (textPart && 'text' in textPart) {
        const match = textPart.text.match(/\[BOOKING_STATE:\s*({.*?})\]/s);
        if (match) {
          try {
            const state = JSON.parse(match[1]);
            setBookingState((prev: any) => JSON.stringify(prev) === JSON.stringify(state) ? prev : state);
          } catch (e) {
            // Ignore invalid JSON during stream chunks
          }
        }
      }
    }
  }, [messages]);

  // Trigger payment simulation if state is "payment"
  useEffect(() => {
    if (bookingState.step === 'payment' && !processingPayment) {
      handlePaymentSimulation();
    }
  }, [bookingState]);

  const handlePaymentSimulation = async () => {
    setProcessingPayment(true);
    
    // 2.5s delay to simulate transaction gateway redirect
    setTimeout(async () => {
      try {
        await createTicket({
          attraction: bookingState.attraction || 'Unknown Attraction',
          date: bookingState.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
          time: bookingState.time || '12:00 PM',
          adult: bookingState.tickets?.adult || 0,
          child: bookingState.tickets?.child || 0,
          foreigner: bookingState.tickets?.foreigner || 0,
          totalPrice: bookingState.totalPrice || 50,
        });

        setBookingState((prev: any) => ({ ...prev, step: 'completed' }));
        await submitMessage('System Confirmation: Payment of total price was successful. The ticket has been successfully created. Tell the user their ticket is ready on the Dashboard QR section.');
      } catch (err) {
        console.error('Error issuing ticket:', err);
      } finally {
        setProcessingPayment(false);
      }
    }, 2500);
  };

  const submitMessage = async (content: string) => {
    if (!content.trim() || requestLoading || processingPayment) return;

    setChatError(undefined);
    setRequestLoading(true);

    let activeId = chatId || localChatId;
    if (!activeId) {
      try {
        activeId = await createActiveChat();
      } catch (err) {
        console.error('Failed to create new chat:', err);
        setChatError(err instanceof Error ? err : new Error('Failed to create chat.'));
        setRequestLoading(false);
        return;
      }
    }

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: 'user',
      parts: [{ type: 'text', text: content }],
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const preferredLanguage = typeof window !== 'undefined' ? localStorage.getItem('kataar_language') || 'English' : 'English';
    
    try {
      const response = await fetch('/api/chat-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, chatId: activeId, language: preferredLanguage }),
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Chat request failed.');
      }

      const data = (await response.json()) as { reply: string; messageId?: string };
      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId || `local-assistant-${Date.now()}`,
          role: 'assistant',
          parts: [{ type: 'text', text: data.reply }],
          createdAt: new Date(),
        },
      ]);
    } catch (err) {
      console.error('Chat request failed:', err);
      setChatError(err instanceof Error ? err : new Error('Chat request failed.'));
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || isLoading || processingPayment) return;

    const content = inputMsg;
    setInputMsg('');
    await submitMessage(content);
  };

  const handleChipClick = async (attractionName: string) => {
    if (isLoading || processingPayment) return;

    await submitMessage(`I'd like to book tickets for ${attractionName}`);
  };

  const handleQuickBookDemo = async () => {
    if (isLoading || processingPayment) return;

    await submitMessage("I want to book a ticket for a historic place near me for 2 adults next Saturday at 11:00 AM. Please use maps or web results to suggest options first.");
  };

  return (
    <div className="flex gap-6 w-screen h-screen p-6 overflow-hidden max-md:p-3">
      {/* 1. Left Column (Sidebar) */}
      <ChatSidebar activeChatId={chatId} />

      {/* 2. Middle Column (Chat Workspace) */}
      <main className="flex-1 h-full flex flex-col rounded-2xl overflow-hidden bg-bg-glass backdrop-blur-xl border border-border-glass relative">
        <header className="flex justify-between items-center py-5 px-6 border-b border-white/5 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold text-text-primary">Historic Place Booking</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]" />
              <span className="text-[11px] text-emerald-500 font-semibold uppercase tracking-wide">Map-backed queue-free tickets</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <a 
              href="/chat"
              className="text-text-secondary hover:bg-white/5 hover:text-text-primary p-2 rounded-lg transition"
              title="Reset Conversation"
            >
              <RefreshCw size={18} />
            </a>
          </div>
        </header>

        {/* Suggestion Chips */}
        <section className="flex gap-2.5 px-6 py-4 border-b border-white/[0.03] overflow-x-auto shrink-0 scrollbar-none">
          <button 
            onClick={() => handleChipClick('Find historic monuments near me')} 
            className="bg-white/[0.03] border border-border-glass hover:bg-white/[0.06] hover:border-accent-purple/40 text-accent-lavender text-xs px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            disabled={isLoading || processingPayment}
          >
            Find historic monuments near me
          </button>
          <button 
            onClick={() => handleChipClick('Book tickets for a historic fort near me')} 
            className="bg-white/[0.03] border border-border-glass hover:bg-white/[0.06] hover:border-accent-purple/40 text-accent-lavender text-xs px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            disabled={isLoading || processingPayment}
          >
            Book a historic fort
          </button>
          <button 
            onClick={() => handleChipClick('Show popular heritage sites in my city with ticket options')} 
            className="bg-white/[0.03] border border-border-glass hover:bg-white/[0.06] hover:border-accent-purple/40 text-accent-lavender text-xs px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer disabled:opacity-50"
            disabled={isLoading || processingPayment}
          >
            Heritage sites in my city
          </button>
        </section>

        {/* Messaging Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 min-h-0">
          {messages.length === 0 && !loadingHistory && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 max-w-sm mx-auto">
              <Sparkles className="text-accent-purple animate-[pulse_2s_infinite]" size={36} />
              <h3 className="text-base font-semibold text-text-primary">Skip the line at any historic place</h3>
              <p className="text-xs text-text-secondary">
                Search monuments, museums, forts, galleries, and heritage locations, then book a QR ticket for the gate.
              </p>
            </div>
          )}

          {chatError && (
            <div className="flex items-start gap-3 rounded-xl border border-accent-red/25 bg-accent-red/10 p-4 text-sm text-accent-red-hover">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Chat failed to respond.</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {chatError.message || 'Check the API key and server logs, then try again.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChatError(undefined)}
                className="rounded-lg border border-accent-red/25 px-3 py-1 text-xs font-semibold hover:bg-accent-red/10"
              >
                Dismiss
              </button>
            </div>
          )}

          {loadingHistory ? (
            <div className="flex-1 flex flex-col items-center justify-center text-xs text-text-secondary gap-3">
              <Loader2 className="animate-spin text-accent-purple" size={24} />
              <span>Loading messages...</span>
            </div>
          ) : (
            messages.map((msg) => {
              const rawContent = (msg.parts || []).filter((p: any) => p.type === 'text').map((p: any) => p.text).join('');
              const displayContent = rawContent.replace(/\[BOOKING_STATE:\s*({.*?})\]/s, '').trim();
              
              // Only render if there's actually content to show (sometimes it's purely a state update)
              if (!displayContent && msg.role === 'assistant') return null;

              return (
                <MessageBubble 
                  key={msg.id}
                  role={msg.role}
                  content={displayContent}
                  createdAt={msg.createdAt}
                />
              );
            })
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex w-full gap-3.5 my-3.5 justify-start">
              <div className="w-9 h-9 rounded-full bg-accent-purple/20 flex items-center justify-center border border-accent-purple/30 text-accent-purple shrink-0 mt-1">
                <Sparkles size={16} />
              </div>
              <div className="flex items-center gap-1.5 bg-accent-purple-bubble border border-border-glass px-4 py-3 rounded-2xl rounded-tl-none">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-[bounce_1.4s_infinite_both_-0.32s]" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-[bounce_1.4s_infinite_both_-0.16s]" />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-[bounce_1.4s_infinite_both]" />
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Booking Card inline / status preview */}
        {bookingState.step !== 'idle' && bookingState.step !== 'completed' && (
          <div className="mx-6 mt-2 shrink-0 bg-[#161226]/95 backdrop-blur-md border border-accent-purple/30 rounded-xl p-4 flex flex-col gap-3 shadow-lg z-20 animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-accent-purple">
                <TicketIcon size={16} />
                <h4 className="text-sm font-semibold">Booking in Progress</h4>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full">
                {bookingState.step}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {bookingState.attraction && (
                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="self-start text-xs font-semibold flex items-center gap-1.5 text-accent-lavender hover:text-white transition bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10"
                >
                  <MapPin size={14} />
                  {showMap ? 'Hide Map' : 'View on Map'}
                </button>
              )}
              
              {showMap && bookingState.attraction && (
                <div className="w-full h-40 rounded-lg overflow-hidden border border-white/10 relative shadow-inner animate-[slideDown_0.2s_ease-out]">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(bookingState.attraction)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  ></iframe>
                </div>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              {bookingState.attraction && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <MapPin size={13} className="text-accent-lavender" />
                  <span>{bookingState.attraction}</span>
                </div>
              )}
              {bookingState.date && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Calendar size={13} className="text-accent-lavender" />
                  <span>{bookingState.date}</span>
                </div>
              )}
              {bookingState.time && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Clock size={13} className="text-accent-lavender" />
                  <span>{bookingState.time}</span>
                </div>
              )}
              {bookingState.tickets && (bookingState.tickets.adult > 0 || bookingState.tickets.child > 0 || bookingState.tickets.foreigner > 0) && (
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <User size={13} className="text-accent-lavender" />
                  <span>
                    {[
                      bookingState.tickets.adult > 0 ? `${bookingState.tickets.adult} Adult` : '',
                      bookingState.tickets.child > 0 ? `${bookingState.tickets.child} Child` : '',
                      bookingState.tickets.foreigner > 0 ? `${bookingState.tickets.foreigner} Foreigner` : ''
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              </div>
            </div>
            
            {bookingState.totalPrice !== undefined && (
              <div className="flex justify-between items-center text-xs border-top border-white/5 pt-2 font-semibold">
                <span className="text-text-secondary">Amount Payable:</span>
                <span className="text-yellow-500 text-lg font-bold">Rs. {bookingState.totalPrice}</span>
              </div>
            )}
          </div>
        )}

        {/* Payment Processing Overlay */}
        {processingPayment && (
          <div className="absolute inset-0 bg-[#06050a]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-30">
            <Loader2 className="animate-spin text-accent-green" size={36} />
            <h3 className="text-lg font-semibold text-text-primary">Redirecting to Payment Gateway</h3>
            <p className="text-xs text-text-secondary">Please do not close this window or click back...</p>
          </div>
        )}

        {/* Chat Input form */}
        <form onSubmit={handleSend} className="p-5 bg-gradient-to-t from-black/40 to-transparent shrink-0">
          <div className="flex items-center gap-3 p-2 bg-white/[0.03] border border-border-glass rounded-xl shadow-inner">
            <input
              type="text"
              placeholder={processingPayment ? "Processing payment..." : "Ask KATAAR to book any historic place..."}
              className="flex-1 bg-transparent py-2.5 px-3 outline-none text-sm text-text-primary placeholder:text-text-muted disabled:opacity-50"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isLoading || processingPayment}
            />
            <button 
              type="submit" 
              className="w-10 h-10 rounded-full bg-accent-green text-white flex items-center justify-center shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 cursor-pointer shrink-0"
              disabled={!inputMsg.trim() || isLoading || processingPayment}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </main>

      {/* 3. Right Column (Utility Dashboard Panel) */}
      <div className="w-[340px] flex flex-col gap-5 h-full max-lg:hidden shrink-0">
        {/* User Card */}
        {session?.user && (
          <div className="p-5 bg-white/[0.03] border border-border-glass rounded-2xl shadow-md">
            <div className="flex items-center gap-4">
              <img 
                src={session.user.image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60"} 
                alt="Avatar" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Helium";
                }}
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <h3 className="text-sm font-semibold text-text-primary truncate">
                  {(session.user as any).firstName 
                    ? `${(session.user as any).firstName} ${(session.user as any).lastName || ''}`.trim() 
                    : session.user.name || 'Helium'}
                </h3>
                <span className="text-[11px] text-text-secondary truncate">{session.user.email}</span>
              </div>
              <a 
                href="/qr"
                className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover px-3 py-1.5 text-[10px] font-bold rounded-lg transition"
              >
                DASHBOARD
              </a>
            </div>
          </div>
        )}

        {/* Weather Widget */}
        <WeatherWidget />

        {/* Quick Demo Widget */}
        <button 
          onClick={handleQuickBookDemo} 
          className="flex items-center justify-center gap-2.5 w-full p-4 bg-white/[0.01] hover:bg-white/[0.04] border border-dashed border-white/10 hover:border-accent-purple/40 text-text-secondary hover:text-text-primary rounded-2xl transition cursor-pointer text-xs font-semibold"
          disabled={isLoading || processingPayment}
        >
          <Plus size={16} />
          <span>Quick Book Demo</span>
        </button>
      </div>
    </div>
  );
}
