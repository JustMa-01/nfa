import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Loader2, X, Plus, Tags } from 'lucide-react';
import { getSettings, updateSettings } from '../firebase/firestoreService';
import { StampedLabel } from '../components/SharedBrutal';

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    getSettings().then(data => {
      setCategories(data.categories || []);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim() || processing) return;
    setProcessing(true);
    const updated = [...categories, newCategory.trim()];
    await updateSettings({ categories: updated });
    setCategories(updated);
    setNewCategory('');
    setProcessing(false);
    toast.success('TERRAIN_ADDED');
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="border-b-4 border-void pb-8">
        <StampedLabel className="mb-4">ENVIRONMENT_CLASSIFICATION</StampedLabel>
        <h1 className="text-6xl font-display font-black leading-none uppercase">TERRAINS.</h1>
      </div>

      <div className="thick-border bg-paper p-8 md:p-12 space-y-10 shadow-[12px_12px_0px_0px_rgba(17,17,17,1)]">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="NEW_TERRAIN_TYPE..."
            className="flex-1 bg-paper border-4 border-void p-5 font-mono text-sm uppercase outline-none focus:ring-4 ring-brand-yellow/20"
          />
          <button type="submit" className="px-10 bg-void text-paper font-mono font-black text-xs uppercase hover:bg-brand-yellow hover:text-void transition-all flex items-center justify-center gap-3">
            <Plus size={18} /> ADD_TYPE
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat} className="flex items-center justify-between border-2 border-void p-4 bg-void/5 group hover:bg-brand-yellow transition-all">
              <span className="font-mono text-[10px] font-black uppercase tracking-widest">{cat}</span>
              <button 
                onClick={async () => {
                  const updated = categories.filter(c => c !== cat);
                  await updateSettings({ categories: updated });
                  setCategories(updated);
                  toast.info('TERRAIN_REMOVED');
                }}
                className="text-brand-red opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;