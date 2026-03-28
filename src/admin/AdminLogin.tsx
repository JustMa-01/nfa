import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, Lock, ShieldCheck, Navigation, Loader2 } from 'lucide-react';
import { StampedLabel } from '../components/SharedBrutal';
import { signIn } from '../firebase/authService';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('ACCESS_GRANTED');
      navigate('/admin/dashboard');
    } catch (err: any) {
      toast.error('INVALID_CREDENTIALS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-void selection:bg-brand-yellow flex items-center justify-center px-6 grain-texture">
      <div className="w-full max-w-md">
        {/* HQ Stamp */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-void text-brand-yellow flex items-center justify-center mx-auto mb-6 border-4 border-brand-yellow rotate-3 shadow-xl">
            <Navigation size={40} className="fill-brand-yellow" />
          </div>
          <StampedLabel className="border-void/20 text-void/60 mb-2">SYSTEM_OPERATOR_ACCESS</StampedLabel>
          <h1 className="text-5xl font-display font-black tracking-tighter uppercase">NFA_HQ.</h1>
        </div>

        <div className="thick-border bg-paper p-8 md:p-10 shadow-[16px_16px_0px_0px_rgba(17,17,17,1)] relative overflow-hidden">
          {/* Decorative Corner Label */}
          <div className="absolute top-0 right-0 bg-brand-red text-paper px-3 py-1 font-mono text-[8px] font-black uppercase">
            RESTRICTED_NODE
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black opacity-40 uppercase tracking-widest">OPERATOR_ID (EMAIL)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-yellow" />
                <input
                  {...register('email', { required: true })}
                  type="email"
                  placeholder="ADMIN@NETWORK.COM"
                  className="w-full bg-paper border-4 border-void p-4 pl-12 font-mono text-xs outline-none focus:ring-4 ring-brand-yellow/20 uppercase"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black opacity-40 uppercase tracking-widest">ACCESS_KEY (PASSWORD)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-yellow" />
                <input
                  {...register('password', { required: true })}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-paper border-4 border-void p-4 pl-12 font-mono text-xs outline-none focus:ring-4 ring-brand-yellow/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-void text-paper font-mono font-black text-xs tracking-widest hover:bg-brand-yellow hover:text-void transition-all flex items-center justify-center gap-4"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'AUTHORIZE_SESSION ➔'}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t-2 border-void/5 flex items-start gap-3">
            <ShieldCheck className="text-brand-red shrink-0" size={16} />
            <p className="font-mono text-[8px] opacity-40 uppercase leading-relaxed">
              By initiating authorization, you confirm compliance with nomadic heritage protocols and internal data security standards.
            </p>
          </div>
        </div>

        {/* Quick Demo Help (Optional - Remove for Prod) */}
        <p className="text-center mt-8 font-mono text-[10px] opacity-30 uppercase tracking-widest">
          NODE: LOCALHOST // STATUS: UNSECURE
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;