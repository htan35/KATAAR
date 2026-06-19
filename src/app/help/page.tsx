'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Landmark, QrCode, Loader2 } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

export default function HelpPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How do I book an E-Ticket with KATAAR-Bot?",
      answer: "Go to the Chat Dashboard and tell KATAAR-Bot the historic place, city, or area you want to visit. It can search for monuments, forts, museums, galleries, and heritage sites, then guide you through date, time, visitor count, and QR ticket checkout.",
      icon: MessageSquare
    },
    {
      question: "Can I book for places that are not pre-listed?",
      answer: "Yes. KATAAR is designed for any historic or cultural location. If you ask for places near you, share your city or area so the assistant can use maps and web results to suggest real options.",
      icon: Landmark
    },
    {
      question: "Where do I find my E-Tickets and QR codes?",
      answer: "Once your booking and simulated payment are complete, your active E-tickets are added to your Dashboard. Click 'Your QR' in the sidebar to view ticket stubs and scan active QR codes at the entry gate.",
      icon: QrCode
    },
    {
      question: "Can I cancel a booked E-Ticket?",
      answer: "Yes, you can cancel any active ticket by going to the 'Your QR' page and clicking the trash can icon ('Cancel Ticket') on the top right of the ticket stub. The system will remove the ticket from your active list.",
      icon: HelpCircle
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-purple" size={36} />
          <span className="text-sm text-text-secondary">Syncing session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 w-screen h-screen p-6 overflow-hidden max-md:p-3">
      {/* Left Column (Sidebar) */}
      <ChatSidebar />

      {/* Main Content Area */}
      <main className="flex-1 h-full flex flex-col rounded-2xl overflow-hidden bg-bg-glass backdrop-blur-xl border border-border-glass p-8 max-md:p-4">
        <header className="mb-8 shrink-0">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display mb-1">Help & FAQ</h1>
          <p className="text-sm text-text-secondary">Find quick answers to common questions about KATAAR.</p>
        </header>

        <div className="flex-1 flex justify-center items-start overflow-y-auto pr-1">
          <div className="w-full max-w-[700px] p-8 bg-white/[0.02] border border-border-glass rounded-2xl flex flex-col gap-6 shadow-md max-sm:p-5">
            
            <div className="flex flex-col gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                const Icon = faq.icon;

                return (
                  <div 
                    key={index} 
                    className={`border border-white/5 rounded-xl overflow-hidden transition-all duration-200 ${
                      isOpen ? 'bg-accent-purple/5 border-accent-purple/20' : 'bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <button 
                      onClick={() => toggleFAQ(index)} 
                      className="w-full flex justify-between items-center p-4 text-left font-semibold text-sm text-text-primary gap-4 outline-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className="text-accent-purple" />
                        <span>{faq.question}</span>
                      </div>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-5 pl-11 text-xs text-text-secondary leading-relaxed animate-[fadeIn_0.2s_ease-out]">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-white/5 pt-6 flex flex-col items-center gap-4 text-center text-xs text-text-secondary leading-relaxed">
              <p>Still need help? You can start a chat with the booking assistant at any time to query ticket terms.</p>
              <button 
                onClick={() => router.push('/chat')} 
                className="bg-accent-lavender text-bg-primary hover:bg-accent-lavender-hover font-bold text-sm px-6 py-2.5 rounded-lg transition duration-200"
              >
                Start Chat Session
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
