import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Flame,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Notification } from '../../types';

interface TopbarProps {
  onOpenMobile: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobile,
  notifications = [],
  onMarkNotificationRead,
}) => {
  const { user, profile, demoLogin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="topbar">
      {/* Left section: mobile hamburger & search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onOpenMobile}
          className="btn-icon"
          style={{ display: 'none' }}
          id="mobile-nav-toggle"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search skills, assessments, coding problems..."
            style={{
              width: 320,
              paddingLeft: 36,
              paddingRight: 14,
              fontSize: '0.85rem',
              height: 38,
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          />
        </div>
      </div>

      {/* Right section: streak, readiness pill, notification, theme, demo switch, profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Streak indicator */}
        <div
          title={`${profile?.learning_streak || 1} day learning consistency streak`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--accent-amber)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'default'
          }}
        >
          <Flame size={16} />
          <span>{profile?.learning_streak || 1}d Streak</span>
        </div>

        {/* Placement Readiness Pill */}
        <div
          onClick={() => navigate('/skill-gap')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            cursor: 'pointer'
          }}
          title="Click to view Skill Gap Analysis"
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Readiness:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-400)' }}>
            {profile?.placement_readiness || 74}%
          </span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)' }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            title="Notifications"
            style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', position: 'relative' }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-rose)',
                  boxShadow: '0 0 6px var(--accent-rose)'
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 340,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                overflow: 'hidden',
                animation: 'fadeIn 150ms ease-out'
              }}
            >
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadCount} unread</span>
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / 1-Click Demo Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              cursor: 'pointer'
            }}
          >
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={profile?.full_name || 'User'}
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {profile?.full_name?.split(' ')[0] || 'Account'}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 48,
                right: 0,
                width: 240,
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 50,
                padding: '8px 0',
                animation: 'fadeIn 150ms ease-out'
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: 6 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{profile?.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>

              {/* 1-Click Demo Account Switcher */}
              <div style={{ padding: '4px 16px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Switch Demo Persona
              </div>

              <button
                onClick={async () => {
                  await demoLogin('student');
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.825rem',
                  color: user?.role === 'student' ? 'var(--primary-400)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <UserCheck size={16} />
                <span>Student (Alex Chen)</span>
              </button>

              <button
                onClick={async () => {
                  await demoLogin('admin');
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.825rem',
                  color: user?.role === 'admin' ? 'var(--accent-rose)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={16} />
                <span>Admin / Dean (Dr. Sarah)</span>
              </button>

              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Settings & Preferences
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  fontSize: '0.825rem',
                  color: 'var(--accent-rose)',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
