import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Zap, 
  Activity, 
  Target, 
  Globe, 
  Menu, 
  X, 
  ArrowRight, 
  Loader2, 
  Radio, 
  Terminal,
  Share2,
  MapPin
} from "lucide-react";
import { cn } from "../utils";
import { DESTINATIONS, Destination, BRAND_NAME, BRAND_TAGLINE } from "../constants";
import { getTransformationPath, TransformationPath } from "../services/geminiService";
import { DataLabel, Logo, BrutalNavbar, BrutalFooter } from "../components/SharedBrutal";

// --- Components ---

const Modal = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-void/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 40 }}
        className="relative w-full max-w-5xl bg-void brutal-border brutal-shadow p-6 md:p-12 overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-paper hover:text-brand-yellow transition-colors">
          <X size={32} />
        </button>
        {title && (
          <div className="mb-10 border-b-2 border-paper/10 pb-6">
            <DataLabel className="text-brand-yellow">TRIP_PROFILE</DataLabel>
            <h2 className="text-4xl md:text-6xl font-display">{title}</h2>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};

const MissionForm = ({ onClose }: { onClose: () => void }) => {
  const [submitted, setSubmitted] = useState(false);
  
  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-brand-yellow text-void rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Target size={40} />
        </div>
        <h3 className="text-3xl font-display mb-4">BOOKING_INITIATED.</h3>
        <p className="text-lg font-mono opacity-60">Your request has been received. Stand by for travel coordinates and confirmation.</p>
        <button onClick={onClose} className="mt-10 btn-brutal">
          Return to Destinations
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <DataLabel>TRAVELER_NAME</DataLabel>
          <input required type="text" placeholder="FULL_NAME" className="bg-paper/5 brutal-border p-4 font-mono text-lg focus:border-brand-yellow outline-none" />
        </div>
        <div className="flex flex-col gap-2">
          <DataLabel>CONTACT_EMAIL</DataLabel>
          <input required type="email" placeholder="EMAIL_ADDRESS" className="bg-paper/5 brutal-border p-4 font-mono text-lg focus:border-brand-yellow outline-none" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <DataLabel>TRAVEL_REQUIREMENTS</DataLabel>
        <textarea required rows={4} placeholder="What are you looking for in this journey? Define your ideal trip..." className="bg-paper/5 brutal-border p-4 font-mono text-lg focus:border-brand-yellow outline-none resize-none" />
      </div>
      <button type="submit" className="btn-brutal w-full md:w-auto self-start">
        REQUEST_BOOKING
      </button>
    </form>
  );
};

const DestinationProfile = ({ dest, onInitiate }: { dest: Destination, onInitiate: () => void }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      <div className="lg:col-span-5">
        <div className="brutal-border brutal-shadow overflow-hidden aspect-square">
          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="bg-paper/5 p-4 brutal-border">
            <DataLabel>DURATION</DataLabel>
            <span className="text-xl font-display text-brand-red">{dest.duration}</span>
          </div>
          <div className="bg-paper/5 p-4 brutal-border">
            <DataLabel>CATEGORY</DataLabel>
            <span className="text-xl font-display text-brand-yellow">{dest.category}</span>
          </div>
        </div>
      </div>
      <div className="lg:col-span-7 flex flex-col gap-6">
        <DataLabel className="text-brand-yellow">DESTINATION_DETAILS</DataLabel>
        <h3 className="text-5xl font-display leading-none">{dest.name}</h3>
        <p className="text-xl font-mono leading-relaxed opacity-80">
          {dest.description} This journey is curated for travelers seeking unforgettable experiences in {dest.location}. No fixed address, no fixed rules.
        </p>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-4 text-brand-yellow">
            <Radio size={20} />
            <span className="font-mono text-sm uppercase tracking-widest">AVAILABILITY_CONFIRMED</span>
          </div>
          <div className="flex items-center gap-4 text-brand-red">
            <Target size={20} />
            <span className="font-mono text-sm uppercase tracking-widest">CURATED_ITINERARY</span>
          </div>
        </div>
        <button onClick={onInitiate} className="mt-6 btn-brutal-red w-full">
          RESERVE_JOURNEY // {dest.price}
        </button>
      </div>
    </div>
  );
};

const Marquee = () => (
  <div className="marquee-container">
    <div className="marquee-content">
      {Array(10).fill(`${BRAND_NAME} // ${BRAND_TAGLINE} // `).join("")}
    </div>
  </div>
);

