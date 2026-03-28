import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Plus, Trash2, Link as LinkIcon, X, Globe } from 'lucide-react';
import { StampedLabel } from '../components/SharedBrutal';
import { getPackageById, addPackage, updatePackage } from '../firebase/firestoreService';

const PackageForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<string[]>(['']);
  const [availableDates, setAvailableDates] = useState<{ startDate: string; endDate: string }[]>([]);
  
  // NEW: State to manage External Image URLs
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentUrlInput, setCurrentUrlInput] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (id) {
      getPackageById(id).then(pkg => {
        if (pkg) {
          reset(pkg);
          setItinerary(pkg.itinerary || ['']);
          setAvailableDates(pkg.availableDates || []);
          setImageUrls(pkg.images || []); // Load existing URLs
        }
      });
    }
  }, [id, reset]);

  const addExternalImage = () => {
    if (!currentUrlInput.trim()) return;
    if (!currentUrlInput.startsWith('http')) {
      alert("PLEASE PROVIDE A VALID SECURE URL (HTTPS)");
      return;
    }
    setImageUrls([...imageUrls, currentUrlInput.trim()]);
    setCurrentUrlInput('');
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const finalData = { 
        ...data, 
        itinerary, 
        availableDates, 
        images: imageUrls, // Save the array of strings (URLs)
        price: Number(data.price) 
      };
      
      if (id) await updatePackage(id, finalData);
      else await addPackage(finalData);
      
      navigate('/admin/packages');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-4 border-void pb-8">
        <div>
          <button onClick={() => navigate('/admin/packages')} className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-brand-red mb-4 hover:translate-x-1 transition-all">
            <ArrowLeft size={14} /> ABORT_DRAFTING
          </button>
          <h1 className="text-6xl font-display font-black leading-none uppercase">
            {id ? 'EDIT_EXPEDITION' : 'NEW_EXPEDITION'}.
          </h1>
        </div>
        <button 
          onClick={handleSubmit(onSubmit)} 
          disabled={submitting}
          className="px-10 py-5 bg-brand-yellow text-void font-mono font-black text-xs tracking-widest hover:bg-void hover:text-paper transition-all shadow-[8px_8px_0px_0px_#C23A2B] disabled:opacity-50"
        >
          {submitting ? 'COMMITTING...' : 'COMMIT_TO_DATABASE ➔'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: TEXT DATA */}
        <div className="lg:col-span-8 space-y-8">
          <div className="thick-border bg-paper p-8 space-y-8">
            <h2 className="stamped-text border-void/20 mb-4">EXPEDITION_META</h2>
            
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black opacity-40 uppercase">EXPEDITION_TITLE</label>
              <input {...register('title', { required: true })} className="w-full bg-void text-paper p-5 font-display text-4xl uppercase outline-none focus:ring-4 ring-brand-yellow/20" placeholder="E.G. ANDES_PEAKS" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black opacity-40 uppercase">MANIFESTO_DESCRIPTION</label>
              <textarea {...register('description', { required: true })} rows={5} className="w-full bg-paper border-4 border-void p-5 font-serif italic text-lg outline-none" placeholder="DESCRIBE THE JOURNEY..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-black opacity-40 uppercase">BASE_CREDITS (PRICE)</label>
                <input type="number" {...register('price', { required: true })} className="w-full bg-paper border-4 border-void p-4 font-display text-2xl outline-none" placeholder="25000" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-black opacity-40 uppercase">DURATION_LOG</label>
                <input {...register('duration')} className="w-full bg-paper border-4 border-void p-4 font-mono text-sm outline-none" placeholder="10_DAYS_9_NIGHTS" />
              </div>
            </div>
          </div>

          {/* ITINERARY */}
          <div className="thick-border bg-void text-paper p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="stamped-text border-brand-yellow/30 text-brand-yellow">TRANSMISSION_TIMELINE</h2>
              <button type="button" onClick={() => setItinerary([...itinerary, ''])} className="p-2 border-2 border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-void"><Plus size={16} /></button>
            </div>
            {itinerary.map((day, i) => (
              <div key={i} className="flex gap-4">
                <div className="shrink-0 w-12 h-12 bg-brand-yellow text-void flex items-center justify-center font-display font-black text-2xl border-2 border-paper">0{i+1}</div>
                <textarea 
                  value={day} 
                  onChange={(e) => {
                    const next = [...itinerary];
                    next[i] = e.target.value;
                    setItinerary(next);
                  }}
                  className="flex-1 bg-paper/5 border border-paper/10 p-4 font-mono text-sm outline-none focus:border-brand-yellow" 
                  placeholder={`LOG FOR DAY ${i+1}...`} 
                />
                <button type="button" onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="text-brand-red"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: MEDIA & LOGISTICS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* EXTERNAL VISUAL ASSETS (The replacement for Storage) */}
          <div className="thick-border bg-void text-paper p-8 space-y-6">
             <h2 className="stamped-text border-brand-yellow/30 text-brand-yellow">VISUAL_ASSET_REGISTRY</h2>
             
             <div className="space-y-4">
               <div className="flex flex-col gap-2">
                 <label className="font-mono text-[8px] opacity-40 uppercase tracking-widest">EXTERNAL_SOURCE_URL</label>
                 <div className="flex gap-2">
                    <input 
                      type="text"
                      value={currentUrlInput}
                      onChange={(e) => setCurrentUrlInput(e.target.value)}
                      placeholder="HTTPS://IMAGE-LINK.COM/FILE.JPG"
                      className="flex-1 bg-paper/5 border border-paper/20 p-3 font-mono text-[10px] outline-none focus:border-brand-yellow"
                    />
                    <button 
                      type="button"
                      onClick={addExternalImage}
                      className="bg-brand-yellow text-void px-4 font-mono font-black text-[10px]"
                    >
                      REGISTER
                    </button>
                 </div>
               </div>

               {/* PREVIEW GRID */}
               <div className="grid grid-cols-2 gap-3 mt-6">
                 {imageUrls.map((url, index) => (
                   <div key={index} className="relative aspect-square border-2 border-paper/10 group overflow-hidden">
                     <img src={url} alt="Registry Asset" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                     <button 
                       type="button"
                       onClick={() => removeImage(index)}
                       className="absolute top-1 right-1 bg-brand-red text-paper p-1 border border-paper/20 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <X size={12} />
                     </button>
                     <div className="absolute bottom-0 left-0 right-0 bg-void/80 p-1 font-mono text-[6px] truncate opacity-40">
                       {url}
                     </div>
                   </div>
                 ))}
                 {imageUrls.length === 0 && (
                   <div className="col-span-2 py-10 border-2 border-dashed border-paper/10 flex flex-col items-center justify-center text-paper/20">
                     <Globe size={24} />
                     <span className="font-mono text-[8px] mt-2 uppercase">NO_ASSETS_LINKED</span>
                   </div>
                 )}
               </div>
             </div>
          </div>

          {/* DEPLOYMENT WINDOWS */}
          <div className="thick-border bg-paper p-8 space-y-6">
             <h2 className="stamped-text border-void/20 mb-4">DEPLOYMENT_WINDOWS</h2>
             <div className="space-y-4">
               {availableDates.map((d, i) => (
                 <div key={i} className="p-4 border-2 border-void font-mono text-[10px] flex justify-between relative">
                   <span>{d.startDate} ➔ {d.endDate}</span>
                   <button type="button" onClick={() => setAvailableDates(availableDates.filter((_, idx) => idx !== i))} className="text-brand-red ml-2"><X size={12} /></button>
                 </div>
               ))}
               <button 
                 type="button" 
                 onClick={() => setAvailableDates([...availableDates, { startDate: '', endDate: '' }])}
                 className="w-full py-4 border-2 border-dashed border-void text-void font-mono text-[10px] font-black hover:bg-void hover:text-paper transition-all"
               >
                 [+] ADD_WINDOW
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageForm;