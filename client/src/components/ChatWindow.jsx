import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import VoiceButton from './VoiceButton.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';
import { useCurrency } from '../hooks/useCurrency.js';

function ProductChips({ products }) {
  if (!products?.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {products.map((p) => (
        <Link
          key={p.id || p._id}
          to={`/products/${p.slug}`}
          className="flex items-center gap-3 rounded-xl border border-void-600/50 bg-void-700/50 p-2 transition hover:border-gold-500/30 hover:bg-void-700"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            <ProductImage product={p} className="!rounded-lg" />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.name}</p>
            <p className="text-xs text-text-secondary">
              {formatPrice(p.price)}/{p.unit} · {CATEGORY_LABELS[p.category] || p.category}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function CompareTable({ compare }) {
  if (!compare?.products?.length) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-void-600/50 bg-void-700/80">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-void-600/50 bg-void-700">
              <th className="p-2.5 font-semibold text-text-muted"></th>
              {compare.products.map((p) => (
                <th key={p.id} className="p-2.5">
                  <Link to={`/products/${p.slug}`} className="font-semibold text-text-primary hover:text-gold-400">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.label} className="border-b border-void-600/30">
                <td className="p-2.5 font-semibold text-text-muted">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="p-2.5 text-text-primary">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EstimateCard({ estimate }) {
  if (!estimate) return null;
  const meas = estimate.measurements || {};
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-void-600/50 bg-void-700/80">
      <div className="flex items-center justify-between gap-3 bg-void-800 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            Fabric estimate · {estimate.garmentName}
          </p>
          <p className="font-display text-2xl font-bold text-text-primary">
            {estimate.meters} m
            <span className="ml-2 text-xs font-medium text-text-secondary">
              (buy {estimate.suggestMeters} m to be safe)
            </span>
          </p>
        </div>
        <span className="rounded-lg bg-void-600/50 px-2.5 py-1 text-xs font-semibold text-text-secondary">
          {estimate.widthInch}&quot; wide
        </span>
      </div>
      <div className="space-y-3 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">How I calculated it</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-xs text-text-secondary">
            {estimate.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
        {(meas.height || meas.bust) && (
          <div className="flex flex-wrap gap-1.5">
            {meas.height ? <span className="rounded-full bg-void-600/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">Ht {meas.height} cm</span> : null}
            {meas.bust ? <span className="rounded-full bg-void-600/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">Bust {meas.bust} cm</span> : null}
            {meas.waist ? <span className="rounded-full bg-void-600/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">Waist {meas.waist} cm</span> : null}
            {meas.hip ? <span className="rounded-full bg-void-600/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">Hip {meas.hip} cm</span> : null}
            {meas.sleeve ? <span className="rounded-full bg-void-600/50 px-2 py-0.5 text-[11px] font-medium text-text-secondary">Sleeve {meas.sleeve} cm</span> : null}
          </div>
        )}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">Notes</p>
          <ul className="mt-1 space-y-0.5 pl-4 text-xs text-text-muted">
            {estimate.assumptions.map((a, i) => (
              <li key={i} className="list-disc">{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }) {
  const isUser = message.from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-gold-500/20 text-text-primary border border-gold-500/20'
            : 'rounded-bl-sm border border-void-600/50 bg-void-700/80 text-text-primary glass'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        {!isUser && <ProductChips products={message.products} />}
        {!isUser && message.compare && <CompareTable compare={message.compare} />}
        {!isUser && message.estimate && <EstimateCard estimate={message.estimate} />}
      </div>
    </div>
  );
}

export default function ChatWindow({
  messages,
  onSend,
  loading = false,
  suggestions = [],
  voice = true,
  placeholder = 'Ask Weaver to find fabrics…',
  inputDisabled = false,
}) {
  useCurrency();
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const submit = (text) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;
    onSend(t);
    setInput('');
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto bg-void-900 p-4"
      >
        {messages.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-void-600/50 glass-strong p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 text-xl text-gold-400">
              Weaver
            </div>
            <p className="font-display text-base font-semibold text-text-primary">
              Hi, I'm Weaver
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Your AI sourcing assistant. Ask me to find, compare or recommend fabrics in plain English — or use the mic to speak.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-void-600/50 glass px-4 py-3">
              <span className="typing-dot h-2 w-2 rounded-full bg-gold-400" />
              <span className="typing-dot h-2 w-2 rounded-full bg-gold-400" style={{ animationDelay: '0.15s' }} />
              <span className="typing-dot h-2 w-2 rounded-full bg-gold-400" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-void-500/50 bg-void-700/50 px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-gold-500/30 hover:text-gold-400"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-void-600/50 bg-void-800 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            disabled={inputDisabled}
            placeholder={placeholder}
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-void-600 bg-void-700/50 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-gold-500/30 focus:ring-1 focus:ring-gold-500/20 disabled:opacity-60"
          />
          {voice && <VoiceButton onResult={(t) => { setInput((i) => (i ? i + ' ' : '') + t); }} disabled={inputDisabled} className="h-11 w-11 shrink-0" />}
          <button
            type="button"
            onClick={() => submit()}
            disabled={!input.trim() || loading}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl neo-raised-gold px-4 text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(212,168,83,0.2)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          >
            Send
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5 22 12 3 3.5 3 10l13 2-13 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
