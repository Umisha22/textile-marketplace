import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import VoiceButton from './VoiceButton.jsx';
import { formatPrice } from '../utils/format.js';
import { CATEGORY_LABELS } from '../utils/constants.js';

function ProductChips({ products }) {
  if (!products?.length) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {products.map((p) => (
        <Link
          key={p.id || p._id}
          to={`/products/${p.slug}`}
          className="flex items-center gap-3 rounded-xl border border-brand-100 bg-white/80 p-2 transition hover:border-brand-300 hover:bg-white"
        >
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
            <ProductImage product={p} className="!rounded-lg" />
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-brand-900">{p.name}</p>
            <p className="text-xs text-brand-500">
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
    <div className="mt-3 overflow-hidden rounded-xl border border-brand-100 bg-white/90">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-brand-100 bg-brand-50">
              <th className="p-2.5 font-semibold text-brand-600"></th>
              {compare.products.map((p) => (
                <th key={p.id} className="p-2.5">
                  <Link to={`/products/${p.slug}`} className="font-semibold text-brand-900 hover:text-brand-600">
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compare.rows.map((row) => (
              <tr key={row.label} className="border-b border-brand-50">
                <td className="p-2.5 font-semibold text-brand-600">{row.label}</td>
                {row.values.map((v, i) => (
                  <td key={i} className="p-2.5 text-brand-900">{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
            ? 'rounded-br-sm bg-brand-800 text-white'
            : 'rounded-bl-sm border border-brand-100 bg-white text-brand-950 shadow-soft'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.text}</div>
        {!isUser && <ProductChips products={message.products} />}
        {!isUser && message.compare && <CompareTable compare={message.compare} />}
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
        className="flex-1 space-y-4 overflow-y-auto bg-cream-50 p-4"
      >
        {messages.length === 0 && (
          <div className="mx-auto max-w-md rounded-2xl border border-brand-100 bg-white p-5 text-center shadow-soft">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-800 text-xl text-white">
              🧶
            </div>
            <p className="font-display text-base font-semibold text-brand-900">
              Hi, I'm Weaver
            </p>
            <p className="mt-1 text-sm text-brand-600">
              Your AI sourcing assistant. Ask me to find, compare or recommend fabrics in plain English — or use the mic to speak.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} message={m} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-brand-100 bg-white px-4 py-3 shadow-soft">
              <span className="typing-dot h-2 w-2 rounded-full bg-brand-400" />
              <span className="typing-dot h-2 w-2 rounded-full bg-brand-400" style={{ animationDelay: '0.15s' }} />
              <span className="typing-dot h-2 w-2 rounded-full bg-brand-400" style={{ animationDelay: '0.3s' }} />
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
                className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-brand-100 bg-white p-3">
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
            className="max-h-28 min-h-[44px] flex-1 resize-none rounded-xl border border-brand-200 bg-cream-50 px-4 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
          />
          {voice && <VoiceButton onResult={(t) => { setInput((i) => (i ? i + ' ' : '') + t); }} disabled={inputDisabled} className="h-11 w-11 shrink-0" />}
          <button
            type="button"
            onClick={() => submit()}
            disabled={!input.trim() || loading}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-brand-800 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
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
