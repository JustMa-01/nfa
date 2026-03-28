// ─── Categories Manager ────────────────────────────────────────────────────────
// Real-time category management separated from general settings

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2, X, Plus } from 'lucide-react';
import { getSettings, updateSettings } from '../firebase/firestoreService';
import { DataLabel } from '../components/SharedBrutal';

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getSettings();
        setCategories(data.categories || []);
      } catch (err) {
        toast.error('Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      toast.warning('Category already exists.');
      return;
    }

    setProcessing(true);
    try {
      const updatedCategories = [...categories, trimmed];
      await updateSettings({ categories: updatedCategories });
      setCategories(updatedCategories);
      setNewCategory('');
      toast.success(`Added category: ${trimmed}`);
    } catch (err) {
      toast.error('Failed to add category.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    const confirmed = window.confirm(`CONFIRM DELETION:\nAre you sure you want to delete the category "${catToDelete}"?`);
    if (!confirmed) return;

    setProcessing(true);
    try {
      const updatedCategories = categories.filter(c => c !== catToDelete);
      await updateSettings({ categories: updatedCategories });
      setCategories(updatedCategories);
      toast.success(`Deleted category: ${catToDelete}`);
    } catch (err) {
      toast.error('Failed to delete category.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-20">
        <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <DataLabel className="text-brand-yellow mb-2">CATEGORY MANAGEMENT</DataLabel>
        <h1 className="text-paper font-display text-5xl uppercase">CATEGORIES.</h1>
        <p className="font-mono text-paper/50 text-sm mt-4 uppercase">Manage package classifications in real-time.</p>
      </div>

      <div className="bg-paper/5 brutal-border brutal-shadow p-8 lg:p-10 space-y-8">
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            disabled={processing}
            placeholder="NEW CATEGORY NAME..."
            className="flex-1 bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={processing || !newCategory.trim()}
            className="btn-brutal whitespace-nowrap px-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            ADD CATEGORY
          </button>
        </form>

        <div className="space-y-4 pt-6 border-t-2 border-paper/10">
          <DataLabel className="mb-4 block text-brand-yellow">ACTIVE CATEGORIES [{categories.length}]</DataLabel>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.length === 0 ? (
              <span className="font-mono text-sm opacity-50 uppercase col-span-full py-4 text-center border-2 border-dashed border-paper/20 content-center">NO CATEGORIES DEFINED</span>
            ) : (
              categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between bg-void border-2 border-paper/20 hover:border-brand-yellow transition-colors p-3 group">
                  <span className="font-mono text-sm uppercase truncate text-paper font-bold group-hover:text-brand-yellow">{cat}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    disabled={processing}
                    className="text-brand-red opacity-50 hover:opacity-100 hover:bg-brand-red/10 p-1 transition-all disabled:opacity-20"
                    title={`Delete ${cat}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
