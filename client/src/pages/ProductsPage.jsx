import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import ProductCard from '../components/ProductCard.jsx';
import PhotoSearch from '../components/PhotoSearch.jsx';
import FabricIcon from '../components/FabricIcon.jsx';
import { EmptyState, Spinner } from '../components/ui.jsx';
import { CATEGORY_LABELS, FABRIC_TYPE_LABELS } from '../utils/constants.js';

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const fabricType = params.get('fabricType') || '';
  const colorHex = params.get('colorHex') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [facets, setFacets] = useState({ categories: [], fabricTypes: [] });
  const [compareList, setCompareList] = useState([]);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    api
      .get('/products/categories')
      .then((d) => setFacets({ categories: d.categories, fabricTypes: d.fabricTypes }))
      .catch(() => {});
  }, []);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      const q = new URLSearchParams({ page });
      if (search) q.set('search', search);
      if (category) q.set('category', category);
      if (fabricType) q.set('fabricType', fabricType);
      if (colorHex) q.set('colorHex', colorHex);
      if (maxPrice) q.set('maxPrice', maxPrice);
      if (sort) q.set('sort', sort);
      try {
        const d = await api.get(`/products?${q.toString()}`);
        setProducts(d.products);
        setPagination(d.pagination);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [search, category, fabricType, colorHex, maxPrice, sort]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  const categoryList = useMemo(
    () => (facets.categories.length ? facets.categories : Object.keys(CATEGORY_LABELS).map((n) => ({ name: n, count: 0 }))),
    [facets]
  );

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const id = product._id || product.id;
      if (prev.some((p) => (p._id || p.id) === id)) return prev.filter((p) => (p._id || p.id) !== id);
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-clay-500">Fabric Library</p>
        <h1 className="font-display text-3xl font-bold text-brand-900">
          {colorHex
            ? 'Matching color'
            : category
              ? CATEGORY_LABELS[category]
              : search
                ? `Results for “${search}”`
                : 'All fabrics'}
        </h1>
        {pagination.total > 0 && (
          <p className="text-sm text-brand-500">{pagination.total} products found</p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* Filters */}
        <aside className={`${mobileFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-20 space-y-6 rounded-2xl border border-brand-100 bg-white p-5 shadow-soft">
            <div>
              <h3 className="text-sm font-semibold text-brand-900">Search</h3>
              <input
                value={search}
                onChange={(e) => updateParam('search', e.target.value)}
                placeholder="e.g. organic cotton…"
                className="mt-2 w-full rounded-lg border border-brand-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-brand-900">Category</h3>
              <div className="mt-2 space-y-1">
                <button
                  type="button"
                  onClick={() => updateParam('category', '')}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${!category ? 'bg-brand-800 text-white' : 'text-brand-700 hover:bg-brand-50'}`}
                >
                  All categories
                </button>
                {categoryList.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => updateParam('category', c.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition ${category === c.name ? 'bg-brand-800 text-white' : 'text-brand-700 hover:bg-brand-50'}`}
                  >
                    <span>{CATEGORY_LABELS[c.name] || c.name}</span>
                    <span className={`text-xs ${category === c.name ? 'text-brand-200' : 'text-brand-400'}`}>{c.count || ''}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-brand-900">Fabric type</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateParam('fabricType', '')}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    !fabricType ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                  }`}
                >
                  Any
                </button>
                {facets.fabricTypes.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => updateParam('fabricType', f)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      fabricType === f ? 'border-brand-800 bg-brand-800 text-white' : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                    }`}
                  >
                    <FabricIcon type={f} className="h-4 w-4" />
                    {FABRIC_TYPE_LABELS[f] || f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-brand-900">Max price / {pagination.total ? 'unit' : 'meter'}</h3>
              <input
                type="number"
                min="0"
                step="0.5"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                placeholder="Any"
                className="mt-2 w-full rounded-lg border border-brand-200 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </div>

            {compareList.length > 0 && (
              <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
                <p className="text-xs font-semibold text-brand-800">{compareList.length} in compare</p>
                <a
                  href={`/compare?ids=${compareList.map((p) => p._id || p.id).join(',')}`}
                  className="mt-2 block rounded-lg bg-brand-800 px-3 py-2 text-center text-xs font-semibold text-white"
                >
                  Compare now ⚖
                </a>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileFilters(false)}
              className="w-full rounded-lg border border-brand-200 py-2 text-sm font-semibold text-brand-700 lg:hidden"
            >
              Apply & close
            </button>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilters(true)}
                className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 lg:hidden"
              >
                Filters
              </button>
              <PhotoSearch
                label="Search by photo"
                className="rounded-lg border border-brand-800 bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
                onColors={(hexes) => updateParam('colorHex', hexes.slice(0, 2).join(','))}
              />
              {colorHex && (
                <button
                  type="button"
                  onClick={() => updateParam('colorHex', '')}
                  className="flex items-center gap-1.5 rounded-full border border-clay-300 bg-clay-50 px-3 py-1.5 text-xs font-semibold text-clay-700"
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-white shadow"
                    style={{ background: `#${colorHex.split(',')[0].replace('#', '')}` }}
                  />
                  Color match
                  <span aria-hidden>×</span>
                </button>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="popular">Most popular</option>
              <option value="stock">High stock</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Spinner className="h-10 w-10 text-brand-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="py-10">
              <EmptyState
                title="No fabrics found"
                description="Try adjusting your filters or ask Weaver AI in natural language."
                action={
                  <a href="/assistant" className="rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white">
                    Ask Weaver AI
                  </a>
                }
              />
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onCompareToggle={toggleCompare}
                  compareActive={compareList.some((c) => (c._id || c.id) === (p._id || p.id))}
                />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).slice(0, 8).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => load(p)}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                    pagination.page === p ? 'bg-brand-800 text-white' : 'bg-white text-brand-700 ring-1 ring-brand-200 hover:ring-brand-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
