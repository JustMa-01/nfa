// ─── Package Detail Page ──────────────────────────────────────────────────────
// Shows full package info: image gallery, itinerary, pricing, and booking CTA

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock, MapPin, Users, Calendar, ChevronLeft, ChevronRight, X, ArrowRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

  if (loading) return <LoadingSpinner />;

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-xl mb-4">{error || 'Package not found'}</p>
          <Link to="/packages" className="text-amber-400 hover:underline">Back to Packages</Link>
        </div>
      </div>
    );
  }

  const images = pkg.images?.length ? pkg.images : [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Back link */}
        <Link
          to="/packages"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-amber-400 text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Packages
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ── Left column: Image gallery + Itinerary ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden h-80 md:h-[420px] bg-slate-900 cursor-zoom-in"
              onClick={() => setLightbox(true)}>
              <img
                src={images[activeImg]}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 backdrop-blur flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 backdrop-blur flex items-center justify-center text-white hover:bg-amber-500 hover:text-slate-950 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur text-white/70 text-xs px-2.5 py-1 rounded-full">
                {activeImg + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-amber-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="text-white font-semibold text-xl mb-3">About This Trip</h2>
              <p className="text-white/60 leading-relaxed">{pkg.description}</p>
            </div>

            {/* Itinerary */}
            {pkg.itinerary?.length > 0 && (
              <div>
                <h2 className="text-white font-semibold text-xl mb-5">Day-by-Day Itinerary</h2>
                <div className="space-y-4">
                  {pkg.itinerary.map((day, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <span className="text-amber-400 font-bold text-sm">{i + 1}</span>
                      </div>
                      <div className="flex-1 bg-slate-900 rounded-xl p-4 border border-white/5">
                        <p className="text-white/70 text-sm">
                          <span className="text-amber-400 font-medium">Day {i + 1}: </span>
                          {day}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right column: Price & Booking card ──── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
              {/* Price header */}
              <div className="bg-amber-500 p-6">
                <p className="text-slate-950/70 text-sm font-medium">Package Price</p>
                <p className="text-slate-950 font-bold text-4xl mt-1">
                  ₹{pkg.price.toLocaleString('en-IN')}
                </p>
                <p className="text-slate-950/60 text-sm">per person</p>
              </div>

              <div className="p-6 space-y-4">
                <h1 className="font-serif text-2xl font-bold text-white leading-tight">{pkg.title}</h1>

                {/* Meta */}
                <div className="space-y-2">
                  {pkg.duration && (
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      {pkg.duration}
                    </div>
                  )}
                  {pkg.category && (
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      {pkg.category}
                    </div>
                  )}
                  {pkg.itinerary?.length > 0 && (
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      {pkg.itinerary.length} Day Itinerary
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Users className="w-4 h-4 text-amber-500" />
                    Min. 2 Travelers
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* CTA */}
                <button
                  onClick={() => navigate(`/book/${id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  Book Now
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-white/30 text-xs text-center">
                  No payment charged yet — review your booking first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lightbox Modal ────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img src={images[activeImg]} alt="" className="w-full max-h-[80vh] object-contain rounded-xl" />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-amber-500 hover:text-slate-950 transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="absolute bottom-4 text-white/40 text-sm">
            {activeImg + 1} / {images.length} — Press Esc to close
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PackageDetailPage;
