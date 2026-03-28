import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  Navigation, LayoutDashboard, Package, BookOpen, Settings, LogOut, 
  Menu, X, ChevronRight, Tags, Globe 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from '../firebase/authService';
import { StampedLabel } from '../components/SharedBrutal';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'OVERVIEW' },
  { to: '/admin/packages', icon: Package, label: 'EXPEDITIONS' },
  { to: '/admin/bookings', icon: BookOpen, label: 'RESERVATIONS' },
  { to: '/admin/categories', icon: Tags, label: 'TERRAINS' },
  { to: '/admin/settings', icon: Settings, label: 'HQ_SETTINGS' },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.info('Session Terminated.');
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-void text-paper grain-texture">
      <div className="p-8 border-b-4 border-brand-yellow">
        <div className="flex items-center gap-3">
          <Navigation className="text-brand-yellow" size={28} />
          <span className="font-display font-black text-xl tracking-tighter">NFA_HQ</span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to} to={to} 
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 font-mono text-[10px] font-black tracking-[0.2em] transition-all
              ${isActive ? 'bg-brand-yellow text-void border-2 border-void' : 'hover:bg-paper/5 opacity-60 hover:opacity-100'}
            `}
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-8 border-t border-paper/10">
        <button onClick={handleSignOut} className="w-full py-4 border-2 border-brand-red text-brand-red font-mono font-black text-[10px] tracking-widest hover:bg-brand-red hover:text-paper transition-all">
          LOGOUT_PROTOCOL
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-paper text-void selection:bg-brand-yellow overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r-4 border-void">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-0 z-200 lg:hidden">
            <div className="absolute inset-0 bg-void/80" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72"><SidebarContent /></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 flex items-center px-6 md:px-10 border-b-4 border-void bg-paper/80 backdrop-blur shrink-0 justify-between">
          <button className="lg:hidden text-void" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div className="flex items-center gap-4">
             <Globe size={16} className="text-brand-red animate-pulse" />
             <span className="font-mono text-[10px] font-black tracking-widest uppercase">HQ_NODE // ACTIVE</span>
          </div>
          <Link to="/" target="_blank" className="font-mono text-[10px] font-black border-2 border-void px-4 py-2 hover:bg-void hover:text-paper transition-all">VIEW_SITE ➔</Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-12 grain-texture">
          <Outlet />
        </main>
      </div>
    </div>
  );
};