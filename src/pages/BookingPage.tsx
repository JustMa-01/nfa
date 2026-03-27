// ─── Booking Page ─────────────────────────────────────────────────────────────
// Booking form with validation + Razorpay payment integration

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Users, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPackageById, createBooking, updateBookingStatus, type Package } from '../firebase/firestoreService';

// ── Razorpay types (loaded via CDN script in index.html) ──
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: { razorpay_payment_id: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}

// ── Form types ────────────────────────────────────────────
interface BookingFormData {
  name: string;
  phone: string;
  email: string;
  travelers: number;
  travelDate: string;
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({ defaultValues: { travelers: 2 } });

  const travelers = watch('travelers') || 2;
  const totalAmount = pkg ? pkg.price * Number(travelers) : 0;

  // Tomorrow as minimum travel date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getPackageById(id);
        if (!data) throw new Error('Package not found');
        setPkg(data);
      } catch {
        toast.error('Failed to load package details.');
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  /**
   * Opens Razorpay checkout. On success, updates booking status to "Paid".
   */
  const initiatePayment = (bookingId: string, formData: BookingFormData) => {
    if (!pkg) return;

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey || razorpayKey === 'your_razorpay_key_id') {
      // Demo mode — skip payment and mark as pending
      toast.info('Razorpay not configured. Booking saved as Pending.');
      navigate('/booking-success', { state: { bookingId, packageTitle: pkg.title } });
      setProcessing(false);
      return;
    }

    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: totalAmount * 100, // Razorpay uses paise
      currency: 'INR',
      name: 'No Fixed Address',
      description: pkg.title,
      handler: async (response) => {
        try {
          await updateBookingStatus(bookingId, 'Paid', response.razorpay_payment_id);
          toast.success('Payment successful!');
          navigate('/booking-success', { state: { bookingId, packageTitle: pkg.title } });
        } catch {
          toast.error('Payment recorded but status update failed. Contact us with Payment ID: ' + response.razorpay_payment_id);
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: '#f59e0b' },
      modal: {
        ondismiss: () => {
          toast.warn('Payment cancelled. Your booking is saved as Pending.');
          navigate('/booking-success', { state: { bookingId, packageTitle: pkg.title } });
          setProcessing(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!pkg || !id) return;
    setProcessing(true);
    try {
      // Save booking to Firestore first
      const bookingId = await createBooking({
        name: data.name,
        phone: data.phone,
        email: data.email,
        travelers: Number(data.travelers),
        travelDate: data.travelDate,
        packageId: id,
        packageTitle: pkg.title,
        totalAmount,
        status: 'Pending',
      });

      // Then open Razorpay
      initiatePayment(bookingId, data);
    } catch (err) {
      console.error('Booking error:', err);
      toast.error('Failed to create booking. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl font-bold text-white mb-2">Book Your Trip</h1>
          <p className="text-white/50">{pkg?.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">Traveller Details</h2>

                {/* Name */}
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                      placeholder="John Doe"
                      className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${errors.name ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                        }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                      })}
                      placeholder="9876543210"
                      type="tel"
                      className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${errors.phone ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                        }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/60 text-sm mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                      })}
                      placeholder="john@email.com"
                      type="email"
                      className={`w-full bg-slate-800 border text-white placeholder-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Travelers + Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Number of Travelers *</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        {...register('travelers', {
                          required: 'Required',
                          min: { value: 1, message: 'At least 1 traveler' },
                          max: { value: 20, message: 'Max 20 travelers' },
                        })}
                        type="number"
                        min={1}
                        max={20}
                        className={`w-full bg-slate-800 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors ${errors.travelers ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                          }`}
                      />
                    </div>
                    {errors.travelers && (
                      <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.travelers.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-1.5">Travel Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        {...register('travelDate', { required: 'Date is required' })}
                        type="date"
                        min={minDate}
                        className={`w-full bg-slate-800 border text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-colors cursor-pointer ${errors.travelDate ? 'border-red-500/50' : 'border-white/10 focus:border-amber-500/50'
                          }`}
                      />
                    </div>
                    {errors.travelDate && (
                      <p className="flex items-center gap-1 text-red-400 text-xs mt-1">
                        <AlertCircle className="w-3 h-3" /> {errors.travelDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25 text-base"
              >
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Pay ₹{totalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Order Summary ─────────────────────────── */}
          <div>
            <div className="bg-slate-900 rounded-2xl border border-white/10 p-6 sticky top-24">
              <h2 className="text-white font-semibold text-lg mb-5">Order Summary</h2>

              {pkg?.images?.[0] && (
                <img
                  src={pkg.images[0]}
                  alt={pkg.title}
                  className="w-full h-36 object-cover rounded-xl mb-4"
                />
              )}

              <h3 className="text-white font-medium mb-4">{pkg?.title}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/50">
                  <span>Price per person</span>
                  <span>₹{pkg?.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white/50">
                  <span>Travelers</span>
                  <span>× {travelers}</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-amber-400">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <p className="text-white/30 text-xs mt-4 leading-relaxed">
                🔒 Secure payment via Razorpay. Your details are encrypted and safe.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;
