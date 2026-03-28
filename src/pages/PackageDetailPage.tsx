// ─── Package Detail Page ──────────────────────────────────────────────────────
// Shows full package info: image gallery, itinerary, pricing, and booking CTA

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, MapPin, Users, Calendar, ChevronLeft, ChevronRight, X, ArrowRight, Terminal
} from 'lucide-react';
import { BrutalNavbar, BrutalFooter, DataLabel } from '../components/SharedBrutal';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPackageById, type Package } from '../firebase/firestoreService';

const PackageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getPackageById(id);
        if (!data) setError('Package not found.');
        else setPkg(data);
      } catch {
        setError('Failed to load package.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const nextImg = useCallback(() => {
    if (pkg) setActiveImg((i) => (i + 1) % pkg.images.length);
  }, [pkg]);

  const prevImg = useCallback(() => {
    if (pkg) setActiveImg((i) => (i - 1 + pkg.images.length) % pkg.images.length);
  }, [pkg]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightbox) return;
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === 'ArrowLeft') prevImg();
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, nextImg, prevImg]);

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-void text-paper flex items-center justify-center flex-col p-6">
        <Terminal size={64} className="text-brand-red mb-6" />
        <p className="text-4xl font-display mb-8 uppercase text-center">{error || 'PACKAGE_NOT_FOUND'}</p>
        <Link to="/packages" className="btn-brutal">RETURN_TO_DATABASE</Link>
      </div>
    );
  }

  const images = pkg.images?.length ? pkg.images : [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void">
      <BrutalNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-20 pt-40 pb-32">
        {/* Back link */}
        <Link
          to="/packages"
          className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest opacity-60 hover:opacity-100 hover:text-brand-yellow transition-colors mb-12"
        >
          <ChevronLeft className="w-5 h-5" />
          RETURN_TO_PACKAGES
        </Link>

        {/* Header */}
        <div className="mb-12">
          <DataLabel className="text-brand-yellow mb-4">PACKAGE SPECIFICS // {pkg.id?.substring(0,6) || "SYS"}</DataLabel>
          <h1 className="text-6xl md:text-8xl font-display leading-[0.85] uppercase break-words">{pkg.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left column: Image gallery + Itinerary ── */}
          <div className="lg:col-span-8 flex flex-col gap-16">
            
            {/* Gallery Section */}
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div 
                className="relative bg-paper/5 brutal-border overflow-hidden aspect-video md:aspect-[21/9] cursor-pointer group"
                onClick={() => setLightbox(true)}
              >
                <img
                  src={images[activeImg]}
                  alt={pkg.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-void/20 group-hover:bg-transparent transition-colors" />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImg(); }}
                      aria-label="Previous Image"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-void text-paper brutal-border p-3 hover:bg-brand-yellow hover:text-void transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImg(); }}
                      aria-label="Next Image"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-void text-paper brutal-border p-3 hover:bg-brand-yellow hover:text-void transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-4 right-4 bg-void/90 text-paper font-mono text-xs px-3 py-1 brutal-border backdrop-blur-sm">
                  IMG_{activeImg + 1}/{images.length}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      aria-label={`View Image ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-32 aspect-video overflow-hidden transition-all ${
                        i === activeImg 
                          ? 'brutal-border border-brand-yellow' 
                          : 'brutal-border opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <section className="bg-paper/5 brutal-border p-8 md:p-12">
              <DataLabel className="text-brand-red mb-6">OVERVIEW</DataLabel>
              <p className="font-mono text-lg md:text-xl leading-relaxed opacity-90">{pkg.description}</p>
            </section>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <section className="bg-paper/5 brutal-border p-8 md:p-12">
                <DataLabel className="text-brand-yellow mb-6">TRIP HIGHLIGHTS</DataLabel>
                <ul className="space-y-4 font-mono text-lg opacity-90 list-none">
                  {pkg.highlights.map((h, i) => (
                    <li key={i} className="flex gap-4 items-start uppercase">
                      <span className="text-brand-red mt-1">»</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Inclusions & Exclusions */}
            {(pkg.included?.length > 0 || pkg.notIncluded?.length > 0) && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {pkg.included?.length > 0 && (
                  <div className="bg-void brutal-border p-8 border-t-4 border-t-brand-yellow">
                    <DataLabel className="text-brand-yellow mb-6">WHAT'S INCLUDED</DataLabel>
                    <ul className="space-y-3 font-mono text-sm opacity-80 list-none">
                      {pkg.included.map((inc, i) => (
                        <li key={i} className="flex gap-3 items-start uppercase">
                          <span className="text-brand-yellow mt-0.5">+</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pkg.notIncluded?.length > 0 && (
                  <div className="bg-void brutal-border p-8 border-t-4 border-t-brand-red">
                    <DataLabel className="text-brand-red mb-6">NOT INCLUDED</DataLabel>
                    <ul className="space-y-3 font-mono text-sm opacity-80 list-none">
                      {pkg.notIncluded.map((exc, i) => (
                        <li key={i} className="flex gap-3 items-start uppercase">
                          <span className="text-brand-red mt-0.5">-</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <section>
                <DataLabel className="mb-8">ITINERARY</DataLabel>
                <div className="grid grid-cols-1 gap-6">
                  {pkg.itinerary.map((day, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-6 brutal-border bg-void p-6 md:p-8">
                      <div className="md:w-32 flex-shrink-0">
                        <span className="font-display text-4xl text-brand-yellow">DAY_0{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-lg leading-relaxed opacity-80">{day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Optional Activities */}
            {pkg.optionalActivities?.length > 0 && (
              <section className="bg-paper/5 brutal-border p-8 md:p-12">
                <DataLabel className="text-paper/60 mb-6">OPTIONAL_EXTENSIONS</DataLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
                  {pkg.optionalActivities.map((act, i) => (
                    <div key={i} className="brutal-border bg-void px-4 py-3 flex gap-3 text-paper/80 uppercase">
                      <span className="text-brand-yellow">?</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right column: Price & Booking card ──── */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 brutal-border bg-void brutal-shadow">
              {/* Price header */}
              <div className="bg-brand-red p-8 border-b-4 border-paper">
                <DataLabel className="text-void">REQUIRED_CREDITS</DataLabel>
                <p className="text-void font-display text-5xl mt-4">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </p>
                <p className="text-void font-mono text-sm uppercase tracking-widest mt-2 opacity-80">/ TRAVELER</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Meta */}
                <div className="space-y-4">
                  {pkg.duration && (
                    <div className="flex items-center gap-4 text-paper font-mono uppercase text-sm">
                      <Clock className="w-5 h-5 text-brand-yellow" />
                      <span className="opacity-80">DURATION // {pkg.duration}</span>
                    </div>
                  )}
                  {pkg.category && (
                    <div className="flex items-center gap-4 text-paper font-mono uppercase text-sm">
                      <MapPin className="w-5 h-5 text-brand-yellow" />
                      <span className="opacity-80">CATEGORY // {pkg.category}</span>
                    </div>
                  )}
                  {pkg.locations && (pkg.locations.start || pkg.locations.end) && (
                    <div className="flex items-center gap-4 text-paper font-mono uppercase text-sm">
                      <MapPin className="w-5 h-5 text-brand-red" />
                      <span className="opacity-80">
                        LOCATIONS // {pkg.locations.start || '?'} {pkg.locations.end ? `TO ${pkg.locations.end}` : ''}
                      </span>
                    </div>
                  )}
                  {pkg.itinerary?.length > 0 && (
                    <div className="flex items-center gap-4 text-paper font-mono uppercase text-sm">
                      <Calendar className="w-5 h-5 text-brand-yellow" />
                      <span className="opacity-80">STAGES // {pkg.itinerary.length}</span>
                    </div>
                  )}
                  {pkg.availableDates && pkg.availableDates.length > 0 && (
                    <div className="flex items-start gap-4 text-paper font-mono uppercase text-sm">
                      <Calendar className="w-5 h-5 text-brand-yellow mt-0.5" />
                      <div className="flex flex-col gap-2 w-full">
                        <span className="opacity-80">DEPARTURES //</span>
                        <div className="flex flex-col gap-2 mt-1">
                          {pkg.availableDates.map((dateItem, idx) => (
                            <div key={idx} className="bg-paper/5 p-2 brutal-border text-xs flex justify-between">
                              <span>START: {dateItem.startDate}</span>
                              <span className="text-brand-yellow">›</span>
                              <span>END: {dateItem.endDate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-paper font-mono uppercase text-sm">
                    <Users className="w-5 h-5 text-brand-red" />
                    <span className="opacity-80">MINIMUM_UNIT // 2 PAX</span>
                  </div>
                </div>

                <div className="h-1 bg-paper/20 w-full" />

                {/* CTA */}
                <button
                  onClick={() => navigate(`/book/${id}`)}
                  className="w-full btn-brutal-red flex items-center justify-center gap-4 text-lg py-6"
                >
                  BOOK NOW
                  <ArrowRight className="w-6 h-6" />
                </button>

                <p className="font-mono text-[10px] text-center opacity-50 uppercase tracking-widest">
                  MAKE PAYMENT TO FINALIZE
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Lightbox Modal ────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-void/95 backdrop-blur flex items-center justify-center p-4 md:p-10"
          onClick={() => setLightbox(false)}
        >
          <button
            aria-label="Close Lightbox"
            className="absolute top-6 right-6 text-paper hover:text-brand-yellow transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={40} />
          </button>

          <div className="relative w-full max-w-6xl max-h-[85vh] bg-void brutal-border brutal-shadow" onClick={(e) => e.stopPropagation()}>
            <img src={images[activeImg]} alt="" loading="lazy" decoding="async" className="w-full h-full object-contain max-h-[85vh]" />
            
            {images.length > 1 && (
              <>
                <button
                  aria-label="Previous Image"
                  onClick={prevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-void text-paper brutal-border p-4 hover:bg-brand-yellow hover:text-void transition-colors"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  aria-label="Next Image"
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-void text-paper brutal-border p-4 hover:bg-brand-yellow hover:text-void transition-colors"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-void/90 text-paper font-mono text-sm px-6 py-2 brutal-border">
              FILE_{activeImg + 1}_OF_{images.length}
            </div>
          </div>
        </div>
      )}

      <BrutalFooter />
    </div>
  );
};

export default PackageDetailPage;
