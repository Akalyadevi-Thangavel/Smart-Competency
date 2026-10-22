import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Layers,
  MapPin,
  Code2,
  FileCheck,
  MessageSquare,
  FolderGit2,
  Compass,
  Award,
  Trophy,
  Sparkles,
  Bot,
  CalendarCheck,
  Settings,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  adminOnly?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'dashboard',   label: 'Dashboard',          icon: <LayoutDashboard size={19} />, path: '/dashboard' },
    { id: 'daily-plan',  label: "Today's Plan",        icon: <CalendarCheck size={19} />,  path: '/daily-plan', badge: 'Daily' },
    { id: 'assessments', label: 'Assessments',         icon: <Target size={19} />,         path: '/assessments' },
    { id: 'skills',      label: 'Skill Matrix',        icon: <Layers size={19} />,         path: '/skills' },
    { id: 'skill-gap',   label: 'Skill Gap Analysis',  icon: <Award size={19} />,          path: '/skill-gap' },
    { id: 'roles',       label: 'Career Match',        icon: <Compass size={19} />,        path: '/roles' },
    { id: 'learning',    label: 'Learning Roadmap',    icon: <MapPin size={19} />,         path: '/learning' },
    { id: 'coding',      label: 'Coding Lab',          icon: <Code2 size={19} />,          path: '/coding' },
    { id: 'interview',   label: 'Interview Prep',      icon: <MessageSquare size={19} />,  path: '/interview' },
    { id: 'projects',    label: 'Project Portfolio',   icon: <FolderGit2 size={19} />,     path: '/projects' },
    { id: 'resume',      label: 'Resume Analyzer',     icon: <FileCheck size={19} />,      path: '/resume' },
    { id: 'leaderboard', label: 'Leaderboard',         icon: <Trophy size={19} />,         path: '/leaderboard' },
    { id: 'ai-coach',    label: 'AI Career Coach',     icon: <Bot size={19} />,            path: '/ai-coach', badge: 'AI' },
    { id: 'settings',    label: 'Settings',            icon: <Settings size={19} />,       path: '/settings' },
  ];

  if (user?.role === 'admin') {
    navItems.unshift({
      id: 'admin',
      label: 'Admin Portal',
      icon: <ShieldAlert size={19} />,
      path: '/admin',
      badge: 'Admin'
    });
  }

  const handleNavClick = (path: string) => {
    navigate(path);
    onCloseMobile();
  };

  const currentPath = location.pathname;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo & Title */}
        <div
          style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0 12px' : '0 20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div
            onClick={() => handleNavClick('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-cyan) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                fontWeight: 800,
                fontSize: '1.15rem'
              }}
            >
              SC
            </div>
            {!collapsed && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Smart Competency
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  AI Career Platform
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="btn-icon"
              title="Collapse Sidebar"
              style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: collapsed ? '11px 0' : '10px 14px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: isActive ? 'var(--primary-400)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-medium)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.9rem',
                  transition: 'all var(--transition-fast)',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: collapsed ? 2 : 0,
                      top: '25%',
                      bottom: '25%',
                      width: 3,
                      borderRadius: '0 4px 4px 0',
                      backgroundColor: 'var(--primary-500)',
                    }}
                  />
                )}
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!collapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      backgroundColor: item.badge === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                      color: item.badge === 'Admin' ? '#f87171' : 'var(--primary-400)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer profile snippet & collapse expand */}
        <div
          style={{
            padding: '16px 14px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              className="btn-icon"
              title="Expand Sidebar"
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <img
                  src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={profile?.full_name || 'User'}
                  style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary-500)' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.full_name || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile?.target_role_name || (user?.role === 'admin' ? 'Administrator' : 'Full Stack Developer')}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="btn-icon"
                style={{ padding: 6 }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
