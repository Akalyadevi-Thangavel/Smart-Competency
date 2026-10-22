import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Notification } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AppShell: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('smart_competency_sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem('smart_competency_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getNotifications()
        .then(setNotifications)
        .catch(err => console.warn('[AppShell] Could not load notifications:', err.message));
    }
  }, [isAuthenticated]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('[AppShell] Mark read error:', err);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={`main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
        />

        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
