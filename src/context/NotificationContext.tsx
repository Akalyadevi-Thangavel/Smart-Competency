import React, { createContext, useContext, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  triggerCelebration: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast, triggerCelebration }}>
      {children}
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 380,
        pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderLeft: `4px solid ${
                t.type === 'success' ? '#10b981' :
                t.type === 'error' ? '#ef4444' :
                t.type === 'warning' ? '#f59e0b' : '#6366f1'
              }`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              boxShadow: 'var(--shadow-lg)',
              animation: 'fadeIn 250ms ease-out forwards',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.title}</strong>
              <button
                onClick={() => removeToast(t.id)}
                style={{ color: 'var(--text-muted)', fontSize: '1.1rem', cursor: 'pointer', padding: 2 }}
              >
                &times;
              </button>
            </div>
            {t.message && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {t.message}
              </p>
            )}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
