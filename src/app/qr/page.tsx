'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, Landmark, Trash2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getUserTickets, deleteTicket } from '@/lib/actions';

export default function QRPage() {
  const { data: session, status } = useSession();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const userTickets = await getUserTickets();
      setTickets(userTickets);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status]);

  const activeTickets = tickets.filter(t => t.status === 'existing');

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to cancel this ticket?')) {
      try {
        await deleteTicket(id);
        fetchTickets();
      } catch (err) {
        console.error('Failed to cancel ticket:', err);
      }
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-purple" size={36} />
          <span className="text-sm text-text-secondary">Loading your tickets...</span>
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display mb-1">Your QR</h1>
          <p className="text-sm text-text-secondary">The E-tickets you have booked currently.</p>
        </header>

        {activeTickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
            <AlertCircle size={44} className="text-text-muted" />
            <h3 className="text-lg font-semibold text-text-primary">No Active E-Tickets</h3>
            <p className="text-xs text-text-secondary">You don't have any upcoming trips. Talk to our assistant in the Chat Panel to book a ticket!</p>
            <a 
              href="/chat"
              className="bg-accent-purple text-bg-primary hover:bg-accent-purple-hover font-bold text-sm px-6 py-3 rounded-lg transition duration-200 mt-2"
            >
              Go Book a Ticket
            </a>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6">
            {activeTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="flex h-[230px] max-sm:h-auto max-sm:flex-col bg-white/[0.02] hover:bg-white/[0.04] border border-border-glass hover:border-accent-purple/20 rounded-2xl relative overflow-hidden transition duration-300 shadow-md group shrink-0"
              >
                
                {/* Left Ticket Info */}
                <div className="flex-1 p-6 flex flex-col justify-between relative max-sm:p-4">
                  <div className="flex items-center gap-2 text-accent-purple">
                    <Landmark size={16} />
                    <h3 className="text-lg font-bold text-text-primary truncate pr-28 max-sm:pr-0">{ticket.attraction}</h3>
                  </div>

                  <div className="flex gap-4 my-3 text-sm text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-accent-lavender" />
                      <span>{ticket.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-accent-lavender" />
                      <span>{ticket.time}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-2 max-sm:mt-2">
                    <div className="flex flex-wrap gap-1.5">
                      {ticket.adult > 0 && (
                        <span className="text-[10px] font-bold text-text-primary bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          ADULT {String(ticket.adult).padStart(2, '0')}
                        </span>
                      )}
                      {ticket.child > 0 && (
                        <span className="text-[10px] font-bold text-text-primary bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          CHILD {String(ticket.child).padStart(2, '0')}
                        </span>
                      )}
                      {ticket.foreigner > 0 && (
                        <span className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 border border-accent-purple/25 px-2 py-0.5 rounded">
                          FOREIGNER {String(ticket.foreigner).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-text-secondary">Paid:</span>
                      <span className="text-xl font-extrabold text-yellow-500">Rs. {ticket.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-accent-green font-semibold">
                    <ShieldCheck size={14} />
                    <span>Verified E-Ticket</span>
                  </div>

                  <button 
                    onClick={() => handleDelete(ticket.id)} 
                    className="absolute top-6 right-6 max-sm:static max-sm:mt-4 max-sm:w-full flex items-center justify-center gap-1.5 text-text-muted hover:text-accent-red hover:bg-accent-red/10 border border-transparent hover:border-accent-red/20 text-xs px-3 py-1.5 rounded-lg transition duration-200"
                    title="Cancel E-Ticket"
                  >
                    <Trash2 size={13} />
                    <span>Cancel Ticket</span>
                  </button>
                </div>

                {/* Dotted Tear Line Visual Divider */}
                <div className="w-5 relative flex flex-col items-center justify-center h-full max-sm:hidden shrink-0">
                  <div className="w-5 h-5 bg-bg-primary rounded-full absolute -top-2.5 z-10 border border-border-glass shadow-[inset_0_-4px_6px_rgba(0,0,0,0.5)]" />
                  <div className="h-[calc(100%-24px)] w-[1px] border-l-2 border-dotted border-white/15" />
                  <div className="w-5 h-5 bg-bg-primary rounded-full absolute -bottom-2.5 z-10 border border-border-glass shadow-[inset_0_4px_6px_rgba(0,0,0,0.5)]" />
                </div>

                {/* Right Ticket QR Code */}
                <div className="w-[180px] max-sm:w-full p-6 flex flex-col items-center justify-center bg-white/[0.01] border-l border-white/5 max-sm:border-l-0 max-sm:border-t max-sm:border-dashed border-white/10 gap-3 shrink-0">
                  <div className="bg-white p-2.5 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <QRCodeSVG
                      value={ticket.qrData}
                      size={110}
                      bgColor="transparent"
                      fgColor="#000000"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-muted tracking-widest">{ticket.id.toUpperCase()}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
