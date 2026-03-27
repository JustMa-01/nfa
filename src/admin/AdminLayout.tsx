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

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/packages', icon: Package, label: 'Packages' },
  { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
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
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
        : 'text-white/60 hover:bg-white/5 hover:text-white'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-6 border-b border-white/5">
        <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Compass className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm leading-tight">No Fixed</p>
          <p className="text-amber-400 font-semibold text-sm leading-tight">Address</p>
        </div>
        <span className="ml-auto text-white/20 text-xs px-2 py-0.5 rounded-md bg-white/5">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            <ChevronRight className="w-3 h-3 ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email || 'Admin'}</p>
            <p className="text-white/30 text-xs">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* ── Desktop Sidebar ──────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar Overlay ───────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-white/5">
            <button
              className="absolute top-4 right-4 text-white/40 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main Content ─────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center px-6 border-b border-white/5 bg-slate-950/50 backdrop-blur flex-shrink-0">
          <button
            className="lg:hidden p-2 text-white/50 hover:text-white mr-3"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-amber-400 text-sm transition-colors"
          >
            View Website →
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
