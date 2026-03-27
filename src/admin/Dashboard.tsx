// ─── Admin Dashboard ─────────────────────────────────────────────────────────
// Overview stats: total packages, bookings, revenue, pending actions

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, BookOpen, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { getPackages, getAllBookings, type Booking } from '../firebase/firestoreService';
import { DataLabel } from '../components/SharedBrutal';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, colorClass }) => (
  <div className="bg-paper/5 brutal-border p-6 flex flex-col md:flex-row items-start gap-6 hover:bg-paper/10 transition-colors">
    <div className={`w-14 h-14 brutal-border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <DataLabel>{label}</DataLabel>
      <p className="text-paper font-display text-4xl mt-2">{value}</p>
      {sub && <p className="text-paper/50 font-mono text-xs mt-2 uppercase">{sub}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [packageCount, setPackageCount] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pkgs, bkgs] = await Promise.all([getPackages(), getAllBookings()]);
        setPackageCount(pkgs.length);
        setBookings(bkgs);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const paidBookings = bookings.filter((b) => b.status === 'Paid');
  const pendingBookings = bookings.filter((b) => b.status === 'Pending');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <DataLabel className="text-brand-yellow mb-2">DASHBOARD_OVERVIEW</DataLabel>
        <h1 className="text-paper font-display text-5xl uppercase">COMMAND_CENTER.</h1>
        <p className="font-mono text-paper/50 text-sm mt-4 uppercase">Welcome back — ALL SYSTEMS NOMINAL.</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-paper/5 brutal-border p-6 h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            icon={<Package className="w-6 h-6 text-void" />}
            label="TOTAL_PACKAGES"
            value={packageCount}
            sub="Active listings"
            colorClass="bg-brand-yellow"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-paper" />}
            label="TOTAL_BOOKINGS"
            value={bookings.length}
            sub={`${paidBookings.length} paid`}
            colorClass="bg-brand-red"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-brand-yellow" />}
            label="TOTAL_REVENUE"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            sub="From confirmed bookings"
            colorClass="bg-void text-brand-yellow border-brand-yellow"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-void" />}
            label="PENDING_BOOKINGS"
            value={pendingBookings.length}
            sub="Awaiting payment"
            colorClass="bg-paper"
          />
        </div>
      )}

      {/* Recent bookings table */}
      <div className="bg-void brutal-border brutal-shadow">
        <div className="flex items-center justify-between px-6 py-6 border-b-2 border-paper/10">
          <div className="flex items-center gap-4">
            <TrendingUp className="w-6 h-6 text-brand-red" />
            <h2 className="text-paper font-display text-2xl uppercase">RECENT_BOOKINGS</h2>
          </div>
          <Link to="/admin/bookings" className="text-brand-yellow font-mono text-sm uppercase hover:text-brand-red flex items-center gap-2 transition-colors">
            VIEW_ALL <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-16 text-center text-paper/30 font-mono text-sm uppercase">NO_BOOKINGS_DETECTED.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-paper/5">
                <tr className="border-b-2 border-paper/10">
                  <th className="text-brand-yellow font-normal px-6 py-4 uppercase tracking-widest text-xs">Customer</th>
                  <th className="text-brand-yellow font-normal px-6 py-4 uppercase tracking-widest text-xs hidden md:table-cell">Package</th>
                  <th className="text-brand-yellow font-normal px-6 py-4 uppercase tracking-widest text-xs hidden lg:table-cell">Amount</th>
                  <th className="text-brand-yellow font-normal px-6 py-4 uppercase tracking-widest text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-paper/5 last:border-0 hover:bg-paper/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-paper font-bold uppercase">{b.name}</p>
                      <p className="text-paper/40 text-xs mt-1">{b.email}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-paper/70 truncate max-w-[200px] uppercase">{b.packageTitle || b.packageId}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-paper/60">
                      ₹{b.totalAmount?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${
                        b.status === 'Paid'
                          ? 'bg-brand-yellow text-void brutal-border'
                          : b.status === 'Cancelled'
                          ? 'bg-brand-red text-void brutal-border'
                          : 'bg-paper text-void brutal-border'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
