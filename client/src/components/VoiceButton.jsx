import { useEffect, useRef, useState } from 'react';

export default function VoiceButton({ onResult, disabled = false, className = '' }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const transcript = e.results?.[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => rec.abort?.();
  }, [onResult]);

  if (!supported) return null;

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch {
      /* already started */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      title={listening ? 'Stop listening' : 'Speak your request'}
      className={`inline-flex items-center justify-center rounded-full transition ${
        listening
          ? 'animate-pulse bg-coral-500/20 text-coral-400 border border-coral-500/30'
          : 'bg-void-700/50 text-text-secondary border border-void-600/50 hover:border-gold-500/30 hover:text-gold-400'
      } ${className}`}
    >
      {listening ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="4" height="12" rx="1" />
          <rect x="14" y="6" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10v1a7 7 0 0 0 14 0v-1M12 18v4" />
        </svg>
      )}
    </button>
  );
}
