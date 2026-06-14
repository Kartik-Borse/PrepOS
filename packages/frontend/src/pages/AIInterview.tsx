import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCw, Download, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import './AIInterview.css';

type Msg = { role: 'ai' | 'user'; text: string; time?: string };
type Mode = 'coding' | 'behavioral' | 'system';

const WELCOME = "Hi! I'm your AI Interview Coach powered by Gemini.\n\nChoose an interview type from the left panel to begin your mock session. I'll conduct a realistic interview and give you feedback!";

const MODE_OPENERS: Record<Mode, string> = {
  coding: "coding",
  behavioral: "behavioral",
  system: "system design",
};

function formatText(text: string) {
  // Render **bold**, `code`, and newlines
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('`') && part.endsWith('`'))
        return <code key={j} className="inline-code">{part.slice(1, -1)}</code>;
      return part;
    });
    return <span key={i}>{parts}<br /></span>;
  });
}

export default function AIInterview() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [error, setError] = useState('');
  const [sessionCount, setSessionCount] = useState(0);
  // history for Gemini: only non-welcome messages
  const geminiHistory = useRef<{ role: 'user' | 'model'; text: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const startMode = async (m: Mode) => {
    setMode(m);
    setError('');
    geminiHistory.current = [];
    const now = ts();
    setMsgs([{ role: 'ai', text: WELCOME }, { role: 'user', text: `Start a ${MODE_OPENERS[m]} interview`, time: now }]);
    setTyping(true);
    try {
      const { reply } = await api.interviewChat(m, [], `Start a ${MODE_OPENERS[m]} interview session now. Begin immediately.`);
      geminiHistory.current = [
        { role: 'user', text: `Start a ${MODE_OPENERS[m]} interview session now.` },
        { role: 'model', text: reply },
      ];
      setMsgs(prev => [...prev, { role: 'ai', text: reply, time: ts() }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTyping(false);
    }
  };

  const sendMsg = async () => {
    if (!input.trim() || typing) return;
    const text = input.trim();
    setInput('');
    setError('');
    const now = ts();
    setMsgs(prev => [...prev, { role: 'user', text, time: now }]);
    setTyping(true);

    const currentHistory = [...geminiHistory.current];
    try {
      const { reply } = await api.interviewChat(mode ?? 'coding', currentHistory, text);
      geminiHistory.current = [...currentHistory, { role: 'user', text }, { role: 'model', text: reply }];
      setMsgs(prev => [...prev, { role: 'ai', text: reply, time: ts() }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTyping(false);
    }
  };

  const newSession = () => {
    setMode(null);
    setMsgs([{ role: 'ai', text: WELCOME }]);
    geminiHistory.current = [];
    setError('');
    setSessionCount(c => c + 1);
  };

  const exportTranscript = () => {
    const text = msgs.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `interview-${mode ?? 'session'}-${Date.now()}.txt`;
    a.click();
  };

  const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="ai-interview-page">
      <div className="ai-layout">
        {/* Sidebar */}
        <div className="ai-sidebar">
          <div className="ai-side-header">
            <span className="eyebrow">Gemini AI Coach</span>
            <h2>Mock Interview</h2>
          </div>

          <div className="interview-types">
            {([
              { key: 'coding',    label: 'Coding Round',    emoji: '💻', desc: 'DSA problems, complexity analysis' },
              { key: 'behavioral',label: 'HR / Behavioral',  emoji: '🎯', desc: 'STAR method, soft skills' },
              { key: 'system',    label: 'System Design',    emoji: '🏗️', desc: 'HLD, scalability, trade-offs' },
            ] as { key: Mode; label: string; emoji: string; desc: string }[]).map(t => (
              <button
                key={t.key}
                className={`interview-type-btn ${mode === t.key ? 'active' : ''}`}
                onClick={() => startMode(t.key)}
                disabled={typing}
              >
                <span className="it-emoji">{t.emoji}</span>
                <div>
                  <div className="it-label">{t.label}</div>
                  <div className="it-desc">{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="ai-stats">
            <div className="ai-stat"><span>Sessions</span><strong>{sessionCount}</strong></div>
            <div className="ai-stat"><span>Mode</span><strong style={{ color: 'var(--primary)', textTransform: 'capitalize' }}>{mode ?? '—'}</strong></div>
          </div>

          <div className="ai-actions">
            <button className="btn-outline-sm" onClick={newSession}><RefreshCw size={13} /> New Session</button>
            <button className="btn-outline-sm" onClick={exportTranscript} disabled={msgs.length < 2}><Download size={13} /> Export</button>
          </div>
        </div>

        {/* Chat */}
        <div className="ai-chat">
          <div className="chat-messages">
            {msgs.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className="msg-avatar">
                  {msg.role === 'ai' ? <Bot size={15} /> : <User size={15} />}
                </div>
                <div className="msg-bubble">
                  <div className="msg-text">{formatText(msg.text)}</div>
                  {msg.time && <div className="msg-time">{msg.time}</div>}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-msg ai">
                <div className="msg-avatar"><Bot size={15} /></div>
                <div className="msg-bubble">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-error">
                <AlertCircle size={14} />
                {error.includes('GEMINI_API_KEY') ? 'Add your GEMINI_API_KEY to packages/backend/.env to enable AI features.' : error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-wrap">
            <textarea
              className="chat-input"
              placeholder={mode ? 'Type your answer… (Enter to send, Shift+Enter for newline)' : 'Select an interview type to start →'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              rows={2}
              disabled={!mode || typing}
              aria-label="Chat input"
            />
            <button className="send-btn" onClick={sendMsg} disabled={!input.trim() || typing || !mode} aria-label="Send">
              {typing ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
