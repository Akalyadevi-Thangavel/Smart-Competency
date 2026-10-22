import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Trash2, Sparkles, User, HelpCircle, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp?: string;
}

export const AICoachPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useNotification();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'What are my biggest skill gaps for my target role?',
    'Give me a mock technical interview question',
    'How should I format my resume for ATS compliance?',
    'Generate a 7-day study schedule for my 2.5 hours/day',
    'Explain how to answer "Tell me about a difficult bug you resolved"'
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadChatHistory = async () => {
    try {
      const history = await api.getCoachHistory();
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message
        setMessages([
          {
            role: 'assistant',
            message: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! I'm your AI Career Coach calibrated for **${profile?.target_role_name || 'Full Stack Developer'}**.\n\nI continuously monitor your diagnostic assessments, coding lab consistency, and resume keyword coverage to give you tactical, actionable advice.\n\nWhat would you like to work on today?`,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err: any) {
      console.warn('[AICoach] Could not load history:', err.message);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text || !text.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      message: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMsg('');
    setIsTyping(true);

    try {
      const reply = await api.chatCoach(text.trim());
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: reply.message,
        timestamp: reply.timestamp
      }]);
    } catch (err: any) {
      showToast({ title: 'AI Assistant unavailable', message: err.message, type: 'error' });
      setMessages(prev => [...prev, {
        role: 'assistant',
        message: 'I encountered an issue connecting to the AI service. Please try asking again in a moment.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearCoachHistory();
      setMessages([
        {
          role: 'assistant',
          message: 'Conversation cleared! How can I assist your career preparation today?',
          timestamp: new Date().toISOString()
        }
      ]);
      showToast({ title: 'Chat cleared', type: 'info' });
    } catch (err: any) {
      showToast({ title: 'Clear error', message: err.message, type: 'error' });
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: 1000, margin: '0 auto', gap: 16 }}>
      {/* Header Bar */}
      <Card style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Bot size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Career Coach
              </h2>
              <Badge variant="primary" dot>Context Aware</Badge>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Tailored for {profile?.target_role_name || 'Software Engineering'} readiness
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="btn-icon"
          title="Clear Conversation History"
          style={{ color: 'var(--text-muted)' }}
        >
          <Trash2 size={18} />
        </button>
      </Card>

      {/* Suggested Prompt Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)'
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Chat Area */}
      <Card style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: 12,
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: isUser ? 'var(--primary-600)' : 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: isUser ? '#ffffff' : 'var(--primary-400)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isUser ? 'var(--primary-600)' : 'var(--bg-surface-elevated)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '0.925rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-start' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-400)' }}>
              <Bot size={16} />
            </div>
            <div style={{ padding: '12px 18px', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', gap: 4, alignItems: 'center' }}>
              <span className="animate-spin" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-400)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Coach is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </Card>

      {/* Input Box */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        style={{ display: 'flex', gap: 12, position: 'relative' }}
      >
        <input
          type="text"
          placeholder="Ask for advice on skill gaps, mock interview questions, or study planning..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          disabled={isTyping}
          style={{ flex: 1, height: 48, borderRadius: 'var(--radius-lg)', paddingLeft: 20, paddingRight: 50, fontSize: '0.95rem' }}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={!inputMsg.trim() || isTyping}
          style={{ height: 48, width: 48, padding: 0, borderRadius: 'var(--radius-lg)', position: 'absolute', right: 0 }}
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
};

export default AICoachPage;
