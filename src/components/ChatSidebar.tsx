'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  MessageSquare, 
  QrCode, 
  User, 
  History, 
  Settings, 
  HelpCircle, 
  Menu, 
  Plus, 
  LogOut,
  Trash2
} from 'lucide-react';
import { getUserChats, deleteChat, createChat } from '@/lib/actions';

interface ChatSidebarProps {
  activeChatId?: string | null;
  onSelectChat?: (chatId: string) => void;
  onNewChat?: () => void;
}

export default function ChatSidebar({ activeChatId, onSelectChat, onNewChat }: ChatSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Load user chats
  const fetchChats = async () => {
    try {
      setLoading(true);
      const userChats = await getUserChats();
      setChats(userChats);
    } catch (err) {
      console.error('Error fetching user chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    }
  }, [session?.user?.id, activeChatId]);

  const navItems = [
    { name: 'Chat Dashboard', path: '/chat', icon: MessageSquare },
    { name: 'Your QR', path: '/qr', icon: QrCode },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  const handleCreateNewChat = async () => {
    if (creatingChat) return;
    if (onNewChat) {
      onNewChat();
      return;
    }

    try {
      setCreatingChat(true);
      const newChat = await createChat('New Chat');
      await fetchChats();
      router.push(`/chat?id=${newChat.id}`);
    } catch (err) {
      console.error('Failed to create new chat:', err);
    } finally {
      setCreatingChat(false);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this chat history?')) {
      try {
        await deleteChat(chatId);
        fetchChats();
        if (activeChatId === chatId) {
          router.push('/chat');
        }
      } catch (err) {
        console.error('Failed to delete chat:', err);
      }
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-80 h-full flex flex-col p-6 bg-bg-glass backdrop-blur-xl border border-border-glass rounded-2xl gap-5 shadow-2xl overflow-hidden shrink-0">
      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <Menu className="text-text-secondary cursor-pointer hover:text-text-primary transition" size={20} />
        <Link href="/">
          <h2 className="text-2xl font-extrabold tracking-widest bg-gradient-to-r from-white to-accent-lavender bg-clip-text text-transparent font-display">
            KATAAR
          </h2>
        </Link>
      </div>

      {/* User Profile Card */}
      {session?.user && (
        <div className="flex flex-col p-4 gap-3 bg-white/[0.03] border border-border-glass rounded-xl shadow-inner">
          <div className="flex items-center gap-3">
            <img 
              src={session.user.image || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60"} 
              alt="Avatar" 
              className="w-11 h-11 rounded-full object-cover border-2 border-white/10"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Helium";
              }}
            />
            <div className="flex flex-col overflow-hidden">
              <h4 className="text-sm font-semibold text-text-primary truncate">
                {(session.user as any).firstName 
                  ? `${(session.user as any).firstName} ${(session.user as any).lastName || ''}`.trim() 
                  : session.user.name || 'Helium'}
              </h4>
              <span className="text-xs text-text-secondary truncate">{session.user.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1">
        <div className="text-[10px] uppercase tracking-wider text-text-muted pl-3 mb-1">
          Dashboard
        </div>
        <ul className="flex flex-col gap-1.5 list-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path}>
                <Link 
                  href={item.path} 
                  prefetch={false}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm transition relative ${
                    active 
                      ? 'bg-accent-purple/10 text-accent-purple font-semibold' 
                      : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {active && <span className="absolute left-0 top-1/4 h-1/2 w-[3px] bg-accent-purple rounded-r" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Chat History Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center px-3 mb-2 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-text-muted">Chat History</span>
          <button 
            type="button"
            onClick={handleCreateNewChat}
            disabled={creatingChat}
            className="p-1 rounded hover:bg-white/5 text-text-secondary hover:text-text-primary transition disabled:opacity-50 disabled:cursor-wait"
            title="New Chat"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
          {loading && chats.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-4">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="text-xs text-text-muted text-center py-4">No previous chats</div>
          ) : (
            chats.map((chat) => {
              const active = activeChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  className={`relative flex items-center rounded-lg text-xs cursor-pointer transition select-none group ${
                    active 
                      ? 'bg-white/[0.06] border border-white/10 text-text-primary' 
                      : 'border border-transparent text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'
                  }`}
                >
                  <Link
                    href={`/chat?id=${chat.id}`}
                    prefetch={false}
                    onClick={(event) => {
                      if (!onSelectChat) return;
                      event.preventDefault();
                      onSelectChat(chat.id);
                    }}
                    className="flex items-center gap-2.5 truncate w-full p-2.5 pr-9"
                  >
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                  <button 
                    type="button"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-accent-red p-1 rounded transition shrink-0"
                    title="Delete Chat"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="border-t border-white/5 pt-3 shrink-0">
        <button 
          type="button"
          onClick={async () => {
            if (signingOut) return;
            setSigningOut(true);
            await signOut({ callbackUrl: '/login' });
          }}
          disabled={signingOut}
          className="w-full flex items-center justify-between p-3 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition disabled:opacity-50 disabled:cursor-wait"
        >
          <span>{signingOut ? 'Logging out...' : 'Log out'}</span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