const DestinationCard = ({ dest, index, onClick }: { dest: Destination; index: number, onClick: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="kinetic-card group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/5] overflow-hidden relative">
        <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-void/40 group-hover:bg-void/10 transition-colors" />
        <div className="absolute top-4 left-4 bg-brand-red text-paper px-3 py-1 font-mono text-[10px] uppercase">
          {dest.duration}
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <DataLabel className="text-brand-yellow mb-1">{dest.location}</DataLabel>
          <h3 className="text-4xl font-display leading-none text-paper">{dest.name}</h3>
        </div>
      </div>
      <div className="p-6 bg-void flex justify-between items-center">
        <span className="font-mono text-sm opacity-50">{dest.category}</span>
        <ArrowRight className="text-brand-yellow group-hover:translate-x-2 transition-transform" />
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [vibeInput, setVibeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TransformationPath | null>(null);

  const handleScan = async () => {
    if (!vibeInput.trim()) return;
    setIsScanning(true);
    try {
      const result = await getTransformationPath(vibeInput);
      setScanResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void">
      <BrutalNavbar />

      <main>
        {/* Hero Section */}
        <section className="split-pane">
          <div className="flex flex-col justify-center p-6 md:p-20 pt-40 lg:pt-20">
            <DataLabel className="text-brand-yellow mb-6">CURATED_TRAVEL_v1</DataLabel>
            <h1 className="text-7xl md:text-[12rem] leading-[0.85] mb-10">
              NO<br />FIXED<br /><span className="text-brand-yellow">ADDRESS.</span>
            </h1>
            <p className="text-xl md:text-2xl font-mono max-w-xl opacity-70 leading-relaxed mb-12">
              We curate extraordinary destinations for the curious soul. From misty mountain trails to sun-drenched beaches — your journey begins here.
            </p>
            <div className="flex flex-wrap gap-6">
              <button onClick={() => document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })} className="btn-brutal">
                EXPLORE_DESTINATIONS
              </button>
              <button onClick={() => setIsJoinOpen(true)} className="btn-brutal-red">
                START_YOUR_JOURNEY
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1200" 
              alt="Cyberpunk City" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-red/20 mix-blend-overlay" />
            <div className="absolute bottom-20 left-20 bg-void p-10 brutal-border brutal-shadow">
              <Terminal className="text-brand-yellow mb-4" size={40} />
              <h3 className="text-3xl mb-2">BOOKING_STATUS</h3>
              <p className="font-mono text-sm opacity-60">ALL_ROUTES_OPEN // TRAVEL_ACTIVE</p>
            </div>
          </div>
        </section>

        <Marquee />

        {/* Grid Section */}
        <section id="grid" className="py-32 px-6 md:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <DataLabel className="text-brand-yellow">FEATURED_PACKAGES</DataLabel>
              <h2 className="text-6xl md:text-9xl leading-none">DESTINATIONS.</h2>
            </div>
            <div className="max-w-xs text-right hidden md:block">
              <p className="font-mono text-sm opacity-50">Select your next adventure. Unforgettable experiences guaranteed.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DESTINATIONS.map((dest, i) => (
              <div key={dest.id}>
                <DestinationCard dest={dest} index={i} onClick={() => setSelectedDest(dest)} />
              </div>
            ))}
          </div>
        </section>

        {/* Oracle Section */}
        <section className="py-32 px-6 md:px-20 bg-paper text-void">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <DataLabel className="text-brand-red">TRAVEL_ORACLE_v2</DataLabel>
              <h2 className="text-6xl md:text-8xl leading-none mb-10">FIND_YOUR<br />ESCAPE.</h2>
              <p className="text-xl font-mono opacity-70 mb-12">
                Input your travel preferences. Our oracle will calculate your optimal getaway.
              </p>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-red" size={24} />
                  <input 
                    type="text" 
                    value={vibeInput}
                    onChange={(e) => setVibeInput(e.target.value)}
                    placeholder="I SEEK A RELAXING BEACH ESCAPE..."
                    className="w-full bg-void text-paper p-6 pl-16 font-mono text-lg brutal-border focus:border-brand-red outline-none"
                  />
                </div>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="btn-brutal-red w-full flex items-center justify-center gap-4"
                >
                  {isScanning ? <Loader2 className="animate-spin" /> : <Zap size={24} />}
                  CALCULATE_ITINERARY
                </button>
              </div>
            </div>

            <AnimatePresence>
              {scanResult && (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-void text-paper p-10 brutal-border brutal-shadow"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <DataLabel className="text-brand-yellow">DESTINATION_MATCH</DataLabel>
                      <h3 className="text-4xl">{DESTINATIONS.find(d => d.id === scanResult.destinationId)?.name}</h3>
                    </div>
                    <div className="text-right">
                      <DataLabel>INTENSITY</DataLabel>
                      <span className="text-2xl font-display text-brand-red">{scanResult.adrenalineFrequency}</span>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <DataLabel>REASONING</DataLabel>
                      <p className="font-mono text-lg leading-relaxed opacity-80">{scanResult.reasoning}</p>
                    </div>
                    <div className="bg-paper/5 p-6 brutal-border">
                      <DataLabel>TRAVEL_LOG</DataLabel>
                      <p className="font-mono text-sm leading-relaxed opacity-60 italic">"{scanResult.pulseLog}"</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <BrutalFooter />
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedDest && (
          <Modal 
            isOpen={!!selectedDest} 
            onClose={() => setSelectedDest(null)}
            title={selectedDest.name}
          >
            <DestinationProfile 
              dest={selectedDest} 
              onInitiate={() => {
                setSelectedDest(null);
                setIsJoinOpen(true);
              }}
            />
          </Modal>
        )}

        {isJoinOpen && (
          <Modal 
            isOpen={isJoinOpen} 
            onClose={() => setIsJoinOpen(false)}
            title="INITIATE_ADMISSION"
          >
            <MissionForm onClose={() => setIsJoinOpen(false)} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

