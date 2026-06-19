'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  MessageSquare, 
  QrCode, 
  User, 
  History, 
  Settings, 
  HelpCircle, 
  Menu, 
  Home, 
  ArrowLeft,
  BookOpen,
  Globe,
  TrendingUp
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: 'Chat Dashboard', path: '/chat', icon: MessageSquare },
    { name: 'Your QR', path: '/qr', icon: QrCode },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Help', path: '/help', icon: HelpCircle },
  ];

  // Helper to check if route is active
  const isActive = (path: string) => pathname === path;

  // Render user card at the top (different style for different routes if needed, but keeping it clean and unified)
  const renderUserCard = () => {
    if (!user) return null;

    return (
      <div className="user-profile-card glass-card">
        <div className="user-avatar-container">
          <img 
            src={user.avatarUrl || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=60"} 
            alt="Avatar" 
            className="user-avatar"
            onError={(e) => {
              // fallback if URL fails
              (e.target as HTMLImageElement).src = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Helium";
            }}
          />
          <div className="user-details">
            <h4 className="user-name">{user.name || 'Helium'}</h4>
            <span className="user-email">{user.email || 'helium@gmail.com'}</span>
          </div>
        </div>

        {pathname !== '/chat' ? (
          <a href="/chat" className="nav-profile-btn home-btn">
            <ArrowLeft size={16} />
            <span>HOME</span>
            <Home size={14} className="home-icon-right" />
          </a>
        ) : (
          <a href="/qr" className="nav-profile-btn dashboard-btn">
            <span>DASHBOARD</span>
            <QrCode size={14} className="dashboard-icon-right" />
          </a>
        )}
      </div>
    );
  };

  return (
    <aside className="kataar-sidebar glass-panel">
      <div className="sidebar-header">
        <Menu className="hamburger-icon" size={20} />
        <a href="/">
          <h2 className="brand-logo">KATAAR</h2>
        </a>
      </div>

      {renderUserCard()}

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu</div>
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <li key={item.path} className="nav-item">
                <a 
                  href={item.path} 
                  className={`nav-link ${active ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" size={18} />
                  <span>{item.name}</span>
                  {active && <span className="active-indicator" />}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <button onClick={signOut} className="sign-out-btn">
            Log out
          </button>
        ) : (
          <a href="/login" className="sidebar-login-btn">
            Sign In
          </a>
        )}
      </div>

      <style jsx>{`
        .kataar-sidebar {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          padding: 24px;
          border-radius: 20px;
          gap: 20px;
          box-shadow: var(--shadow-glass);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hamburger-icon {
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .hamburger-icon:hover {
          color: var(--text-primary);
        }

        .brand-logo {
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(to right, #ffffff, #dcd7e6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: 0.05em;
        }

        /* User Profile Card styles */
        .user-profile-card {
          display: flex;
          flex-direction: column;
          padding: 16px;
          gap: 14px;
          background: rgba(30, 27, 45, 0.5);
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .user-avatar-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.1);
        }

        .user-details {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-profile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 8px;
          transition: var(--transition-fast);
          gap: 6px;
        }

        .dashboard-btn {
          background: rgba(184, 172, 197, 0.15);
          color: #dcd7e6;
          border: 1px solid rgba(184, 172, 197, 0.3);
        }

        .dashboard-btn:hover {
          background: rgba(184, 172, 197, 0.25);
          color: #ffffff;
        }

        .home-btn {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.1), rgba(139, 92, 246, 0.15));
          color: #c4b5fd;
          border: 1px solid rgba(167, 139, 250, 0.2);
        }

        .home-btn:hover {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.25));
          color: #ffffff;
        }

        .dashboard-icon-right, .home-icon-right {
          margin-left: auto;
        }

        /* Navigation List styles */
        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-section-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          padding-left: 12px;
          margin-bottom: 4px;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition-fast);
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: rgba(167, 139, 250, 0.08);
          color: var(--accent-purple);
          font-weight: 600;
        }

        .nav-icon {
          color: inherit;
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 3px;
          background: var(--accent-purple);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 12px;
        }

        .sign-out-btn {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          font-size: 13px;
          color: var(--accent-red);
          border-radius: 8px;
        }

        .sign-out-btn:hover {
          background: rgba(239, 68, 68, 0.08);
          color: var(--accent-red-hover);
        }

        .sidebar-login-btn {
          display: block;
          width: 100%;
          text-align: center;
          padding: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 8px;
        }

        .sidebar-login-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </aside>
  );
}
