import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils';

export const DataLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("font-mono text-[10px] uppercase tracking-widest opacity-50 block mb-2", className)}>
    {children}
  </span>
);

export const Logo = () => (
  <div className="flex flex-col leading-none select-none">
    <span className="text-4xl md:text-5xl font-display text-brand-yellow drop-shadow-[4px_4px_0px_rgba(194,58,43,1)]">NO FIXED</span>
    <span className="text-4xl md:text-5xl font-display text-brand-yellow drop-shadow-[4px_4px_0px_rgba(194,58,43,1)]">ADDRESS</span>
  </div>
);

export const BrutalNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-[150] p-6 md:p-10 flex justify-between items-center pointer-events-none">
      <div className="pointer-events-auto">
        <Link to="/" className="block">
          <Logo />
        </Link>
      </div>
      <div className="flex items-center gap-6 pointer-events-auto">
        <Link to="/packages" className="hidden md:block font-display text-xl uppercase tracking-widest hover:text-brand-yellow transition-colors text-paper drop-shadow-md">
          ALL_DESTINATIONS
        </Link>
        <Link to="/packages" className="btn-brutal py-2 md:py-3 text-sm md:text-base inline-block text-center">
          START_JOURNEY
        </Link>
      </div>
    </nav>
  );
};

export const BrutalFooter = () => {
  return (
    <footer className="py-20 px-6 md:px-20 border-t-2 border-paper/10 bg-void text-paper">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
        <div>
          <Logo />
          <p className="mt-8 font-mono text-sm opacity-50 max-w-xs">
            The premier curated travel collective. No fixed address. No fixed rules. Active since 2024.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10">
          <div>
            <DataLabel className="mb-6">CHANNELS</DataLabel>
            <ul className="space-y-4 font-display text-xl uppercase">
              <li><Link to="/" className="hover:text-brand-yellow transition-colors">Grid</Link></li>
              <li><Link to="/packages" className="hover:text-brand-yellow transition-colors">Destinations</Link></li>
              <li><Link to="/admin/login" className="hover:text-brand-yellow transition-colors">Admin_Protocol</Link></li>
            </ul>
          </div>
          <div>
            <DataLabel className="mb-6">SOCIAL_PULSE</DataLabel>
            <ul className="space-y-4 font-display text-xl uppercase">
              <li><a href="#" className="hover:text-brand-red transition-colors">Insta</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">X_Grid</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="bg-brand-yellow text-void p-8 brutal-border">
          <DataLabel className="text-void/60 mb-4">SYSTEM_ALERT</DataLabel>
          <h3 className="text-2xl mb-4 leading-none truncate">NEW_JOURNEYS_SOON</h3>
          <p className="font-mono text-xs mb-6">Stay inspired. Join our exclusive travel list.</p>
          <div className="flex">
            <input type="email" placeholder="EMAIL" className="bg-void text-paper p-3 font-mono text-xs flex-1 outline-none" />
            <button className="bg-brand-red text-paper p-3 px-6 font-display uppercase">GO</button>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-10 border-t border-paper/10 gap-6">
        <span className="font-mono text-[10px] opacity-30">© 2026 NO_FIXED_ADDRESS // ALL_RIGHTS_RESERVED.</span>
        <div className="flex gap-8 font-mono text-[10px] opacity-30 uppercase">
          <a href="#">Privacy_Protocol</a>
          <a href="#">Terms_of_Travel</a>
        </div>
      </div>
    </footer>
  );
};
