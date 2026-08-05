import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from './ChatWindow.jsx';
import GlassPanel from './design-system/GlassPanel.jsx';
import WaveformVisualizer from './design-system/WaveformVisualizer.jsx';
import { useAiChat } from '../hooks/useAiChat.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AiWidget() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const { messages, loading, suggestions, send } = useAiChat({ mode: 'assistant' });

  // Mini mode — floating button
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-void-950 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_40px_rgba(212,168,83,0.3)] animate-glow-pulse"
        title="Open Weaver AI"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.5 4.5-3 6l-1 4H9l-1-4c-1.5-1.5-3-3.5-3-6a7 7 0 0 1 7-7z" />
          <path d="M9 21h6" />
        </svg>
      </button>
    );
  }

  // Expanded holographic console
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void-950/80 backdrop-blur-md" onClick={() => setExpanded(false)} />

      {/* Console */}
      <div className="relative z-10 flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden animate-fade-scale"
        style={{
          background: 'rgba(18,18,26,0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(212,168,83,0.15)',
          borderRadius: '24px',
          boxShadow: '0 0 80px rgba(212,168,83,0.08), 0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-600/50 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Pulsing gold orb avatar */}
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full bg-gold-500/20 animate-breathe" />
              <div className="absolute inset-1 rounded-full bg-gold-500/30 animate-glow-pulse flex items-center justify-center">
                <span className="text-sm font-bold text-gold-400">W</span>
              </div>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-gold-500/20"
                  style={{
                    inset: `${-4 - i * 4}px`,
                    animation: `spin ${4 + i * 2}s linear infinite`,
                    animationDirection: i % 2 === 0 ? 'normal' : 'reverse',
                  }}
                />
              ))}
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-text-primary">Weaver AI</h3>
              <p className="text-[11px] text-text-muted">Your AI sourcing assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                voiceMode ? 'bg-coral-500/20 text-coral-400 border border-coral-500/30' : 'bg-void-700/50 text-text-muted border border-void-600/50 hover:border-gold-500/30'
              }`}
            >
              {voiceMode ? 'Voice ON' : 'Voice'}
            </button>
            <button onClick={() => setExpanded(false)} className="rounded-lg p-1.5 text-text-muted hover:text-text-primary transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Voice waveform background */}
        {voiceMode && (
          <div className="absolute inset-0 top-16 pointer-events-none opacity-20">
            <WaveformVisualizer active className="h-full w-full" />
          </div>
        )}

        {/* Chat area */}
        <div className="relative flex-1 overflow-hidden">
          <ChatWindow
            messages={messages}
            loading={loading}
            suggestions={suggestions}
            onSend={send}
            inputDisabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
