import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import ProductCard from '../components/ProductCard.jsx';
import PhotoSearch from '../components/PhotoSearch.jsx';
import { Spinner } from '../components/ui.jsx';
import { useAiChat } from '../hooks/useAiChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import { CATEGORY_LABELS } from '../utils/constants.js';

const EXAMPLE_PROMPTS = [
  'Lightweight cotton under $5',
  'Silk for a summer dress collection',
  'Compare denim options',
  'What is the MOQ for the Banarasi silk?',
];

export default function AssistantPage() {
  const { user } = useAuth();
  const { messages, loading, suggestions, send } = useAiChat({ mode: 'assistant' });
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setRecLoading(true);
    api
      .get('/recommendations')
      .then((d) => setRecommended(d.recommendedProducts || d.suggestedProducts || []))
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-3.5 py-1.5 text-xs font-semibold text-gold-400 border border-gold-500/20">
          Weaver AI Assistant
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-text-primary sm:text-4xl">
          Find fabrics by asking in plain English
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
          Search, compare, recommend and answer product questions. Grounded in live marketplace data — voice supported in Chrome/Edge.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => send(p)}
            disabled={loading}
            className="rounded-full border border-void-500/50 bg-void-700/50 px-3.5 py-2 text-xs font-medium text-text-secondary transition hover:border-gold-500/30 hover:text-gold-400"
          >
            {p}
          </button>
        ))}
        <PhotoSearch
          label="Upload a photo to match"
          className="rounded-full border border-gold-500/30 bg-gold-500/10 px-3.5 py-2 text-xs font-medium text-gold-400 transition hover:bg-gold-500/20"
          onColors={(hexes) => send(`Find fabrics matching these colors: ${hexes.join(', ')}`)}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-[65vh] overflow-hidden rounded-3xl border border-void-600/50 glass-strong">
          <ChatWindow
            messages={messages}
            loading={loading}
            suggestions={suggestions}
            onSend={send}
            inputDisabled={loading}
          />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-text-primary">
                <span>Picked for you</span>
              </h2>
              {!user ? (
                <p className="mt-3 text-sm text-text-secondary">
                  <Link to="/login" className="font-semibold text-gold-400 underline">Log in</Link> and complete onboarding for AI-curated recommendations.
                </p>
              ) : recLoading ? (
                <div className="flex justify-center py-8"><Spinner className="h-6 w-6 text-gold-400" /></div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommended.map((p) => (
                    <Link
                      key={p.id || p._id}
                      to={`/products/${p.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-void-600/50 p-2 transition hover:border-gold-500/30 hover:bg-void-700/50"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-void-700 text-lg text-text-secondary">
                        {p.name?.[0] || ''}
                      </span>
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-semibold text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-secondary">
                          ${p.price}/{p.unit} · {CATEGORY_LABELS[p.category] || p.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 glass-strong rounded-2xl p-5">
              <h2 className="font-display text-lg font-bold text-text-primary">What it understands</h2>
              <ul className="mt-3 space-y-2 text-sm text-text-secondary">
                <li>• Natural-language search</li>
                <li>• Fabric recommendations</li>
                <li>• Product comparison</li>
                <li>• Similar product suggestions</li>
                <li>• Product Q&A (MOQ, stock, specs)</li>
                <li>• Voice input & conversational onboarding</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      <p className="mt-6 text-center text-xs text-text-muted">
        Product data shown by Weaver is always grounded in the live database.
      </p>
    </div>
  );
}
