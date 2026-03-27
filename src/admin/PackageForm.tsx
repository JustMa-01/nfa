// ─── Package Form (Add / Edit) ────────────────────────────────────────────────
// Handles both creating new packages and editing existing ones
// Supports multi-image upload to Firebase Storage with preview

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Plus, Trash2, Upload, X, Image, AlertCircle, ArrowLeft, Save, Loader2
} from 'lucide-react';
import {
  getPackageById, addPackage, updatePackage, type Package
} from '../firebase/firestoreService';
import { uploadImages } from '../firebase/storageService';
import { DataLabel } from '../components/SharedBrutal';

interface PackageFormData {
  title: string;
  price: number;
  description: string;
  duration: string;
  category: string;
  featured: boolean;
}

const CATEGORIES = ['Beach', 'Mountain', 'Cultural', 'Adventure', 'Wildlife', 'City', 'Pilgrimage'];

const PackageForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState<string[]>(['']);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingPackage, setLoadingPackage] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors }
  } = useForm<PackageFormData>();

  // Load existing package for edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        const pkg = await getPackageById(id);
        if (!pkg) { toast.error('PACKAGE_NOT_FOUND'); navigate('/admin/packages'); return; }
        reset({
          title: pkg.title,
          price: pkg.price,
          description: pkg.description,
          duration: pkg.duration || '',
          category: pkg.category || '',
          featured: pkg.featured || false,
        });
        setItinerary(pkg.itinerary?.length ? pkg.itinerary : ['']);
        setExistingImages(pkg.images || []);
      } catch {
        toast.error('FAILED_TO_LOAD_PACKAGE');
      } finally {
        setLoadingPackage(false);
      }
    };
    load();
  }, [id, isEdit, navigate, reset]);

  // ── Image handling ───────────────────────────────────────
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > 8) { toast.warn('MAXIMUM 8 IMAGES ALLOWED'); return; }

    // Generate previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setNewImageFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  }, [existingImages.length, newImageFiles.length]);

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  const removeNewImage = (idx: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Itinerary handling ───────────────────────────────────
  const updateDay = (idx: number, val: string) => {
    setItinerary((prev) => prev.map((d, i) => (i === idx ? val : d)));
  };
  const addDay = () => setItinerary((prev) => [...prev, '']);
  const removeDay = (idx: number) => setItinerary((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────
  const onSubmit = async (data: PackageFormData) => {
    // Validate itinerary has at least 1 non-empty entry
    const validItinerary = itinerary.filter((d) => d.trim().length > 0);
    if (validItinerary.length === 0) {
      toast.error('MISSING_ITINERARY_DATA');
      return;
    }

    setSubmitting(true);
    try {
      let allImageUrls = [...existingImages];

      // Upload new images if any
      if (newImageFiles.length > 0) {
        setUploading(true);
        const folder = `packages/${id || Date.now()}`;
        const uploaded = await uploadImages(newImageFiles, folder, setUploadProgress);
        allImageUrls = [...allImageUrls, ...uploaded];
        setUploading(false);
      }

      const packageData: Omit<Package, 'id' | 'createdAt'> = {
        title: data.title.trim(),
        price: Number(data.price),
        description: data.description.trim(),
        duration: data.duration.trim(),
        category: data.category,
        featured: data.featured,
        itinerary: validItinerary,
        images: allImageUrls,
      };

      if (isEdit && id) {
        await updatePackage(id, packageData);
        toast.success('PACKAGE_UPDATED');
      } else {
        await addPackage(packageData);
        toast.success('PACKAGE_CREATED');
      }
      navigate('/admin/packages');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('SAVE_OPERATION_FAILED');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loadingPackage) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-6 pb-6 border-b-2 border-paper/10">
        <button
          onClick={() => navigate('/admin/packages')}
          className="p-3 brutal-border bg-void text-paper hover:text-brand-yellow hover:border-brand-yellow transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <DataLabel className="text-brand-yellow mb-2">PACKAGE_AUTHORING_TOOL</DataLabel>
          <h1 className="text-paper font-display text-4xl uppercase">{isEdit ? 'EDIT_PACKAGE.' : 'NEW_PACKAGE.'}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Main fields ─────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic info */}
            <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-paper/10 pb-4 mb-6">
                <h2 className="text-brand-red font-display text-2xl uppercase">CORE_PARAMETERS</h2>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-2">
                <DataLabel>TITLE_IDENTIFIER *</DataLabel>
                <input
                  {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Too short' } })}
                  placeholder="e.g. GOA_BEACH_PARADISE"
                  className={`w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase ${
                    errors.title ? 'border-brand-red' : ''
                  }`}
                />
                {errors.title && (
                  <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                    <AlertCircle className="w-4 h-4" /> {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <DataLabel>DETAILED_DESCRIPTION *</DataLabel>
                <textarea
                  {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                  placeholder="ENTER_PACKAGE_DETAILS..."
                  rows={4}
                  className={`w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors resize-none uppercase ${
                    errors.description ? 'border-brand-red' : ''
                  }`}
                />
                {errors.description && (
                  <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                    <AlertCircle className="w-4 h-4" /> {errors.description.message}
                  </p>
                )}
              </div>

              {/* Price + Duration row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <DataLabel>VALUE_EXCHANGE (₹) *</DataLabel>
                  <input
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Must be > 0' },
                    })}
                    type="number"
                    min={0}
                    placeholder="25000"
                    className={`w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${
                      errors.price ? 'border-brand-red' : ''
                    }`}
                  />
                  {errors.price && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.price.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <DataLabel>TIMEFRAME</DataLabel>
                  <input
                    {...register('duration')}
                    placeholder="5_DAYS_4_NIGHTS"
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Category + Featured row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <DataLabel>CLASSIFICATION</DataLabel>
                  <select
                    {...register('category')}
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase cursor-pointer"
                  >
                    <option value="">SELECT_CATEGORY</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-8 h-8 brutal-border bg-void group-hover:border-brand-yellow transition-colors">
                      <input
                        type="checkbox"
                        {...register('featured')}
                        className="peer appearance-none w-full h-full cursor-pointer"
                      />
                      <div className="absolute inset-2 bg-brand-yellow scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="font-mono text-paper text-sm uppercase tracking-widest group-hover:text-brand-yellow transition-colors">FLAG_AS_FEATURED</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-paper/10 pb-4 mb-6">
                <h2 className="text-brand-yellow font-display text-2xl uppercase">SEQUENCE_OF_EVENTS</h2>
                <button
                  type="button"
                  onClick={addDay}
                  className="btn-brutal py-2 px-4 text-xs font-mono"
                >
                  [+] APPEND_DAY
                </button>
              </div>

              <div className="space-y-4">
                {itinerary.map((day, i) => (
                  <div key={i} className="flex gap-4 items-start bg-void p-4 brutal-border">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow brutal-border flex items-center justify-center -rotate-3">
                      <span className="text-void font-display text-xl">{i + 1}</span>
                    </div>
                    <textarea
                      value={day}
                      onChange={(e) => updateDay(i, e.target.value)}
                      placeholder={`DAY_${i + 1}_LOG_ENTRY...`}
                      rows={2}
                      className="flex-1 bg-transparent text-paper font-mono text-sm outline-none resize-none placeholder:text-paper/20 uppercase"
                    />
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(i)}
                        className="flex-shrink-0 p-2 brutal-border text-brand-red hover:bg-brand-red hover:text-paper transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Images ──────────────────────── */}
          <div className="space-y-8">
            <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-paper/10 pb-4 mb-6">
                <h2 className="text-paper font-display text-2xl uppercase">VISUAL_ASSETS</h2>
                <DataLabel className="mt-2 text-paper/50">MAX_8_FILES :: PRIMARY=0</DataLabel>
              </div>

              {/* Upload button */}
              <label className="flex flex-col items-center justify-center gap-4 p-8 brutal-border border-dashed hover:border-brand-yellow hover:bg-brand-yellow/5 cursor-pointer transition-all group">
                <div className="w-12 h-12 brutal-border bg-brand-yellow flex items-center justify-center group-hover:-translate-y-1 transition-transform shadow-[4px_4px_0_0_#FFF]">
                  <Upload className="w-6 h-6 text-void" />
                </div>
                <div className="text-center">
                  <p className="text-brand-yellow font-mono font-bold uppercase tracking-widest text-sm">INITIALIZE_UPLOAD</p>
                  <p className="text-paper/40 font-mono text-[10px] uppercase mt-2">JPG // PNG // WEBP &lt; 5MB</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Upload progress */}
              {uploading && (
                <div className="space-y-2 p-4 bg-void brutal-border">
                  <div className="flex justify-between font-mono text-xs text-brand-yellow uppercase">
                    <span>UPLOADING_DATA...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-paper/10 h-2 brutal-border overflow-hidden">
                    <div
                      className="bg-brand-yellow h-2 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <DataLabel className="mb-3">STORED_ASSETS [{existingImages.length}]</DataLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImages.map((url) => (
                      <div key={url} className="relative group/img aspect-square brutal-border overflow-hidden bg-void">
                        <img src={url} alt="" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-2 right-2 w-8 h-8 brutal-border bg-brand-red text-paper flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <DataLabel className="mb-3">PENDING_ASSETS [{imagePreviews.length}]</DataLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group/img aspect-square brutal-border overflow-hidden bg-void">
                        <img src={src} alt="" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-2 right-2 w-8 h-8 brutal-border bg-brand-red text-paper flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity hover:scale-110"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length === 0 && imagePreviews.length === 0 && (
                <div className="py-8 text-center bg-void brutal-border opacity-50">
                  <Image className="w-10 h-10 text-paper/20 mx-auto mb-3" />
                  <p className="text-paper/20 font-mono text-xs uppercase tracking-widest">AWAITING_VISUALS</p>
                </div>
              )}
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="btn-brutal-red w-full flex items-center justify-center gap-4 text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-4 uppercase font-mono tracking-widest text-sm">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-void border-t-transparent" />
                  {uploading ? 'TRANSMITTING...' : 'COMMITTING_RECORD...'}
                </span>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  {isEdit ? 'UPDATE_RECORD' : 'COMMIT_NEW_RECORD'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PackageForm;
