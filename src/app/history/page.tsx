'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import ChatSidebar from '@/components/ChatSidebar';
import { Calendar, AlertCircle, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { getUserTickets } from '@/lib/actions';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const userTickets = await getUserTickets();
      setTickets(userTickets);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets();
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-purple" size={36} />
          <span className="text-sm text-text-secondary">Loading history logs...</span>
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
          <h1 className="text-3xl font-bold text-text-primary tracking-tight font-display mb-1">History</h1>
          <p className="text-sm text-text-secondary">The E-tickets you have booked in the past.</p>
        </header>

        {tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto">
            <AlertCircle size={44} className="text-text-muted" />
            <h3 className="text-lg font-semibold text-text-primary">No Booking Records</h3>
            <p className="text-xs text-text-secondary">Your history log is currently empty. Start booking with our conversational assistant!</p>
            <a 
              href="/chat"
              className="bg-accent-purple text-bg-primary hover:bg-accent-purple-hover font-bold text-sm px-6 py-3 rounded-lg transition duration-200 mt-2"
            >
              Go to Chat
            </a>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white/[0.01] border border-border-glass rounded-xl shadow-md">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6 max-sm:hidden">No.</th>
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6">Attraction</th>
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6">Date</th>
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6">Price</th>
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6">Status</th>
                  <th className="font-display font-semibold text-xs text-text-muted uppercase tracking-wider py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((ticket, index) => {
                  const isExpired = ticket.status === 'expired';
                  
                  return (
                    <tr key={ticket.id} className="hover:bg-white/[0.02] transition duration-200">
                      <td className="font-mono text-text-muted py-4 px-6 max-sm:hidden">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="font-semibold text-text-primary py-4 px-6">
                        {ticket.attraction}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-text-secondary">
                          <Calendar size={13} className="text-text-muted" />
                          <span>{ticket.date}</span>
                        </div>
                      </td>
                      <td className="font-bold text-text-primary py-4 px-6">
                        Rs. {ticket.totalPrice}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                          isExpired 
                            ? 'bg-white/5 border-white/10 text-text-muted' 
                            : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                        }`}>
                          {isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end">
                          {!isExpired ? (
                            <a 
                              href="/qr"
                              className="flex items-center gap-1.5 bg-accent-purple/10 hover:bg-accent-purple/20 border border-accent-purple/20 hover:border-accent-purple/35 text-accent-purple px-3 py-1.5 rounded-lg text-xs font-semibold transition duration-200"
                              title="View QR Code"
                            >
                              <Eye size={13} />
                              <span>View QR</span>
                            </a>
                          ) : (
                            <a 
                              href="/chat"
                              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition duration-200"
                              title="Book Again"
                            >
                              <RefreshCw size={11} />
                              <span>Book Again</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
