// ─── Packages Listing Page ────────────────────────────────────────────────────
// Full paginated, searchable grid of all travel packages

import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X, Terminal } from 'lucide-react';
import { BrutalNavbar, BrutalFooter, DataLabel } from '../components/SharedBrutal';
import PackageCard from '../components/PackageCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { getPackages, getSettings, type Package } from '../firebase/firestoreService';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, settings] = await Promise.all([getPackages(), getSettings()]);
        setPackages(data);
        if (settings.categories) {
          setAvailableCategories(['All', ...settings.categories]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter + sort
  const filtered = packages
    .filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || p.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'price_desc') return b.price - a.price;
      return 0; // newest comes from Firestore order
    });

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void">
      <BrutalNavbar />

      {/* ── Page Header ──────────────────────────────── */}
      <section className="pt-40 pb-20 px-6 md:px-20 text-center flex flex-col items-center">
        <DataLabel className="text-brand-yellow mb-6">Explore</DataLabel>
        <h1 className="font-display text-6xl md:text-8xl leading-none text-paper mb-6">ALL PACKAGES.</h1>
        <p className="text-xl font-mono leading-relaxed opacity-70 max-w-2xl">
          Discover our full collection of hand-crafted itineraries — from quick weekend getaways to month-long adventures.
        </p>
      </section>

      {/* ── Search + Filter bar ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mb-12">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
            <input
              type="text"
              placeholder="SEARCH_DESTINATIONS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-void text-paper p-4 pl-12 font-mono text-lg brutal-border focus:border-brand-yellow outline-none placeholder:opacity-50"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-yellow hover:text-brand-red"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-void text-paper brutal-border p-4 font-mono text-lg focus:border-brand-yellow outline-none appearance-none cursor-pointer pr-10"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label.toUpperCase()}</option>
            ))}
          </select>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 btn-brutal bg-transparent py-4 text-sm sm:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            FILTERS
          </button>
        </div>

        {/* Category pills */}
        <div className={`flex flex-wrap gap-4 mt-6 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-6 py-2 font-mono text-sm uppercase transition-all duration-200 ${
                category === cat
                  ? 'bg-brand-yellow text-void brutal-border'
                  : 'bg-void text-paper brutal-border opacity-50 hover:opacity-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Package Grid ─────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 md:px-20 pb-32">
        {loading ? (
          <SkeletonGrid count={9} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 brutal-border p-10 bg-paper/5">
            <Terminal size={64} className="text-brand-red mx-auto mb-6" />
            <p className="text-4xl font-display text-paper mb-4">NO_MATCHING_COORDINATES</p>
            <p className="font-mono text-lg opacity-60">Adjust your filter arrays to find active missions.</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-sm opacity-50 mb-8 uppercase tracking-widest">
              SHOWING_RESULTS // <span className="text-brand-yellow">{filtered.length}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filtered.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </>
        )}
      </main>

      <BrutalFooter />
    </div>
  );
};

export default PackagesPage;
