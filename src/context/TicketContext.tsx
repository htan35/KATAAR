'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface TicketMembers {
  adult: number;
  child: number;
  foreigner: number;
}

export interface Ticket {
  id: string;
  userId: string;
  attraction: string;
  date: string;
  time: string;
  members: TicketMembers;
  totalPrice: number;
  qrData: string;
  status: 'existing' | 'expired';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: string;
  isDivider?: boolean;
}

export interface BookingState {
  step: 'idle' | 'attraction' | 'date_time' | 'members' | 'confirm' | 'payment' | 'completed';
  attraction?: string;
  date?: string;
  time?: string;
  tickets?: TicketMembers;
  totalPrice?: number;
}

interface TicketContextType {
  tickets: Ticket[];
  chatMessages: ChatMessage[];
  bookingState: BookingState;
  loadingChat: boolean;
  sendMessage: (text: string) => Promise<void>;
  resetChat: () => void;
  confirmBookingDirectly: () => Promise<void>;
  deleteTicket: (id: string) => void;
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

const INITIAL_MOCK_TICKETS = [
  {
    id: 't-1',
    userId: '',
    attraction: 'Art museum',
    date: '01-07-2024',
    time: '11:00 AM',
    members: { adult: 1, child: 0, foreigner: 0 },
    totalPrice: 20,
    qrData: 'KATAAR-TICKET-ARTMUSEUM-2024-07-01-A1',
    status: 'existing' as const,
    createdAt: '2024-06-30T10:00:00.000Z'
  },
  {
    id: 't-2',
    userId: '',
    attraction: 'Monastery',
    date: '01-07-2024',
    time: '02:00 PM',
    members: { adult: 1, child: 0, foreigner: 0 },
    totalPrice: 50,
    qrData: 'KATAAR-TICKET-MONASTERY-2024-07-01-A1',
    status: 'existing' as const,
    createdAt: '2024-06-30T11:00:00.000Z'
  },
  {
    id: 't-3',
    userId: '',
    attraction: 'National park',
    date: '01-07-2024',
    time: '04:00 PM',
    members: { adult: 1, child: 0, foreigner: 0 },
    totalPrice: 250,
    qrData: 'KATAAR-TICKET-NATIONALPARK-2024-07-01-A1',
    status: 'existing' as const,
    createdAt: '2024-06-30T12:00:00.000Z'
  },
  {
    id: 't-4',
    userId: '',
    attraction: 'Shivaji art museum',
    date: '12-08-2024',
    time: '12:00 PM',
    members: { adult: 2, child: 0, foreigner: 0 },
    totalPrice: 250,
    qrData: 'KATAAR-TICKET-SHIVAJI-2024-08-12-A2',
    status: 'existing' as const,
    createdAt: '2024-08-11T12:00:00.000Z'
  },
  {
    id: 't-5',
    userId: '',
    attraction: 'Peace monastery',
    date: '15-05-2024',
    time: '10:00 AM',
    members: { adult: 1, child: 0, foreigner: 0 },
    totalPrice: 50,
    qrData: 'KATAAR-TICKET-PEACE-2024-05-15-A1',
    status: 'expired' as const,
    createdAt: '2024-05-14T09:00:00.000Z'
  },
  {
    id: 't-6',
    userId: '',
    attraction: 'National Park',
    date: '22-04-2024',
    time: '03:00 PM',
    members: { adult: 3, child: 0, foreigner: 0 },
    totalPrice: 450,
    qrData: 'KATAAR-TICKET-NATIONALPARKEXP-2024-04-22-A3',
    status: 'expired' as const,
    createdAt: '2024-04-21T14:00:00.000Z'
  }
];

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [bookingState, setBookingState] = useState<BookingState>({ step: 'idle' });
  const [loadingChat, setLoadingChat] = useState(false);

  // Load tickets on mount & user change
  useEffect(() => {
    const localData = localStorage.getItem('kataar_tickets');
    let loadedTickets: Ticket[] = [];
    if (localData) {
      loadedTickets = JSON.parse(localData);
    } else {
      // Seed initial mock tickets if empty
      loadedTickets = INITIAL_MOCK_TICKETS;
      localStorage.setItem('kataar_tickets', JSON.stringify(loadedTickets));
    }

    // Filter tickets corresponding to the current logged-in user id or empty (public items)
    if (user) {
      const userTickets = loadedTickets.map(t => {
        if (!t.userId) {
          return { ...t, userId: user.id };
        }
        return t;
      }).filter(t => t.userId === user.id);
      
      setTickets(userTickets);
    } else {
      setTickets(loadedTickets.filter(t => !t.userId));
    }

    // Initialize chat messages
    const initialChat: ChatMessage[] = [
      {
        id: 'c-init',
        sender: 'bot',
        text: 'How i can i help you ?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'c-mode',
        sender: 'system',
        text: 'You have entered chat mode',
        timestamp: new Date().toISOString(),
        isDivider: true
      }
    ];
    setChatMessages(initialChat);
    setBookingState({ step: 'idle' });
  }, [user]);

