// ─── Admin Login Page ─────────────────────────────────────────────────────────
// Firebase email/password authentication for admin access

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { DataLabel } from '../components/SharedBrutal';
import { signIn } from '../firebase/authService';

interface LoginFormData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      toast.error(msg.includes('wrong-password') || msg.includes('user-not-found')
        ? 'Invalid email or password'
        : 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <DataLabel className="text-brand-red mb-4">ADMIN ACCESS</DataLabel>
          <h1 className="text-6xl font-display leading-none mb-4 text-paper">RESTRICTED<br/>AREA</h1>
          <p className="font-mono text-sm uppercase opacity-50 tracking-widest text-brand-yellow"><span className="text-brand-red">▲</span> AUTHORIZED PERSONNEL ONLY</p>
        </div>

        <div className="bg-paper/5 p-8 md:p-10 brutal-border brutal-shadow">
          <h2 className="font-mono text-xl uppercase tracking-widest mb-8 text-brand-yellow border-b-2 border-brand-yellow/30 pb-4">AUTHENTICATE</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label className="block font-mono text-xs uppercase opacity-70 mb-2 mt-4 text-paper">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                  type="email"
                  placeholder="ADMIN@NOFIXEDADDRESS.IN"
                  className={`w-full bg-void text-paper p-4 pl-12 font-mono text-lg brutal-border outline-none transition-colors focus:border-brand-yellow placeholder:opacity-50 ${
                    errors.email ? 'border-brand-red' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-brand-red font-mono text-[10px] mt-2 uppercase">
                  <AlertCircle className="w-3 h-3" /> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-xs uppercase opacity-70 mb-2 mt-4 text-paper">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                <input
                  {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-void text-paper p-4 pl-12 font-mono text-lg brutal-border outline-none transition-colors focus:border-brand-yellow placeholder:opacity-50 ${
                    errors.password ? 'border-brand-red' : ''
                  }`}
                />
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-brand-red font-mono text-[10px] mt-2 uppercase">
                  <AlertCircle className="w-3 h-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brutal w-full py-5 text-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <LoaderSpinner />
                  PROCESSING...
                </span>
              ) : 'LOG IN'}
            </button>

            {/* Quick Demo Creation Button */}
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                try {
                  const { signUp } = await import('../firebase/authService');
                  await signUp('admin@demo.com', 'password123');
                  toast.success('Demo admin created! You can now sign in.');
                } catch (err: any) {
                  if (err.message.includes('email-already-in-use')) {
                    toast.info('DEMO ADMIN // PROCEED TO LOGIN');
                  } else {
                    toast.error(err.message);
                  }
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 bg-void hover:bg-paper/10 brutal-border text-paper font-mono uppercase tracking-widest text-xs py-4 transition-all duration-200 mt-6"
            >
              CREATE DEMO ADMIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Extracted a small inline loader
const LoaderSpinner = () => (
  <svg className="animate-spin h-5 w-5 mr-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647Z"></path>
  </svg>
);

export default AdminLogin;
