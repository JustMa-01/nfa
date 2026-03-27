// ─── Admin Dashboard ─────────────────────────────────────────────────────────
// Overview stats: total packages, bookings, revenue, pending actions

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, BookOpen, DollarSign, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { getPackages, getAllBookings, type Booking } from '../firebase/firestoreService';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, sub, color }) => (
  <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-white/50 text-sm">{label}</p>
      <p className="text-white font-bold text-2xl mt-0.5">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white font-bold text-2xl">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl border border-white/5 p-6 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="w-6 h-6 text-blue-400" />}
            label="Total Packages"
            value={packageCount}
            sub="Active listings"
            color="bg-blue-500/10"
          />
          <StatCard
            icon={<BookOpen className="w-6 h-6 text-amber-400" />}
            label="Total Bookings"
            value={bookings.length}
            sub={`${paidBookings.length} paid`}
            color="bg-amber-500/10"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-green-400" />}
            label="Total Revenue"
            value={`₹${totalRevenue.toLocaleString('en-IN')}`}
            sub="From paid bookings"
            color="bg-green-500/10"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-orange-400" />}
            label="Pending Bookings"
            value={pendingBookings.length}
            sub="Awaiting payment"
            color="bg-orange-500/10"
          />
        </div>
      )}

      {/* Recent bookings table */}
      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h2 className="text-white font-semibold">Recent Bookings</h2>
          </div>
          <Link to="/admin/bookings" className="text-amber-400 text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-sm">No bookings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 font-medium px-6 py-3">Customer</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden md:table-cell">Package</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden lg:table-cell">Amount</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="px-6 py-3">
                      <p className="text-white font-medium">{b.name}</p>
                      <p className="text-white/40 text-xs">{b.email}</p>
                    </td>
                    <td className="px-6 py-3 hidden md:table-cell">
                      <p className="text-white/70 truncate max-w-[160px]">{b.packageTitle || b.packageId}</p>
                    </td>
                    <td className="px-6 py-3 hidden lg:table-cell text-white/60">
                      ₹{b.totalAmount?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        b.status === 'Paid'
                          ? 'bg-green-500/15 text-green-400'
                          : b.status === 'Cancelled'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-amber-500/15 text-amber-400'
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
