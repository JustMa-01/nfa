// ─── Booking Success Page ─────────────────────────────────────────────────────
// Confirmation screen shown after booking (paid or pending)

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { BrutalNavbar, DataLabel } from '../components/SharedBrutal';

interface LocationState {
  bookingId: string;
  packageTitle: string;
}

const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void flex flex-col">
      <BrutalNavbar />
      <div className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center max-w-2xl w-full brutal-border brutal-shadow bg-paper/5 p-10 md:p-16">
          {/* Animated success icon */}
          <div className="w-32 h-32 brutal-border bg-brand-yellow text-void flex items-center justify-center mx-auto mb-10 transform -rotate-6">
            <CheckCircle className="w-16 h-16" />
          </div>

          <h1 className="text-6xl md:text-8xl font-display leading-none mb-6 text-brand-yellow">
            TRANSMISSION<br/>RECEIVED.
          </h1>
          <p className="font-mono text-xl opacity-70 mb-4 uppercase tracking-widest text-paper">
            {state?.packageTitle
              ? `RESERVATION // ${state.packageTitle} // SECURED`
              : 'MISSION SECURED.'}
          </p>
          <p className="font-mono text-xs opacity-50 mb-10 uppercase text-brand-yellow">
            AWAIT_FURTHER_INSTRUCTIONS // COM_LINK_ESTABLISHED
          </p>

          {state?.bookingId && (
            <div className="bg-void brutal-border p-6 mb-12 inline-block mx-auto text-left w-full max-w-sm">
              <DataLabel className="text-brand-yellow mb-2 tracking-widest uppercase text-[10px]">TRANSACTION_ID</DataLabel>
              <p className="font-mono text-xl tracking-widest text-paper break-all">{state.bookingId}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/packages"
              className="btn-brutal text-center flex-1"
            >
              CONTINUE_EXPLORING
            </Link>
            <Link
              to="/"
              className="brutal-border hover:bg-paper/10 text-paper px-8 py-4 font-mono text-sm uppercase tracking-widest transition-colors text-center inline-flex items-center justify-center gap-2 flex-1"
            >
              <Home className="w-5 h-5" />
              RETURN_TO_BASE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessPage;
