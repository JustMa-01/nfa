// ─── Package Manager (CRUD list) ─────────────────────────────────────────────
// Admin page: list, delete packages and link to add/edit form

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPackages, deletePackage, type Package as TPackage } from '../firebase/firestoreService';
import { DataLabel } from '../components/SharedBrutal';

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
      toast.error('FAILED TO LOAD PACKAGES');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deletePackage(id);
      toast.success('PACKAGE_TERMINATED');
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error('TERMINATION_FAILED');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b-2 border-paper/10">
        <div>
          <DataLabel className="text-brand-yellow mb-2">INVENTORY_CONTROL</DataLabel>
          <h1 className="text-paper font-display text-5xl uppercase">PACKAGES.</h1>
          <p className="font-mono text-paper/50 text-sm mt-4 uppercase">
            {packages.length} MODULE{packages.length !== 1 ? 'S' : ''} LISTED IN DATABASE
          </p>
        </div>
        <Link
          to="/admin/packages/add"
          className="btn-brutal flex items-center gap-2 py-3 px-6 text-sm"
        >
          <Plus className="w-4 h-4" />
          AUTHOR_NEW_PACKAGE
        </Link>
      </div>

      {/* Table */}
      <div className="bg-paper/5 brutal-border brutal-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
          </div>
        ) : packages.length === 0 ? (
          <div className="py-20 text-center border-b-2 border-paper/10">
            <Package className="w-16 h-16 text-brand-red mx-auto mb-6 opacity-50" />
            <p className="text-paper/50 font-mono text-lg uppercase tracking-widest mb-4">
              DATABASE_EMPTY
            </p>
            <Link to="/admin/packages/add" className="text-brand-yellow font-mono text-sm hover:underline uppercase block">
              &gt; INITIALIZE_FIRST_PACKAGE
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-paper/10 bg-void/50 font-mono text-xs uppercase tracking-widest text-paper/50">
                  <th className="p-4 md:p-6 font-normal">MODULE_ID</th>
                  <th className="p-4 md:p-6 font-normal hidden md:table-cell">CLASSIFICATION</th>
                  <th className="p-4 md:p-6 font-normal hidden sm:table-cell">VALUE_EXCHANGE</th>
                  <th className="p-4 md:p-6 font-normal hidden lg:table-cell">TIMEFRAME</th>
                  <th className="p-4 md:p-6 font-normal text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b-2 border-paper/5 hover:bg-paper/5 transition-colors group">
                    <td className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        {pkg.images?.[0] ? (
                          <img src={pkg.images[0]} alt="" className="w-16 h-16 object-cover brutal-border grayscale group-hover:grayscale-0 transition-all flex-shrink-0" />
                        ) : (
                          <div className="w-16 h-16 bg-void brutal-border flex items-center justify-center flex-shrink-0">
                            <Package className="w-6 h-6 text-paper/20" />
                          </div>
                        )}
                        <div>
                          <p className="text-paper font-display text-xl uppercase leading-tight mb-1">{pkg.title}</p>
                          <p className="text-paper/40 text-xs line-clamp-2 max-w-[250px] uppercase font-sans tracking-wide">{pkg.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 hidden md:table-cell align-top mt-2">
                      <span className="bg-void px-3 py-1 border-2 border-paper/10 text-brand-yellow uppercase text-xs inline-block mt-2">
                        {pkg.category || 'UNCLASSIFIED'}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 hidden sm:table-cell align-top text-brand-red font-bold text-lg mt-2">
                      <div className="mt-2">₹{pkg.price.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="p-4 md:p-6 hidden lg:table-cell align-top text-paper/70 mt-2">
                      <div className="mt-2 text-xs uppercase">{pkg.duration || 'N/A'}</div>
                    </td>
                    <td className="p-4 md:p-6 align-top text-right mt-2">
                      <div className="flex items-center justify-end gap-3 mt-2">
                        <Link
                          to={`/admin/packages/edit/${pkg.id}`}
                          className="p-3 bg-void border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-void transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(pkg.id!)}
                          disabled={deletingId === pkg.id}
                          className="p-3 bg-void border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-paper transition-colors disabled:opacity-50"
                        >
                          {deletingId === pkg.id
                            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent block" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm p-4">
          <div className="bg-paper/5 border-2 border-brand-red brutal-shadow p-8 max-w-md w-full relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-brand-red" />
            <div className="flex items-center gap-4 mb-6 pt-2">
              <div className="w-12 h-12 brutal-border bg-brand-red flex items-center justify-center -rotate-6">
                <AlertTriangle className="w-6 h-6 text-paper" />
              </div>
              <h3 className="text-paper font-display text-3xl uppercase">WARNING.</h3>
            </div>
            <p className="text-paper/70 font-mono text-sm uppercase leading-relaxed mb-8 border-l-2 border-brand-red pl-4">
              DESTRUCTIVE_ACTION_DETECTED.<br/>
              THIS OPERATION WILL PERMANENTLY ERASE THE SELECTED PACKAGE AND ALL ASSOCIATED METADATA FROM THE DATABASE.<br/>
              PROCEED_WITH_CAUTION.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 bg-void border-2 border-paper/20 hover:border-paper text-paper font-mono uppercase text-sm transition-colors"
              >
                ABORT
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-4 bg-brand-red text-paper font-mono uppercase text-sm font-bold brutal-border hover:-translate-y-1 shadow-[4px_4px_0_0_#FFF] transition-all"
              >
                CONFIRM_DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesManager;
