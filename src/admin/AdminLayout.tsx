// ─── Admin Layout ─────────────────────────────────────────────────────────────
// Sidebar + top navbar layout wrapper for all admin pages

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Package, BookOpen, Settings, LogOut,
  Menu, X, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { signOut } from '../firebase/authService';
import { useAuth } from '../contexts/AuthContext';
import { DataLabel } from '../components/SharedBrutal';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'DASHBOARD' },
  { to: '/admin/packages', icon: Package, label: 'PACKAGES' },
  { to: '/admin/bookings', icon: BookOpen, label: 'BOOKINGS' },
  { to: '/admin/settings', icon: Settings, label: 'SETTINGS' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.info('Signed out successfully.');
    navigate('/admin/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-6 py-4 font-mono text-sm uppercase tracking-widest transition-all duration-200 ${
      isActive
        ? 'bg-brand-yellow text-void brutal-border'
        : 'text-paper/60 hover:text-brand-yellow border-2 border-transparent hover:border-brand-yellow'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-void">
      {/* Logo */}
      <div className="flex items-center gap-4 p-6 border-b-2 border-paper/10">
        <div className="w-12 h-12 brutal-border bg-brand-yellow flex items-center justify-center flex-shrink-0">
          <Compass className="w-6 h-6 text-void" />
        </div>
        <div>
          <p className="text-paper font-display text-xl leading-none uppercase">No Fixed</p>
          <p className="text-brand-yellow font-display text-xl leading-none uppercase">Address.</p>
        </div>
      </div>

      <div className="px-6 py-4 border-b-2 border-paper/10 bg-paper/5">
        <DataLabel>ACCESS_LEVEL :: ADMIN</DataLabel>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-6 space-y-4">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
            <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-6 border-t-2 border-paper/10 bg-paper/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 brutal-border bg-brand-red flex items-center justify-center text-paper font-display text-xl">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-paper font-mono text-xs uppercase truncate">{user?.email || 'ADMIN_USER'}</p>
            <p className="text-brand-yellow font-mono text-[10px] uppercase mt-1 tracking-widest">SYSTEM_OPERATOR</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 brutal-border text-paper font-mono uppercase text-sm hover:bg-brand-red hover:text-paper transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          TERMINATE_SESSION
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-void overflow-hidden selection:bg-brand-yellow selection:text-void">
      {/* ── Desktop Sidebar ──────────────────────── */}
      <aside className="hidden lg:flex flex-col w-72 border-r-2 border-paper/10 flex-shrink-0 z-20 brutal-shadow">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-void/90 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 border-r-2 border-brand-yellow brutal-shadow">
            <button
              className="absolute top-6 right-6 text-paper hover:text-brand-yellow"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top bar */}
        <header className="h-20 flex items-center px-6 md:px-10 border-b-2 border-paper/10 bg-void/90 backdrop-blur z-10 flex-shrink-0">
          <button
            className="lg:hidden p-2 text-brand-yellow mr-4 brutal-border bg-paper/5"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <DataLabel className="text-paper hidden sm:inline-block">SYSTEM_STATUS :: ONLINE</DataLabel>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-paper font-mono text-xs uppercase tracking-widest hover:text-brand-yellow flex items-center gap-2 transition-colors border-2 border-paper/20 bg-paper/5 px-4 py-3 hover:border-brand-yellow brutal-border"
          >
            VIEW_PUBLIC_COMMS →
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
