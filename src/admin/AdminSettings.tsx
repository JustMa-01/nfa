// ─── Admin Settings ───────────────────────────────────────────────────────────
// Manage website contact info stored in Firestore "settings/main"

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Save, AlertCircle } from 'lucide-react';
import { getSettings, updateSettings, type SiteSettings } from '../firebase/firestoreService';

type SettingsFormData = Omit<SiteSettings, 'id'>;

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormData>();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSettings();
        reset({
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          twitter: data.twitter || '',
        });
      } catch {
        toast.error('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      await updateSettings(data);
      toast.success('Settings saved successfully!');
      reset(data); // Reset dirty state after save
    } catch (err) {
      console.error('Settings save error:', err);
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-white font-bold text-2xl">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your website contact information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Contact Info */}
        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-5">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500" />
            Contact Information
          </h2>

          <div>
            <label className="block text-white/60 text-sm mb-1.5">Phone Number *</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                {...register('phone', { required: 'Phone is required' })}
                placeholder="+91 70000 00000"
                className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                  errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                type="email"
                placeholder="hello@nofixedaddress.in"
                className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${
                  errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                }`}
              />
            </div>
            {errors.email && (
              <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-1.5">Office Address</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-white/30" />
              <textarea
                {...register('address')}
                placeholder="123, Travel Street, Mumbai, Maharashtra - 400001"
                rows={3}
                className="w-full bg-slate-800 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-slate-900 rounded-2xl border border-white/5 p-6 space-y-5">
          <h2 className="text-white font-semibold">Social Media Links</h2>

          {[
            { field: 'instagram' as const, icon: Instagram, placeholder: 'https://instagram.com/nofixedaddress' },
            { field: 'facebook' as const, icon: Facebook, placeholder: 'https://facebook.com/nofixedaddress' },
            { field: 'twitter' as const, icon: Twitter, placeholder: 'https://twitter.com/nofixedaddress' },
          ].map(({ field, icon: Icon, placeholder }) => (
            <div key={field}>
              <label className="block text-white/60 text-sm mb-1.5 capitalize">{field}</label>
              <div className="relative">
                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  {...register(field)}
                  type="url"
                  placeholder={placeholder}
                  className="w-full bg-slate-800 border border-white/10 text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving || !isDirty}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
              Saving...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
