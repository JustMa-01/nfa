import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Quote, Loader2, Zap, Globe } from "lucide-react";
import { getPackages, type Package } from "../firebase/firestoreService";
import { getTransformationPath, TransformationPath } from "../services/geminiService";
import { StampedLabel, BrutalNavbar, BrutalFooter } from "../components/SharedBrutal";
import PackageCard from "../components/PackageCard";
import { SkeletonGrid } from "../components/SkeletonCard";

export default function HomePage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [vibeInput, setVibeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TransformationPath | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    getPackages().then(data => {
      setPackages(data);
      setLoadingPackages(false);
    });
  }, []);

  const handleScan = async () => {
    if (!vibeInput.trim() || packages.length === 0) return;
    setIsScanning(true);
    try {
      const result = await getTransformationPath(vibeInput, packages);
      setScanResult(result);
    } catch (error) { console.error(error); } 
    finally { setIsScanning(false); }
  };

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void grain-texture">
      <BrutalNavbar />

      <main>
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center items-center px-6 pt-32 pb-20 relative overflow-hidden">
          <div className="max-w-6xl w-full text-center z-10">
            <StampedLabel className="mb-8">ESTABLISHED IN THE UNKNOWN</StampedLabel>
            <h1 className="text-7xl md:text-[11rem] font-display font-black leading-[0.8] mb-12 tracking-tighter">
              THE WORLD IS<br />
              <span className="text-brand-yellow">NOT A MAP.</span>
            </h1>
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 mt-12">
              <div className="max-w-md text-left border-l-4 border-brand-red pl-8">
                <p className="text-xl font-display italic opacity-80 leading-tight">
                  "We are the ones who refused the cubicle. The ones who found home in the movement. No Fixed Address is a statement of intent."
                </p>
              </div>
              <button onClick={() => document.getElementById('expeditions')?.scrollIntoView({ behavior: 'smooth' })} className="px-12 py-6 bg-brand-red text-paper font-mono font-black text-sm tracking-widest hover:bg-brand-yellow hover:text-void transition-all shadow-[8px_8px_0px_0px_#F2B233]">
                INITIATE_BREAKOUT
              </button>
            </div>
          </div>
          <div className="absolute bottom-10 left-10 hidden lg:block font-mono text-[10px] opacity-40">
            COORDINATES // 00.0000° N, 00.0000° E
          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section className="py-32 px-6 bg-paper text-void">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="thick-border p-4 bg-void rotate-2 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" alt="Philosophy" className="w-full grayscale" />
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-red  items-center justify-center border-4 border-void -rotate-3 hidden md:flex">
                <Quote size={50} className="text-paper" />
              </div>
            </div>
            <div className="flex flex-col gap-8">
              <StampedLabel className="border-void/20 text-void/60">OUR PHILOSOPHY</StampedLabel>
              <h2 className="text-6xl md:text-8xl font-display font-black leading-none">
                MODERN<br />NOMADIC<br /><span className="text-brand-red">HERITAGE.</span>
              </h2>
              <p className="text-xl font-serif leading-relaxed opacity-80">
                We don't travel to escape life, but for life not to escape us. Our expeditions are built on the pillars of resilience, community, and the raw pursuit of the unmapped.
              </p>
              <div className="grid grid-cols-2 gap-8 mt-8 border-t-4 border-void pt-8">
                <div><h4 className="text-2xl font-black">RADICAL TRUTH</h4><p className="text-sm opacity-60">No filters. No staged moments.</p></div>
                <div><h4 className="text-2xl font-black">DEEP ROOTS</h4><p className="text-sm opacity-60">Connecting with the land.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* EXPEDITIONS SECTION */}
        <section id="expeditions" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div>
                <StampedLabel className="mb-4">ACTIVE EXPEDITIONS</StampedLabel>
                <h2 className="text-6xl md:text-9xl font-display font-black leading-none uppercase">
                  SELECT YOUR<br /><span className="text-brand-yellow">FRONTIER.</span>
                </h2>
              </div>
              <p className="text-xs font-mono opacity-40 uppercase max-w-200px text-right hidden md:block">
                Limited slots available for the 2026 season. Group-led by veteran nomads.
              </p>
            </div>

            {loadingPackages ? <SkeletonGrid count={4} /> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {packages.slice(0, 4).map((pkg) => <PackageCard key={pkg.id} pkg={pkg} />)}
              </div>
            )}
          </div>
        </section>

        {/* ORACLE V2 SECTION */}
        <section className="py-32 px-6 flex flex-col items-center">
          <div className="max-w-4xl w-full thick-border p-12 bg-paper text-void relative">
            <div className="absolute -top-6 -left-6 bg-brand-red text-paper px-4 py-2 font-mono font-black text-xs">ORACLE_V.2.0</div>
            <div className="text-center mb-12">
              <h2 className="text-5xl font-display font-black mb-4">FIND YOUR FREQUENCY.</h2>
              <p className="text-xs font-mono opacity-60 uppercase">Input your current state. We calculate the extraction point.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <input 
                type="text" value={vibeInput} onChange={(e) => setVibeInput(e.target.value)}
                placeholder="I AM SEEKING ABSOLUTE SILENCE..."
                className="flex-1 bg-void text-paper p-6 font-mono font-bold text-sm border-4 border-brand-yellow focus:outline-none placeholder:opacity-30"
              />
              <button onClick={handleScan} disabled={isScanning} className="px-10 bg-brand-red text-paper font-mono font-black text-sm hover:bg-brand-yellow hover:text-void transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {isScanning ? <Loader2 className="animate-spin" /> : <Zap size={20} />} CALCULATE
              </button>
            </div>
            {scanResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12 border-t-4 border-void pt-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <StampedLabel className="mb-4">MATCH DETECTED</StampedLabel>
                    <h3 className="text-4xl font-display font-black mb-4 uppercase">{packages.find(p => p.id === scanResult.packageId)?.title}</h3>
                    <p className="text-lg italic font-bold leading-tight">"{scanResult.reasoning}"</p>
                  </div>
                  <div className="bg-void text-paper p-8 border-4 border-brand-yellow font-mono text-xs uppercase opacity-70">
                    <div className="mb-4 text-brand-yellow font-black">PULSE_LOG: {scanResult.intensity}</div>
                    "{scanResult.pulseLog}"
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* FINAL CALL SECTION */}
        <section className="py-40 px-6 bg-brand-red text-paper text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Globe size={800} className="absolute -top-40 -left-40" />
          </div>
          <div className="max-w-5xl mx-auto relative z-10">
            <StampedLabel className="mb-8 border-paper/40">FINAL CALL</StampedLabel>
            <h2 className="text-7xl md:text-[10rem] font-display font-black leading-[0.8] mb-12 tracking-tighter">
              STOP<br />WAITING.<br /><span className="text-brand-yellow">START MOVING.</span>
            </h2>
            <Link to="/packages" className="inline-block px-16 py-8 bg-brand-yellow text-void font-mono font-black text-xl tracking-widest hover:bg-paper hover:text-brand-red transition-all shadow-[12px_12px_0px_0px_white]">
              APPLY_FOR_2026
            </Link>
          </div>
        </section>
      </main>

      <BrutalFooter />
    </div>
  );
}