  // Send message to chatbot API
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setLoadingChat(true);

    try {
      // Formulate payload including history
      // Keep only last 10 messages for prompt efficiency
      const historyPayload = updatedMessages
        .filter(m => !m.isDivider)
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

      // Call API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: historyPayload,
          bookingState 
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const responseData = await response.json();
      const botResponseText = responseData.reply || "Sorry, I encountered an issue processing your request.";
      const updatedBookingState: BookingState = responseData.bookingState || bookingState;

      // 2. Add bot message
      const botMsg: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toISOString()
      };

      let finalMessages = [...updatedMessages, botMsg];

      // Handle booking lifecycle transitions
      setBookingState(updatedBookingState);

      // If the AI confirms the ticket details and moves state to "confirm", we can show confirmation summary.
      // If user said "Yes" and AI marked bookingState as completed/payment, we proceed to simulate payment and complete
      if (updatedBookingState.step === 'payment') {
        const redirectMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: "You're being re-directed to the payment gateway",
          timestamp: new Date().toISOString()
        };
        finalMessages.push(redirectMsg);
        setChatMessages(finalMessages);

        // Simulate short redirect and payment confirmation delay
        setTimeout(() => {
          // Generate final ticket
          const newTicketId = 't-' + Math.random().toString(36).substr(2, 9);
          
          const newTicket: Ticket = {
            id: newTicketId,
            userId: user ? user.id : 'anonymous',
            attraction: updatedBookingState.attraction || 'Unknown Attraction',
            date: updatedBookingState.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
            time: updatedBookingState.time || '12:00 PM',
            members: updatedBookingState.tickets || { adult: 1, child: 0, foreigner: 0 },
            totalPrice: updatedBookingState.totalPrice || 20,
            qrData: `KATAAR-TICKET-${newTicketId}-${Date.now()}`,
            status: 'existing',
            createdAt: new Date().toISOString()
          };

          // Save ticket
          const allTicketsLocal = JSON.parse(localStorage.getItem('kataar_tickets') || '[]');
          const updatedAllTickets = [newTicket, ...allTicketsLocal];
          localStorage.setItem('kataar_tickets', JSON.stringify(updatedAllTickets));
          setTickets(prev => [newTicket, ...prev]);

          // Notify chat completion
          setChatMessages(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substr(2, 9),
              sender: 'bot',
              text: 'Your payment is confirmed . Your E-ticket has been added to your Dashboard’s QR section.',
              timestamp: new Date().toISOString()
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              sender: 'system',
              text: 'Your chat has ended',
              timestamp: new Date().toISOString(),
              isDivider: true
            }
          ]);

          setBookingState({ step: 'completed' });
        }, 2500);
      } else {
        setChatMessages(finalMessages);
      }

    } catch (err) {
      console.error('Chat submit error:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'bot',
          text: 'I apologize, but there was an error communicating with KATAAR services. Please try again.',
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Reset chat back to initial state
  const resetChat = () => {
    const initialChat: ChatMessage[] = [
      {
        id: 'c-init-' + Date.now(),
        sender: 'bot',
        text: 'How i can i help you ?',
        timestamp: new Date().toISOString()
      },
      {
        id: 'c-mode-' + Date.now(),
        sender: 'system',
        text: 'You have entered chat mode',
        timestamp: new Date().toISOString(),
        isDivider: true
      }
    ];
    setChatMessages(initialChat);
    setBookingState({ step: 'idle' });
  };

  // Directly confirm a booking (for shortcut buttons in the UI)
  const confirmBookingDirectly = async () => {
    // For demo buttons like quick suggestions
    setBookingState({
      step: 'confirm',
      attraction: 'The National Museum',
      date: '02-09-2024',
      time: '1:00 PM',
      tickets: { adult: 1, child: 1, foreigner: 1 },
      totalPrice: 280
    });
    
    // Append standard user booking text to simulate conversation flow
    const confirmPromptText = "I'd like to book a ticket for The National Museum";
    await sendMessage(confirmPromptText);
  };

  // Delete a ticket
  const deleteTicket = (id: string) => {
    const allTicketsLocal = JSON.parse(localStorage.getItem('kataar_tickets') || '[]') as Ticket[];
    const filteredAll = allTicketsLocal.filter(t => t.id !== id);
    localStorage.setItem('kataar_tickets', JSON.stringify(filteredAll));
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <TicketContext.Provider value={{
      tickets,
      chatMessages,
      bookingState,
      loadingChat,
      sendMessage,
      resetChat,
      confirmBookingDirectly,
      deleteTicket
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
