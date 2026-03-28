import React, { useEffect, useState } from 'react';
import { Search, X, Terminal } from 'lucide-react';
import { StampedLabel, BrutalNavbar, BrutalFooter } from '../components/SharedBrutal';
import PackageCard from '../components/PackageCard';
import { SkeletonGrid } from '../components/SkeletonCard';
import { getPackages, getSettings, type Package } from '../firebase/firestoreService';

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availableCategories, setAvailableCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const load = async () => {
      const [data, settings] = await Promise.all([getPackages(), getSettings()]);
      setPackages(data);
      if (settings.categories) setAvailableCategories(['All', ...settings.categories]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = packages.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || p.category === category;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void grain-texture">
      <BrutalNavbar />

      <section className="pt-48 pb-20 px-6 md:px-20 text-center flex flex-col items-center">
        <StampedLabel className="mb-6">EXPLORATION_ARCHIVE</StampedLabel>
        <h1 className="font-display text-7xl md:text-9xl leading-none text-paper mb-6 uppercase">ALL_EXPEDITIONS.</h1>
        <p className="text-xl font-display italic opacity-70 max-w-2xl">
          A catalog of high-frequency journeys. Filter by terrain or initiate a global search.
        </p>
      </section>

      {/* SEARCH CONSOLE */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 mb-20">
        <div className="thick-border bg-void p-6 md:p-10 flex flex-col gap-8">
          <div className="relative">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-yellow" />
            <input
              type="text"
              placeholder="SEARCH_COORDINATES..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-b-2 border-brand-yellow/30 focus:border-brand-yellow text-paper py-4 pl-10 font-mono text-xl outline-none transition-colors placeholder:opacity-20 uppercase"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <span className="font-mono text-[10px] text-brand-yellow font-black uppercase tracking-widest flex items-center gap-2">
              <Terminal size={14} /> FILTER_BY_TERRAIN:
            </span>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 font-mono text-[10px] font-black uppercase transition-all ${
                  category === cat ? 'bg-brand-yellow text-void' : 'border border-paper/20 text-paper/40 hover:border-brand-yellow'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-20 pb-32">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-4 border-brand-red p-10 bg-brand-red/5">
            <p className="text-4xl font-display text-paper mb-4 uppercase">NO_RESULTS_FOUND.</p>
            <p className="font-mono text-sm opacity-60 uppercase">SYSTEM_ALERT: COORDINATES DO NOT EXIST IN CURRENT DATABASE.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </main>

      <BrutalFooter />
    </div>
  );
};

export default PackagesPage;