import { Link } from 'react-router-dom';
import GlassPanel from '../components/design-system/GlassPanel.jsx';

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Features</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-text-primary">
          Everything you need to source smarter
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-text-secondary">
          AI-powered search, real inventory data, side-by-side comparisons, and a streamlined ordering workflow — built for apparel sourcing.
        </p>
      </div>

      {/* AI promo */}
      <section className="mt-16">
        <GlassPanel className="relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-400">AI Marketplace Assistant</p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-text-primary sm:text-4xl">
                "Show me breathable linen under $6 for summer dresses."
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-text-secondary">
                Weaver understands plain language, recommends fabrics from real inventory, compares options side-by-side,
                and answers product questions — even by voice.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/assistant" className="neo-raised-gold rounded-xl px-5 py-3 text-sm font-bold transition">
                  Try the assistant
                </Link>
                <Link to="/products" className="neo-raised rounded-xl px-5 py-3 text-sm font-semibold text-text-secondary transition hover:text-text-primary">
                  Browse manually
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { q: 'What is the MOQ for the Banarasi silk?', a: 'MOQ is 100 meters for Banarasi Silk Jacquard.' },
                { q: 'Compare silk chiffon vs satin', a: 'Here is a side-by-side comparison…' },
                { q: 'Recommend fabrics for bridal wear', a: 'Banarasi Silk Jacquard, Embroidered Net, Chantilly Lace…' },
              ].map((ex) => (
                <div key={ex.q} className="glass rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gold-400">You: {ex.q}</p>
                  <p className="mt-1.5 text-sm text-text-secondary">Weaver: {ex.a}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </section>

      {/* How it works */}
      <section className="mt-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500">Simple workflow</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-text-primary">How the marketplace works</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { n: '01', t: 'Discover', d: 'Search or ask Weaver AI to find fabrics that match your spec, budget and use case.' },
            { n: '02', t: 'Order', d: 'Add to cart, review your order, and place it directly with the supplying mill.' },
            { n: '03', t: 'Track', d: 'Follow order status from pending → accepted → preparing → ready for dispatch → completed.' },
          ].map((s) => (
            <div key={s.n} className="neo-raised rounded-2xl p-6">
              <p className="font-display text-4xl font-bold text-gold-500/30">{s.n}</p>
              <h3 className="mt-3 font-display text-xl font-semibold text-text-primary">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-16 text-center">
        <Link to="/products" className="neo-raised-gold inline-block rounded-xl px-8 py-4 text-sm font-bold transition">
          Start browsing fabrics
        </Link>
      </div>
    </div>
  );
}
