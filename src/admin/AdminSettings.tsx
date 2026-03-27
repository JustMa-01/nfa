// ─── Admin Settings ───────────────────────────────────────────────────────────
// Manage website contact info stored in Firestore "settings/main"

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter, Save, AlertCircle, Loader2 } from 'lucide-react';
import { getSettings, updateSettings, type SiteSettings } from '../firebase/firestoreService';
import { DataLabel } from '../components/SharedBrutal';

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
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-brand-yellow animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <DataLabel className="text-brand-yellow mb-2">SYSTEM_CONFIGURATION</DataLabel>
        <h1 className="text-paper font-display text-5xl uppercase">SETTINGS.</h1>
        <p className="font-mono text-paper/50 text-sm mt-4 uppercase">Manage internal communications and social beacons.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
        {/* Contact Info */}
        <div className="bg-paper/5 brutal-border brutal-shadow p-8 lg:p-10 space-y-8">
          <div className="border-b-2 border-paper/10 pb-4">
            <h2 className="text-brand-red font-display text-3xl uppercase flex items-center gap-4">
              <Phone className="w-8 h-8" />
              CONTACT_INFO
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <DataLabel>PHONE_NUMBER *</DataLabel>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                <input
                  {...register('phone', { required: 'Phone is required' })}
                  placeholder="+91 70000 00000"
                  className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${
                    errors.phone ? 'border-brand-red' : ''
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                  <AlertCircle className="w-4 h-4" /> {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <DataLabel>EMAIL_ADDRESS *</DataLabel>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="HELLO@NOFIXEDADDRESS.IN"
                  className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase ${
                    errors.email ? 'border-brand-red' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                  <AlertCircle className="w-4 h-4" /> {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <DataLabel>BASE_COORDINATES (ADDRESS)</DataLabel>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-brand-yellow" />
                <textarea
                  {...register('address')}
                  placeholder="123, TRAVEL STREET, MUMBAI..."
                  rows={4}
                  className="w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-paper/5 brutal-border brutal-shadow p-8 lg:p-10 space-y-8">
          <div className="border-b-2 border-paper/10 pb-4">
            <h2 className="text-brand-yellow font-display text-3xl uppercase flex items-center gap-4">
              COMMUNITY_FREQUENCY
            </h2>
          </div>

          <div className="space-y-6">
            {[
              { field: 'instagram' as const, icon: Instagram, placeholder: 'HTTPS://INSTAGRAM.COM/NOFIXEDADDRESS' },
              { field: 'facebook' as const, icon: Facebook, placeholder: 'HTTPS://FACEBOOK.COM/NOFIXEDADDRESS' },
              { field: 'twitter' as const, icon: Twitter, placeholder: 'HTTPS://TWITTER.COM/NOFIXEDADDRESS' },
            ].map(({ field, icon: Icon, placeholder }) => (
              <div className="flex flex-col gap-2" key={field}>
                <DataLabel>{field}</DataLabel>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                  <input
                    {...register(field)}
                    type="url"
                    placeholder={placeholder}
                    className="w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors uppercase"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !isDirty}
          className="btn-brutal-red w-full flex items-center justify-center gap-4 text-xl py-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center gap-4 uppercase font-mono">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-void border-t-transparent" />
              UPDATING_PROTOCOLS...
            </span>
          ) : (
            <>
              <Save className="w-6 h-6" />
              COMMIT_CHANGES
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
