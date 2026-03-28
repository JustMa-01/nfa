import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home, Globe } from 'lucide-react';
import { StampedLabel, BrutalNavbar } from '../components/SharedBrutal';

const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as { bookingId: string; packageTitle: string } | null;

  return (
    <div className="min-h-screen bg-brand-red text-paper selection:bg-brand-yellow selection:text-void grain-texture flex flex-col">
      <BrutalNavbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24 relative overflow-hidden">
        <Globe size={600} className="absolute -bottom-20 -right-20 opacity-10 pointer-events-none" />
        
        <div className="max-w-3xl w-full thick-border bg-void p-10 md:p-20 text-center relative z-10 shadow-[20px_20px_0px_0px_#F2B233]">
          <div className="w-24 h-24 bg-brand-yellow text-void flex items-center justify-center mx-auto mb-10 -rotate-6 border-4 border-paper">
            <CheckCircle size={48} />
          </div>

          <StampedLabel className="mb-6 border-brand-yellow/40 text-brand-yellow">SYSTEM_CONFIRMATION</StampedLabel>
          <h1 className="text-6xl md:text-9xl font-display font-black leading-[0.8] mb-8 uppercase">TRANSMISSION<br/>SUCCESS.</h1>
          
          <p className="font-mono text-sm md:text-xl opacity-70 mb-12 uppercase tracking-widest">
            {state?.packageTitle ? `RESERVATION // ${state.packageTitle} // SECURED` : 'EXPEDITION_LOCKED_IN'}
          </p>

          <div className="bg-paper/5 p-6 mb-12 inline-block mx-auto text-left w-full border border-paper/10">
            <span className="font-mono text-[10px] text-brand-yellow uppercase block mb-2">DEPLOYMENT_ID</span>
            <p className="font-mono text-lg tracking-tighter break-all">{state?.bookingId || 'ERR_ID_NOT_FOUND'}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/packages" className="px-10 py-5 bg-brand-yellow text-void font-mono font-black text-sm uppercase tracking-widest hover:bg-paper transition-all">
              CONTINUE_EXPLORING
            </Link>
            <Link to="/" className="px-10 py-5 border-2 border-paper/20 text-paper font-mono font-black text-sm uppercase tracking-widest hover:bg-paper/10 flex items-center justify-center gap-2">
              <Home size={18} /> RETURN_TO_BASE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;