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
  getPackageById, addPackage, updatePackage, getSettings, type Package
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
  locationsStart: string;
  locationsEnd: string;
  allowFullPayment: boolean;
  allowAdvancePayment: boolean;
  advanceAmount: number;
  allowRequestBooking: boolean;
}


const PackageForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [itinerary, setItinerary] = useState<string[]>(['']);
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [included, setIncluded] = useState<string[]>(['']);
  const [notIncluded, setNotIncluded] = useState<string[]>(['']);
  const [optionalActivities, setOptionalActivities] = useState<string[]>(['']);
  const [availableDates, setAvailableDates] = useState<{ startDate: string; endDate: string }[]>([]);

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadingPackage, setLoadingPackage] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const {
    register, handleSubmit, reset, watch, formState: { errors }
  } = useForm<PackageFormData>({
    defaultValues: {
      allowFullPayment: true,
      allowAdvancePayment: false,
      allowRequestBooking: false,
      advanceAmount: 0,
    }
  });

  const allowAdvancePayment = watch('allowAdvancePayment');

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const settings = await getSettings();
        setAvailableCategories(settings.categories || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

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
          locationsStart: pkg.locations?.start || '',
          locationsEnd: pkg.locations?.end || '',
          allowFullPayment: pkg.allowFullPayment ?? true,
          allowAdvancePayment: pkg.allowAdvancePayment ?? false,
          advanceAmount: pkg.advanceAmount || 0,
          allowRequestBooking: pkg.allowRequestBooking ?? false,
        });
        setItinerary(pkg.itinerary?.length ? pkg.itinerary : ['']);
        setHighlights(pkg.highlights?.length ? pkg.highlights : ['']);
        setIncluded(pkg.included?.length ? pkg.included : ['']);
        setNotIncluded(pkg.notIncluded?.length ? pkg.notIncluded : ['']);
        setOptionalActivities(pkg.optionalActivities?.length ? pkg.optionalActivities : ['']);
        setAvailableDates(pkg.availableDates || []);
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

  // ── Dynamic Lists handling ───────────────────────────────────
  const updateList = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) => {
    setter((prev) => prev.map((item, i) => (i === idx ? val : item)));
  };
  const addToList = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, '']);
  };
  const removeFromList = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit ───────────────────────────────────────────────
  const onSubmit = async (data: PackageFormData) => {
    // Validate itinerary has at least 1 non-empty entry
    const validItinerary = itinerary.filter((d) => d.trim().length > 0);
    if (validItinerary.length === 0) {
      toast.error('MISSING_ITINERARY_DATA');
      return;
    }

    const validHighlights = highlights.filter((h) => h.trim().length > 0);
    const validIncluded = included.filter((i) => i.trim().length > 0);
    const validNotIncluded = notIncluded.filter((n) => n.trim().length > 0);
    const validOptionalActivities = optionalActivities.filter((o) => o.trim().length > 0);

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
        locations: { start: data.locationsStart, end: data.locationsEnd },
        highlights: validHighlights,
        included: validIncluded,
        notIncluded: validNotIncluded,
        optionalActivities: validOptionalActivities,
        itinerary: validItinerary,
        availableDates: availableDates.filter((d) => d.startDate && d.endDate),
        images: allImageUrls,
        allowFullPayment: data.allowFullPayment,
        allowAdvancePayment: data.allowAdvancePayment,
        advanceAmount: Number(data.advanceAmount) || 0,
        allowRequestBooking: data.allowRequestBooking,
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

  const renderDynamicList = (title: string, state: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, placeholder: string) => (
    <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-paper/10 pb-4 mb-6">
        <h2 className="text-brand-yellow font-display text-2xl uppercase">{title}</h2>
        <button type="button" onClick={() => addToList(setter)} className="btn-brutal py-2 px-4 text-xs font-mono">
          [+] ADD ITEM
        </button>
      </div>
      <div className="space-y-4">
        {state.map((item, i) => (
          <div key={i} className="flex gap-4 items-start bg-void p-4 brutal-border">
            <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow brutal-border flex items-center justify-center -rotate-3">
              <span className="text-void font-display text-xl">{i + 1}</span>
            </div>
            <textarea
              value={item}
              onChange={(e) => updateList(setter, i, e.target.value)}
              placeholder={`${placeholder}_${i + 1}...`}
              rows={2}
              className="flex-1 bg-transparent text-paper font-mono text-sm outline-none resize-none placeholder:text-paper/20 uppercase"
            />
            {state.length > 1 && (
              <button
                type="button"
                onClick={() => removeFromList(setter, i)}
                className="flex-shrink-0 p-2 brutal-border text-brand-red hover:bg-brand-red hover:text-paper transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDatesList = () => (
    <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-paper/10 pb-4 mb-6">
        <h2 className="text-brand-yellow font-display text-2xl uppercase">AVAILABLE DEPARTURES</h2>
        <button type="button" onClick={() => setAvailableDates((p) => [...p, { startDate: '', endDate: '' }])} className="btn-brutal py-2 px-4 text-xs font-mono">
          [+] ADD DEPARTURE
        </button>
      </div>
      <div className="space-y-4">
        {availableDates.map((item, i) => (
          <div key={i} className="flex flex-wrap sm:flex-nowrap gap-4 items-center bg-void p-4 brutal-border">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-yellow brutal-border flex items-center justify-center -rotate-3">
              <span className="text-void font-display text-lg">{i + 1}</span>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-paper/50 text-[10px] font-mono tracking-widest uppercase">START DATE</span>
                <input
                  type="date"
                  value={item.startDate}
                  onChange={(e) => setAvailableDates((p) => p.map((d, idx) => (idx === i ? { ...d, startDate: e.target.value } : d)))}
                  className="w-full bg-transparent text-paper font-mono text-sm outline-none brutal-border p-2 focus:border-brand-yellow transition-colors cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-paper/50 text-[10px] font-mono tracking-widest uppercase">END DATE</span>
                <input
                  type="date"
                  value={item.endDate}
                  onChange={(e) => setAvailableDates((p) => p.map((d, idx) => (idx === i ? { ...d, endDate: e.target.value } : d)))}
                  className="w-full bg-transparent text-paper font-mono text-sm outline-none brutal-border p-2 focus:border-brand-yellow transition-colors cursor-pointer"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => setAvailableDates((p) => p.filter((_, idx) => idx !== i))}
              className="flex-shrink-0 p-2 brutal-border text-brand-red hover:bg-brand-red hover:text-paper transition-colors mt-2 sm:mt-0"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {availableDates.length === 0 && (
          <div className="p-4 bg-void brutal-border border-dashed opacity-50">
            <p className="text-paper font-mono text-xs uppercase tracking-widest">NO FIXED DEPARTURES. USERS CAN SELECT ANY DATES DURING BOOKING.</p>
          </div>
        )}
      </div>
    </div>
  );

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
                <h2 className="text-brand-red font-display text-2xl uppercase">BASIC DETAILS</h2>
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
                  <DataLabel>PRICE (₹) *</DataLabel>
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
                  <DataLabel>DURATION</DataLabel>
                  <input
                    {...register('duration')}
                    placeholder="5_DAYS_4_NIGHTS"
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Locations row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col gap-2">
                  <DataLabel>START_LOCATION</DataLabel>
                  <input
                    {...register('locationsStart')}
                    placeholder="e.g. VENICE"
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <DataLabel>END_LOCATION</DataLabel>
                  <input
                    {...register('locationsEnd')}
                    placeholder="e.g. SPLIT"
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase"
                  />
                </div>
              </div>

              {/* Category + Featured row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <DataLabel>CATEGORY</DataLabel>
                  <select
                    {...register('category')}
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase cursor-pointer"
                  >
                    <option value="">SELECT_CATEGORY</option>
                    {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
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

            {/* PAYMENT CONFIGURATION */}
            <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-paper/10 pb-4 mb-6">
                <h2 className="text-brand-yellow font-display text-2xl uppercase">PAYMENT OPTIONS</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Full Payment Toggle */}
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 brutal-border bg-void group-hover:border-brand-yellow transition-colors">
                    <input type="checkbox" {...register('allowFullPayment')} className="peer appearance-none w-full h-full cursor-pointer" />
                    <div className="absolute inset-1 bg-brand-yellow scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="font-mono text-paper text-sm uppercase group-hover:text-brand-yellow transition-colors">FULL_PAYMENT</span>
                </label>

                {/* Advance Booking Toggle */}
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 brutal-border bg-void group-hover:border-brand-yellow transition-colors">
                    <input type="checkbox" {...register('allowAdvancePayment')} className="peer appearance-none w-full h-full cursor-pointer" />
                    <div className="absolute inset-1 bg-brand-yellow scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="font-mono text-paper text-sm uppercase group-hover:text-brand-yellow transition-colors">ADVANCE_PAYMENT</span>
                </label>
                
                {/* Request Booking Toggle */}
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6 brutal-border bg-void group-hover:border-brand-yellow transition-colors">
                    <input type="checkbox" {...register('allowRequestBooking')} className="peer appearance-none w-full h-full cursor-pointer" />
                    <div className="absolute inset-1 bg-brand-yellow scale-0 peer-checked:scale-100 transition-transform" />
                  </div>
                  <span className="font-mono text-paper text-sm uppercase group-hover:text-brand-yellow transition-colors">REQUEST_BOOKING</span>
                </label>
              </div>

              {allowAdvancePayment && (
                <div className="flex flex-col gap-2 mt-6 pt-6 border-t border-paper/10">
                  <DataLabel>ADVANCE AMOUNT (₹) PER PERSON *</DataLabel>
                  <input
                    {...register('advanceAmount', { valueAsNumber: true, min: { value: 0, message: 'Must be positive' } })}
                    type="number"
                    min={0}
                    placeholder="e.g. 5000"
                    className="w-full bg-void text-paper font-mono p-4 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors max-w-sm"
                  />
                  {errors.advanceAmount && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.advanceAmount.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Lists */}
            {renderDatesList()}
            {renderDynamicList('ITINERARY', itinerary, setItinerary, 'DAY_LOG')}
            {renderDynamicList('TRIP_HIGHLIGHTS', highlights, setHighlights, 'HIGHLIGHT')}
            {renderDynamicList('WHAT_IS_INCLUDED', included, setIncluded, 'INCLUSION')}
            {renderDynamicList('WHAT_IS_NOT_INCLUDED', notIncluded, setNotIncluded, 'EXCLUSION')}
            {renderDynamicList('OPTIONAL_ACTIVITIES', optionalActivities, setOptionalActivities, 'ACTIVITY')}
          </div>

          {/* ── Right: Images ──────────────────────── */}
          <div className="space-y-8">
            <div className="bg-paper/5 brutal-border brutal-shadow p-6 md:p-8 space-y-6">
              <div className="border-b-2 border-paper/10 pb-4 mb-6">
                <h2 className="text-paper font-display text-2xl uppercase">IMAGES</h2>
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
                  <DataLabel className="mb-3">CURRENT IMAGES [{existingImages.length}]</DataLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {existingImages.map((url) => (
                      <div key={url} className="relative group/img aspect-square brutal-border overflow-hidden bg-void">
                        <img src={url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" />
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
                  <DataLabel className="mb-3">NEW IMAGES [{imagePreviews.length}]</DataLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group/img aspect-square brutal-border overflow-hidden bg-void">
                        <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all" />
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
                  {uploading ? 'UPLOADING...' : 'SAVING...'}
                </span>
              ) : (
                <>
                  <Save size={20} />
                  {isEdit ? 'UPDATE PACKAGE' : 'SAVE NEW PACKAGE'}
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
