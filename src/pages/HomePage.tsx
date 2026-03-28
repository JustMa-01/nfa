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
import { getPackages, type Package } from "../firebase/firestoreService";
import { BRAND_NAME, BRAND_TAGLINE } from "../constants";
import { getTransformationPath, TransformationPath } from "../services/geminiService";
import { DataLabel, Logo, BrutalNavbar, BrutalFooter } from "../components/SharedBrutal";
import PackageCard from "../components/PackageCard";
import { SkeletonGrid } from "../components/SkeletonCard";

const Marquee = () => (
  <div className="marquee-container">
    <div className="marquee-content">
      {Array(10).fill(`${BRAND_NAME} // ${BRAND_TAGLINE} // `).join("")}
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [vibeInput, setVibeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TransformationPath | null>(null);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await getPackages();
        setPackages(data);
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleScan = async () => {
    if (!vibeInput.trim() || packages.length === 0) return;
    setIsScanning(true);
    try {
      const result = await getTransformationPath(vibeInput, packages);
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
            <DataLabel className="text-brand-yellow mb-6">Curated Travel</DataLabel>
            <h1 className="text-7xl md:text-[12rem] leading-[0.85] mb-10">
              NO<br />FIXED<br /><span className="text-brand-yellow">ADDRESS.</span>
            </h1>
            <p className="text-xl md:text-2xl font-mono max-w-xl opacity-70 leading-relaxed mb-12">
              We curate extraordinary destinations for the curious soul. From misty mountain trails to sun-drenched beaches — your journey begins here.
            </p>
            <div className="flex flex-wrap gap-6">
              <button onClick={() => document.getElementById('grid')?.scrollIntoView({ behavior: 'smooth' })} className="btn-brutal">
                Explore Destinations
              </button>
              <Link to="/packages" className="btn-brutal-red">
                Find Your Journey
              </Link>
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
              <h3 className="text-3xl mb-2">System Status</h3>
              <p className="font-mono text-sm opacity-60">All Routes Open // Ready for departure</p>
            </div>
          </div>
        </section>

        <Marquee />

        {/* Grid Section */}
        <section id="grid" className="py-32 px-6 md:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-10">
            <div className="max-w-2xl">
              <DataLabel className="text-brand-yellow">Featured Packages</DataLabel>
              <h2 className="text-6xl md:text-9xl leading-none">DESTINATIONS.</h2>
            </div>
            <div className="max-w-xs text-right hidden md:block">
              <p className="font-mono text-sm opacity-50">Select your next adventure. Unforgettable experiences guaranteed.</p>
            </div>
          </div>

          {loadingPackages ? (
            <SkeletonGrid count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {packages.slice(0, 4).map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </section>

        {/* Oracle Section */}
        <section className="py-32 px-6 md:px-20 bg-paper text-void">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <DataLabel className="text-brand-red">Travel Assistant</DataLabel>
              <h2 className="text-6xl md:text-8xl leading-none mb-10">Find Your<br />Escape.</h2>
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
                  Find Destinations
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
                      <DataLabel className="text-brand-yellow">Destination Match</DataLabel>
                      <h3 className="text-4xl">{packages.find(p => p.id === scanResult.packageId)?.title}</h3>
                    </div>
                    <div className="text-right">
                      <DataLabel>Intensity Match</DataLabel>
                      <span className="text-2xl font-display text-brand-red">{scanResult.intensity}</span>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <DataLabel>Recommendation Reasoning</DataLabel>
                      <p className="font-mono text-lg leading-relaxed opacity-80">{scanResult.reasoning}</p>
                    </div>
                    <div className="bg-paper/5 p-6 brutal-border">
                      <DataLabel>Log Entry</DataLabel>
                      <p className="font-mono text-sm leading-relaxed opacity-60 italic">"{scanResult.pulseLog}"</p>
                    </div>
                    <Link to={`/packages/${scanResult.packageId}`} className="btn-brutal inline-block w-full text-center">
                      View Package
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <BrutalFooter />
      </main>

      {/* Layout Bottom */}
    </div>
  );
}

