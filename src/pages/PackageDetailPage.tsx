import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, Calendar, ChevronLeft, ArrowRight, Zap } from 'lucide-react';
import { StampedLabel, BrutalNavbar, BrutalFooter } from '../components/SharedBrutal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPackageById, type Package } from '../firebase/firestoreService';

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) getPackageById(id).then(data => { setPkg(data); setLoading(false); });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!pkg) return <div className="min-h-screen bg-void flex items-center justify-center text-paper">EXPEDITION_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void grain-texture">
      <BrutalNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-20 pt-48 pb-32">
        {/* HEADER BLOCK */}
        <div className="mb-20">
          <Link to="/packages" className="inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-widest text-brand-yellow mb-10 hover:translate-x-2.5 transition-transform">
            <ChevronLeft size={16} /> RETURN_TO_ARCHIVE
          </Link>
          <StampedLabel className="mb-6">EXPEDITION_LOG // 2026_SEASON</StampedLabel>
          <h1 className="text-7xl md:text-9xl font-display font-black leading-[0.85] uppercase mb-8">
            {pkg.title}
          </h1>
          <div className="flex flex-wrap gap-8 font-mono text-xs opacity-50 uppercase tracking-widest border-y-2 border-paper/10 py-6">
            <span className="flex items-center gap-2"><Clock size={14} className="text-brand-yellow" /> {pkg.duration}</span>
            <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-yellow" /> {pkg.category}</span>
            <span className="flex items-center gap-2"><Users size={14} className="text-brand-yellow" /> MIN_2_NOMADS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-20">
            {/* HERO IMAGE */}
            <div className="thick-border bg-void aspect-video overflow-hidden group">
              <img src={pkg.images?.[0]} alt={pkg.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
            </div>

            {/* DESCRIPTION */}
            <section className="bg-paper text-void p-10 md:p-16 border-l-16px border-brand-red">
              <h2 className="stamped-text border-void/20 mb-8">MANIFESTO_EXCERPT</h2>
              <p className="text-2xl md:text-4xl font-display italic font-bold leading-tight">"{pkg.description}"</p>
            </section>

            {/* ITINERARY AS LOGBOOK */}
            <section>
              <h2 className="stamped-text text-brand-yellow mb-12">DAILY_TRANSMISSIONS</h2>
              <div className="space-y-6">
                {pkg.itinerary?.map((day, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-8 brutal-border bg-void p-8 group hover:bg-brand-yellow hover:text-void transition-colors cursor-default">
                    <div className="md:w-32 shrink-0">
                      <span className="text-5xl font-display font-black">0{i + 1}</span>
                      <div className="h-1 w-12 bg-brand-red mt-2 group-hover:bg-void"></div>
                    </div>
                    <p className="text-xl font-display font-bold leading-relaxed">{day}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR DEPLOYMENT BOX */}
          <div className="lg:col-span-4">
            <div className="sticky top-40 thick-border bg-void p-8 space-y-10 shadow-[20px_20px_0px_0px_rgba(194,58,43,1)]">
              <div>
                <span className="stamped-text text-brand-yellow mb-4">REQUIRED_CREDITS</span>
                <p className="text-6xl font-display font-black text-paper">₹{pkg.price.toLocaleString('en-IN')}</p>
                <span className="text-[10px] font-mono opacity-40 uppercase">EXCL. TAXES // PER_NOMAD</span>
              </div>

              <div className="space-y-4 border-t-2 border-paper/10 pt-8">
                <StampedLabel className="text-brand-red border-brand-red/30">NEXT_DEPARTURES</StampedLabel>
                {pkg.availableDates?.map((d, i) => (
                  <div key={i} className="bg-paper/5 p-4 font-mono text-[10px] flex justify-between border border-paper/10">
                    <span>{d.startDate}</span>
                    <span className="text-brand-yellow">➔</span>
                    <span>{d.endDate}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => navigate(`/book/${pkg.id}`)}
                className="w-full py-6 bg-brand-yellow text-void font-mono font-black text-lg tracking-widest hover:bg-brand-red hover:text-paper transition-all flex items-center justify-center gap-4"
              >
                BOOK_EXPEDITION <ArrowRight size={20} />
              </button>
              
              <div className="p-4 border border-brand-red/30 bg-brand-red/5 flex items-start gap-3">
                <Zap size={16} className="text-brand-red shrink-0" />
                <p className="text-[10px] font-mono opacity-60 uppercase">System Alert: Limited slots remain for the current transmission window.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BrutalFooter />
    </div>
  );
};

export default PackageDetailPage;