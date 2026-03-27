// Navbar — responsive top navigation for the public site

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Compass, Phone } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Add background on scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-all duration-200 hover:text-amber-400 ${
      isActive ? 'text-amber-400' : 'text-white/90'
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-md shadow-lg border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-slate-950" />
            </div>
            <span className="text-white font-bold text-lg tracking-wide leading-tight">
              No Fixed<br />
              <span className="text-amber-400">Address</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={linkClass} end>Home</NavLink>
            <NavLink to="/packages" className={linkClass}>Packages</NavLink>
            <a href="tel:+917000000000" className="flex items-center gap-1.5 text-sm font-medium text-white/90 hover:text-amber-400 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              +91 70000 00000
            </a>
            <Link
              to="/packages"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5"
            >
              Explore Trips
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white/90 hover:text-amber-400 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-950/98 backdrop-blur-md border-t border-white/5 px-4 py-6 space-y-4">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/packages" className={linkClass}>Packages</NavLink>
          <Link
            to="/packages"
            className="block bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm px-5 py-3 rounded-full text-center transition-colors mt-4"
          >
            Explore Trips
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
