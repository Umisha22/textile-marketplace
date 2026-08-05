import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from './ChatWindow.jsx';
import { useAiChat } from '../hooks/useAiChat.js';

export default function AiWidget() {
  const [open, setOpen] = useState(false);
  const { messages, setMessages, loading, suggestions, send } = useAiChat({ mode: 'assistant' });
  const seededRef = useState(false);

  const openPanel = () => {
    setOpen(true);
    if (!seededRef[0] && messages.length === 0) {
      seededRef[1](true);
      send('Hello');
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-void-950/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <div
        className={`fixed bottom-5 right-4 z-50 flex flex-col overflow-hidden glass-strong rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all sm:right-6 ${
          open ? 'h-[70vh] w-[calc(100vw-2rem)] max-w-md' : 'h-0 w-0 border-0'
        }`}
      >
        {open && (
          <>
            <div className="flex items-center justify-between border-b border-void-600/50 bg-void-800/80 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/20 text-sm">🧶</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Weaver AI</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Online · fabric assistant
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  to="/assistant"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-void-600/50"
                >
                  Expand
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1.5 text-text-secondary hover:text-text-primary hover:bg-void-600/50"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <ChatWindow
              messages={messages}
              loading={loading}
              suggestions={suggestions}
              onSend={(t) => send(t)}
              placeholder="Ask about fabrics, prices, MOQ…"
            />
          </>
        )}
      </div>

      {!open && (
        <button
          type="button"
          onClick={openPanel}
          className="fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full neo-raised-gold shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(212,168,83,0.4)] sm:right-6"
          title="Chat with Weaver AI"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-8 8H4l2-3.5A8 8 0 1 1 21 12z" />
            <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.4" />
          </svg>
        </button>
      )}
    </>
  );
}
