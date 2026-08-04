import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import FabricIcon from '../components/FabricIcon.jsx';
import { Spinner } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS, FABRIC_TYPE_LABELS } from '../utils/constants.js';
import { formatPrice, formatNumber } from '../utils/format.js';
import { useCurrency } from '../hooks/useCurrency.js';

const QUICK_QUESTIONS = ['What is the MOQ?', 'Is it in stock?', 'What is the composition?', 'Delivery time?'];

export default function ProductDetailPage() {
  useCurrency();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(null);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiAsking, setAiAsking] = useState(false);

  const { add } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setAiAnswer('');
    api
      .get(`/products/${slug}`)
      .then((d) => {
        setProduct(d.product);
        setColor(d.product.colors?.[0] || null);
        return api
          .get(`/products?category=${d.product.category}&sort=popular&limit=8`)
          .then((list) => setSimilar(list.products.filter((p) => p.slug !== d.product.slug).slice(0, 4)));
      })
      .catch(() => {
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const askAi = useCallback(
    async (question) => {
      if (!product || aiAsking) return;
      setAiAsking(true);
      setAiAnswer('');
      try {
        const data = await api.post('/ai/chat', {
          message: `${question} ${product.name}`,
          mode: 'assistant',
        });
        setAiAnswer(data.reply);
      } catch (e) {
        setAiAnswer(`Sorry: ${e.message}`);
      } finally {
        setAiAsking(false);
      }
    },
    [product, aiAsking]
  );

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner className="h-10 w-10 text-brand-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-brand-900">Product not found</h1>
        <Link to="/products" className="mt-4 inline-block text-brand-700 underline">Back to library</Link>
      </div>
    );
  }

  const isOwn = user?.role === 'supplier' && String(product.supplier?._id) === String(user._id);
  const out = product.stock <= 0;

  const handleAdd = async () => {
    if (isOwn) {
      toast('This is your own product.', 'error');
      return;
    }
    try {
      await add(product, qty, color?.name);
      toast(`${product.name} added to cart`);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const specs = product.specifications || {};
  const specRows = [
    ['Composition', specs.composition],
    ['Width', specs.width],
    ['Weight (GSM)', specs.gsm],
    ['Weave', specs.weave],
    ['Finish', specs.finish],
  ].filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-brand-500">
        <Link to="/products" className="hover:text-brand-800">Fabric Library</Link>
        <span>/</span>
        <span>{CATEGORY_LABELS[product.category] || product.category}</span>
        <span>/</span>
        <span className="line-clamp-1 text-brand-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-4">
          <ProductImage product={product} color={color?.hex} className="aspect-[4/3] w-full" />
          {product.colors?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c)}
                  title={c.name}
                  className={`group flex h-16 flex-col items-center justify-center gap-1 rounded-lg border transition ${
                    color?.name === c.name
                      ? 'border-brand-600 ring-2 ring-brand-200'
                      : 'border-brand-200 hover:border-brand-400'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${c.hex || '#ccc'}, ${c.hex ? `${c.hex}88` : '#999'})` }}
                >
                  <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-brand-900">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">
              {CATEGORY_LABELS[product.category]}
            </span>
            {product.fabricType && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-100 px-3 py-1 text-xs font-semibold text-brand-700">
                <FabricIcon fabricType={product.fabricType} className="h-3.5 w-3.5" />
                {FABRIC_TYPE_LABELS[product.fabricType] || product.fabricType}
              </span>
            )}
            {product.featured && <span className="rounded-full bg-clay-100 px-3 py-1 text-xs font-semibold text-clay-700">Featured</span>}
            {product.stock > 0 && product.stock <= 300 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Low stock</span>
            )}
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-brand-950">{product.name}</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-600">{product.description}</p>

          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-bold text-brand-900">{formatPrice(product.price)}</span>
            <span className="mb-1 text-sm text-brand-500">per {product.unit}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-6 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
            <div>
              <p className="text-xs text-brand-400">In stock</p>
              <p className="text-sm font-semibold text-brand-900">
                {out ? '—' : `${formatNumber(product.stock)} ${product.unit}s`}
              </p>
            </div>
            <div>
              <p className="text-xs text-brand-400">MOQ</p>
              <p className="text-sm font-semibold text-brand-900">{product.moq || 100} {product.unit}s</p>
            </div>
            <div>
              <p className="text-xs text-brand-400">Unit</p>
              <p className="text-sm font-semibold text-brand-900">{product.unit}</p>
            </div>
            <div>
              <p className="text-xs text-brand-400">Supplier</p>
              <p className="text-sm font-semibold text-brand-900">
                {product.supplier?.supplierProfile?.businessName || product.supplier?.name}
              </p>
            </div>
          </div>

          {product.colors?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-brand-900">Available colors</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                      color?.name === c.name ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-200 bg-white text-brand-800 hover:border-brand-400'
                    }`}
                  >
                    {c.hex && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: c.hex }} />}
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-xl border border-brand-200 bg-white">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 text-brand-700 hover:bg-brand-50">−</button>
              <span className="w-12 text-center text-sm font-semibold">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(999, q + 1))} className="px-4 py-3 text-brand-700 hover:bg-brand-50">+</button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={out}
              className="flex-1 rounded-xl bg-clay-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-clay-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {out ? 'Out of stock' : isOwn ? 'Your own listing' : 'Add to cart'}
            </button>
            {!isOwn && (
              <button
                type="button"
                onClick={() => {
                  if (!user) return navigate('/login');
                  navigate(`/products?category=${product.category}`);
                }}
                className="rounded-xl border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-700 transition hover:border-brand-400"
              >
                Find similar
              </button>
            )}
          </div>

          {!out && (
            <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-brand-800">
                <span className="text-lg">🧶</span> Ask Weaver AI about this fabric
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => askAi(q)}
                    disabled={aiAsking}
                    className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-400"
                  >
                    {q}
                  </button>
                ))}
              </div>
              {aiAsking && (
                <div className="mt-3 flex items-center gap-2 text-sm text-brand-500">
                  <Spinner className="h-4 w-4 text-brand-600" /> Weaver is checking…
                </div>
              )}
              {aiAnswer && (
                <p className="mt-3 rounded-xl bg-white p-3 text-sm leading-relaxed text-brand-900 shadow-soft">
                  {aiAnswer}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Specs */}
      {specRows.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-brand-900">Specifications</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {specRows.map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
                <p className="text-xs text-brand-400">{k}</p>
                <p className="mt-1 text-sm font-semibold text-brand-900">{v}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sustainability */}
      {product.sustainability && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-brand-900">Sustainability</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cream-50 p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-6">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#d9e8dd" strokeWidth="3.5" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none" stroke="#2f8f5b" strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(product.sustainability.score / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute text-lg font-bold text-emerald-800">{product.sustainability.score}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-emerald-900">Eco score</span>
                  {(product.sustainability.badges || []).map((b) => (
                    <span key={b} className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                      🌿 {b}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-emerald-900/80">
                  {product.sustainability.note || 'This fabric carries a verified sustainability profile.'}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-emerald-800">
                  {product.sustainability.recycled && <span>♻️ Recycled content</span>}
                  {product.sustainability.organic && <span>🌱 Organic fibers</span>}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Similar */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold text-brand-900">You may also like</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
