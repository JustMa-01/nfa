import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation, Menu } from 'lucide-react';
import { cn } from '../utils';

export const StampedLabel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("stamped-text", className)}>
    {children}
  </span>
);

export const Logo = () => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 bg-brand-yellow flex items-center justify-center border-2 border-void">
      <Navigation size={20} className="text-void fill-void" />
    </div>
    <span className="text-xl md:text-2xl font-display font-black tracking-tighter text-brand-yellow">
      NO FIXED ADDRESS
    </span>
  </div>
);

export const BrutalNavbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-150 bg-void/90 backdrop-blur-md border-b-4 border-brand-yellow p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="pointer-events-auto">
          <Logo />
        </Link>
        
        <div className="hidden md:flex gap-8 items-center pointer-events-auto">
          {["EXPEDITIONS", "COLLECTIVE"].map((item) => (
            <Link key={item} to="/packages" className="text-[10px] font-mono font-bold tracking-[0.2em] hover:text-brand-yellow transition-colors text-paper">
              {item}
            </Link>
          ))}
          <Link to="/packages" className="px-6 py-2 bg-brand-yellow text-void font-mono font-black text-[10px] tracking-widest hover:bg-brand-red hover:text-paper transition-all">
            JOIN_EXPEDITION
          </Link>
        </div>

        <button className="md:hidden text-brand-yellow">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

export const BrutalFooter = () => (
  <footer className="bg-void text-paper border-t-8 border-brand-yellow pt-32 pb-12 px-6 grain-texture">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
        <div className="col-span-1 lg:col-span-2">
          <h2 className="text-6xl font-display font-black text-brand-yellow mb-8 leading-none">NO FIXED<br />ADDRESS.</h2>
          <p className="text-xl font-display italic opacity-60 max-w-md">
            The world is not a map. It's a series of statements. Make yours.
          </p>
        </div>
        <div>
          <h4 className="stamped-text text-brand-yellow mb-8">NAVIGATION</h4>
          <ul className="flex flex-col gap-4 text-xs font-mono font-bold">
            <li><Link to="/" className="hover:text-brand-yellow">MANIFESTO</Link></li>
            <li><Link to="/packages" className="hover:text-brand-yellow">EXPEDITIONS</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="stamped-text text-brand-yellow mb-8">CONNECT</h4>
          <ul className="flex flex-col gap-4 text-xs font-mono font-bold">
            <li><a href="#" className="hover:text-brand-yellow">INSTAGRAM</a></li>
            <li><a href="#" className="hover:text-brand-yellow">SUBSTACK</a></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-paper/10 gap-8">
        <span className="text-[10px] font-mono opacity-40">© 2026 NO FIXED ADDRESS COLLECTIVE.</span>
        <div className="flex gap-8 text-[10px] font-mono font-bold opacity-40">
          <a href="#">PRIVACY</a>
          <a href="#">TERMS</a>
        </div>
      </div>
    </div>
  </footer>
);