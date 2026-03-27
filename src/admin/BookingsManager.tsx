// ─── Bookings Manager ─────────────────────────────────────────────────────────
// Admin view: all bookings with filter by status and inline status updates

import React, { useEffect, useState } from 'react';
import { BookOpen, RefreshCw, Filter, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllBookings, updateBookingStatus, type Booking } from '../firebase/firestoreService';
import { DataLabel } from '../components/SharedBrutal';

const STATUS_FILTERS = ['All', 'Pending', 'Paid', 'Cancelled'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const statusStyle = {
  Paid: 'bg-brand-red text-paper border-brand-red',
  Pending: 'bg-brand-yellow text-void border-brand-yellow',
  Cancelled: 'bg-void text-paper/50 border-paper/20',
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
      toast.success(`STATUS_UPDATED :: ${newStatus.toUpperCase()}`);
    } catch {
      toast.error('FAILED TO UPDATE STATUS');
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
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-paper/10">
        <div>
          <DataLabel className="text-brand-yellow mb-2">RESERVATION_RECORDS</DataLabel>
          <h1 className="text-paper font-display text-5xl uppercase">BOOKINGS.</h1>
          <p className="font-mono text-paper/50 text-sm mt-4 uppercase">
            {bookings.length} TOTAL RECORD{bookings.length !== 1 ? 'S' : ''} DETECTED
          </p>
        </div>
        <button
          onClick={load}
          className="btn-brutal flex items-center gap-2 py-3 px-6 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          SYNC_DATA
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-4 bg-paper/5 p-4 brutal-border">
        <div className="flex items-center gap-2 mr-4 opacity-50 font-mono text-sm">
          <Filter className="w-4 h-4" />
          FILTER_BY_STATUS:
        </div>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
              filter === s
                ? 'bg-brand-yellow text-void brutal-border translate-x-1 -translate-y-1 shadow-[4px_4px_0_0_#A31621]'
                : 'text-paper/60 hover:text-brand-yellow border-2 border-transparent hover:border-brand-yellow'
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-paper/5 brutal-border brutal-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center border-b-2 border-paper/10">
            <BookOpen className="w-16 h-16 text-brand-red mx-auto mb-6 opacity-50" />
            <p className="text-paper/50 font-mono text-lg uppercase tracking-widest">
              NO_RECORDS_FOUND{filter !== 'All' ? ` [${filter.toUpperCase()}]` : ''}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-paper/10 bg-void/50 font-mono text-xs uppercase tracking-widest text-paper/50">
                  <th className="p-4 md:p-6 font-normal">CUSTOMER_DATA</th>
                  <th className="p-4 md:p-6 font-normal hidden md:table-cell">PACKAGE_REF</th>
                  <th className="p-4 md:p-6 font-normal hidden sm:table-cell">TIMEFRAME</th>
                  <th className="p-4 md:p-6 font-normal hidden lg:table-cell">MANIFEST</th>
                  <th className="p-4 md:p-6 font-normal hidden lg:table-cell">REVENUE</th>
                  <th className="p-4 md:p-6 font-normal">STATUS</th>
                  <th className="p-4 md:p-6 font-normal text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {filtered.map((b) => (
                  <tr key={b.id} className="border-b-2 border-paper/5 hover:bg-paper/5 transition-colors group">
                    <td className="p-4 md:p-6">
                      <p className="text-paper font-bold uppercase text-base">{b.name}</p>
                      <p className="text-brand-yellow mt-1">{b.phone}</p>
                      <p className="text-paper/40 text-xs mt-1 lowercase">{b.email}</p>
                    </td>
                    <td className="p-4 md:p-6 hidden md:table-cell align-top">
                      <p className="text-paper/70 text-xs max-w-[160px] uppercase truncate">
                        {b.packageTitle || b.packageId}
                      </p>
                    </td>
                    <td className="p-4 md:p-6 hidden sm:table-cell align-top">
                      <span className="bg-void px-2 py-1 border-2 border-paper/10 text-brand-yellow">
                        {b.travelDate}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 hidden lg:table-cell align-top text-paper/70">
                      {b.travelers} PAX
                    </td>
                    <td className="p-4 md:p-6 hidden lg:table-cell align-top text-brand-red font-bold">
                      ₹{b.totalAmount?.toLocaleString('en-IN') || '—'}
                    </td>
                    <td className="p-4 md:p-6 align-top">
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase brutal-border ${statusStyle[b.status]}`}>
                        [{b.status}]
                      </span>
                    </td>
                    <td className="p-4 md:p-6 align-top text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {updatingId === b.id ? (
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-yellow border-t-transparent" />
                        ) : (
                          <>
                            {b.status !== 'Paid' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Paid')}
                                className="px-3 py-2 bg-void text-brand-red border-2 border-brand-red hover:bg-brand-red hover:text-paper text-xs uppercase transition-colors"
                              >
                                MARK_PAID
                              </button>
                            )}
                            {b.status !== 'Pending' && b.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Pending')}
                                className="px-3 py-2 bg-void text-brand-yellow border-2 border-brand-yellow hover:bg-brand-yellow hover:text-void text-xs uppercase transition-colors"
                              >
                                SET_PENDING
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleStatusUpdate(b.id!, 'Cancelled')}
                                className="px-3 py-2 bg-void text-paper/50 border-2 border-paper/20 hover:border-paper hover:text-paper text-xs uppercase transition-colors"
                              >
                                CANCEL
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
