import React, { useEffect, useState } from 'react';
import { Package, BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react';
import { getPackages, getAllBookings, type Booking } from '../firebase/firestoreService';
import { StampedLabel } from '../components/SharedBrutal';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ pkgCount: 0, bkgCount: 0, revenue: 0, travelers: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);

  useEffect(() => {
    Promise.all([getPackages(), getAllBookings()]).then(([pkgs, bkgs]) => {
      const revenue = bkgs.filter(b => b.status === 'Paid').reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const travelers = bkgs.reduce((sum, b) => sum + (b.travelers || 0), 0);
      setStats({ pkgCount: pkgs.length, bkgCount: bkgs.length, revenue, travelers });
      setRecent(bkgs.slice(0, 5));
    });
  }, []);

  const Card = ({ label, value, icon: Icon, color }: any) => (
    <div className="thick-border bg-paper p-8 flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(17,17,17,1)]">
      <div className={`w-12 h-12 ${color} flex items-center justify-center border-2 border-void`}>
        <Icon className="text-paper" size={20} />
      </div>
      <div>
        <span className="font-mono text-[10px] font-black opacity-40 block mb-1 uppercase tracking-widest">{label}</span>
        <p className="text-4xl font-display font-black leading-none uppercase">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="border-b-4 border-void pb-8">
        <StampedLabel className="mb-4">EXPEDITION_COMMAND_CENTER</StampedLabel>
        <h1 className="text-6xl md:text-8xl font-display font-black leading-none uppercase">HQ_REPORT.</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card label="Active_Expeditions" value={stats.pkgCount} icon={Package} color="bg-brand-yellow" />
        <Card label="Total_Reservations" value={stats.bkgCount} icon={BookOpen} color="bg-brand-red" />
        <Card label="Total_Nomads" value={stats.travelers} icon={Users} color="bg-void" />
        <Card label="Net_Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={DollarSign} color="bg-brand-yellow" />
      </div>

      <div className="thick-border bg-void text-paper p-8">
        <div className="flex justify-between items-center mb-10 border-b border-paper/10 pb-6">
          <h2 className="text-3xl font-display font-black uppercase flex items-center gap-4">
            <TrendingUp className="text-brand-yellow" /> RECENT_ACTIVITY
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] font-black uppercase tracking-widest">
            <thead>
              <tr className="border-b border-paper/20 opacity-40">
                <th className="pb-4">NOMAD_IDENTIFIER</th>
                <th className="pb-4">EXPEDITION_REF</th>
                <th className="pb-4">STATUS</th>
                <th className="pb-4 text-right">CREDITS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-paper/5">
              {recent.map((b) => (
                <tr key={b.id} className="hover:bg-paper/5 transition-colors">
                  <td className="py-6">{b.name}<br/><span className="opacity-40">{b.email}</span></td>
                  <td className="py-6">{b.packageTitle}</td>
                  <td className="py-6">
                    <span className={`px-3 py-1 border-2 ${b.status === 'Paid' ? 'border-brand-yellow text-brand-yellow' : 'border-brand-red text-brand-red'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-6 text-right font-display text-xl text-brand-yellow">₹{b.totalAmount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};