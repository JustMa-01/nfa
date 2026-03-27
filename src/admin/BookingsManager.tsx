// ─── Bookings Manager ─────────────────────────────────────────────────────────
// Admin view: all bookings with filter by status and inline status updates

import React, { useEffect, useState } from 'react';
import { BookOpen, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBookings, updateBookingStatus, type Booking } from '../firebase/firestoreService';

const STATUS_FILTERS = ['All', 'Pending', 'Paid', 'Cancelled'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const statusStyle = {
  Paid: 'bg-green-500/15 text-green-400',
  Pending: 'bg-amber-500/15 text-amber-400',
  Cancelled: 'bg-red-500/15 text-red-400',
};

const BookingsManager: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStatusUpdate = async (id: string, newStatus: Booking['status']) => {
    setUpdatingId(id);
    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = bookings.filter((b) => filter === 'All' || b.status === filter);

  const counts = {
    All: bookings.length,
    Pending: bookings.filter((b) => b.status === 'Pending').length,
    Paid: bookings.filter((b) => b.status === 'Paid').length,
    Cancelled: bookings.filter((b) => b.status === 'Cancelled').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-white font-bold text-2xl">Bookings</h1>
          <p className="text-white/40 text-sm mt-1">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/5 px-4 py-2 rounded-xl text-sm transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        <Filter className="w-4 h-4 text-white/30 mr-1" />
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === s
                ? 'bg-amber-500 text-slate-950'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No bookings found{filter !== 'All' ? ` with status "${filter}"` : ''}.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 font-medium px-6 py-3">Customer</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden md:table-cell">Package</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden sm:table-cell">Travel Date</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden lg:table-cell">Travelers</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden lg:table-cell">Amount</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3">Status</th>
                  <th className="text-right text-white/40 font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{b.name}</p>
                      <p className="text-white/40 text-xs">{b.phone}</p>
                      <p className="text-white/30 text-xs">{b.email}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-white/70 text-xs max-w-[140px] line-clamp-2">
                        {b.packageTitle || b.packageId}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-white/50 text-xs">{b.travelDate}</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-white/50 text-xs">{b.travelers} pax</td>
                    <td className="px-6 py-4 hidden lg:table-cell text-amber-400 font-semibold text-xs">
                      ₹{b.totalAmount?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {updatingId === b.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                        ) : (
                          <>
                            {b.status !== 'Paid' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Paid')}
                                className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-medium transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}
                            {b.status !== 'Pending' && b.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Pending')}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
                              >
                                Pending
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Cancelled')}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
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

export default BookingsManager;
