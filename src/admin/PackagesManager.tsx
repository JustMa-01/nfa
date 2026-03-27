// ─── Package Manager (CRUD list) ─────────────────────────────────────────────
// Admin page: list, delete packages and link to add/edit form

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPackages, deletePackage, type Package as TPackage } from '../firebase/firestoreService';

const PackagesManager: React.FC = () => {
  const [packages, setPackages] = useState<TPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getPackages();
      setPackages(data);
    } catch {
      toast.error('Failed to load packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePackage(id);
      toast.success('Package deleted.');
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('Delete failed.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-2xl">Packages</h1>
          <p className="text-white/40 text-sm mt-1">{packages.length} package{packages.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link
          to="/admin/packages/add"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </Link>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No packages yet.</p>
            <Link to="/admin/packages/add" className="text-amber-400 text-sm hover:underline mt-2 inline-block">
              Add your first package
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-white/40 font-medium px-6 py-3">Package</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden sm:table-cell">Price</th>
                  <th className="text-left text-white/40 font-medium px-6 py-3 hidden lg:table-cell">Duration</th>
                  <th className="text-right text-white/40 font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {pkg.images?.[0] ? (
                          <img src={pkg.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <Package className="w-4 h-4 text-white/20" />
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{pkg.title}</p>
                          <p className="text-white/40 text-xs line-clamp-1 max-w-[200px]">{pkg.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="bg-white/5 text-white/60 text-xs px-2.5 py-1 rounded-full">{pkg.category || '—'}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-amber-400 font-semibold">
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-white/50">{pkg.duration || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/packages/edit/${pkg.id}`}
                          className="p-2 rounded-lg text-white/40 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(pkg.id!)}
                          disabled={deletingId === pkg.id}
                          className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {deletingId === pkg.id
                            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent block" />
                            : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-semibold">Delete Package?</h3>
            </div>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone. The package and all its data will be permanently deleted.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesManager;
