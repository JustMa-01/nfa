// ─── Package Form (Add / Edit) ────────────────────────────────────────────────
// Handles both creating new packages and editing existing ones
// Supports multi-image upload to Firebase Storage with preview

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  Plus, Trash2, Upload, X, Image, AlertCircle, ArrowLeft, Save
} from 'lucide-react';
import {
  getPackageById, addPackage, updatePackage, type Package
} from '../firebase/firestoreService';
import { uploadImages } from '../firebase/storageService';

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
        if (!pkg) { toast.error('Package not found'); navigate('/admin/packages'); return; }
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
        toast.error('Failed to load package.');
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
    if (totalImages > 8) { toast.warn('Maximum 8 images allowed.'); return; }

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
      toast.error('Please add at least one itinerary day.');
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
        toast.success('Package updated successfully!');
      } else {
        await addPackage(packageData);
        toast.success('Package added successfully!');
      }
      navigate('/admin/packages');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Failed to save package. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (loadingPackage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/packages')}
          className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white font-bold text-2xl">{isEdit ? 'Edit Package' : 'Add New Package'}</h1>
          <p className="text-white/40 text-sm">{isEdit ? 'Update package details' : 'Create a new travel package'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Main fields ─────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-5">
              <h2 className="text-white font-semibold">Package Details</h2>

              {/* Title */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Title *</label>
                <input
                  {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Too short' } })}
                  placeholder="e.g. Goa Beach Paradise — 5 Days"
                  className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                    errors.title ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                />
                {errors.title && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Description *</label>
                <textarea
                  {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                  placeholder="Describe this package..."
                  rows={4}
                  className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors resize-none ${
                    errors.description ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                  }`}
                />
                {errors.description && (
                  <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                    <AlertCircle className="w-3 h-3" /> {errors.description.message}
                  </p>
                )}
              </div>

              {/* Price + Duration row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Price (₹) *</label>
                  <input
                    {...register('price', {
                      required: 'Price is required',
                      min: { value: 1, message: 'Must be > 0' },
                    })}
                    type="number"
                    min={0}
                    placeholder="25000"
                    className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors ${
                      errors.price ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                    }`}
                  />
                  {errors.price && (
                    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Duration</label>
                  <input
                    {...register('duration')}
                    placeholder="5 Days / 4 Nights"
                    className="w-full bg-slate-800 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Category + Featured row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Category</label>
                  <select
                    {...register('category')}
                    className="w-full bg-slate-800 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('featured')}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-white/60 text-sm">Featured on homepage</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold">Day-wise Itinerary</h2>
                <button
                  type="button"
                  onClick={addDay}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Day
                </button>
              </div>

              <div className="space-y-3">
                {itinerary.map((day, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-2.5">
                      <span className="text-amber-400 text-xs font-bold">{i + 1}</span>
                    </div>
                    <textarea
                      value={day}
                      onChange={(e) => updateDay(i, e.target.value)}
                      placeholder={`Day ${i + 1}: Describe activities...`}
                      rows={2}
                      className="flex-1 bg-slate-800 border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(i)}
                        className="mt-2.5 p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Images ──────────────────────── */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-4">
              <h2 className="text-white font-semibold">Images</h2>
              <p className="text-white/40 text-xs">Upload up to 8 images. First image = cover photo.</p>

              {/* Upload button */}
              <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-xl cursor-pointer transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                  <Upload className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium">Click to upload</p>
                  <p className="text-white/30 text-xs mt-1">JPG, PNG, WebP — Max 5MB each</p>
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
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Uploading images...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-2">Existing ({existingImages.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {existingImages.map((url) => (
                      <div key={url} className="relative group/img aspect-square rounded-lg overflow-hidden bg-slate-800">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New image previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs mb-2">New uploads ({imagePreviews.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group/img aspect-square rounded-lg overflow-hidden bg-slate-800">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length === 0 && imagePreviews.length === 0 && (
                <div className="py-4 text-center">
                  <Image className="w-8 h-8 text-white/10 mx-auto mb-2" />
                  <p className="text-white/20 text-xs">No images yet</p>
                </div>
              )}
            </div>

            {/* Save button */}
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </span>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEdit ? 'Update Package' : 'Create Package'}
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
