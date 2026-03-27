// ─── Booking Page ─────────────────────────────────────────────────────────────
// Booking form with validation + Razorpay payment integration

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { User, Phone, Mail, Users, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import { BrutalNavbar, BrutalFooter, DataLabel } from '../components/SharedBrutal';
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
    <div className="min-h-screen bg-void text-paper selection:bg-brand-yellow selection:text-void">
      <BrutalNavbar />

      <div className="max-w-7xl mx-auto px-6 md:px-20 pt-32 pb-32">
        <div className="text-center mb-16">
          <DataLabel className="text-brand-yellow mb-6">SECURE_BOOKING_CHANNEL</DataLabel>
          <h1 className="text-6xl md:text-8xl font-display leading-none text-paper mb-4 uppercase">BOOK_YOUR<br/>TRIP.</h1>
          <p className="text-xl font-mono leading-relaxed opacity-70">
            {pkg?.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Form ─────────────────────────────────── */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
              <div className="bg-paper/5 brutal-border brutal-shadow p-8 md:p-10 space-y-8">
                <div className="border-b-2 border-paper/10 pb-4">
                  <DataLabel className="text-brand-red">TRAVELLER_DETAILS</DataLabel>
                </div>

                {/* Name */}
                <div className="flex flex-col gap-2">
                  <DataLabel>FULL_NAME *</DataLabel>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                    <input
                      {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                      placeholder="JOHN DOE"
                      className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${errors.name ? 'border-brand-red' : ''}`}
                    />
                  </div>
                  {errors.name && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <DataLabel>PHONE_NUMBER *</DataLabel>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                    <input
                      {...register('phone', {
                        required: 'Phone is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' },
                      })}
                      placeholder="9876543210"
                      type="tel"
                      className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${errors.phone ? 'border-brand-red' : ''}`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <DataLabel>EMAIL_ADDRESS *</DataLabel>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                      })}
                      placeholder="JOHN@EMAIL.COM"
                      type="email"
                      className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${errors.email ? 'border-brand-red' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                      <AlertCircle className="w-4 h-4" /> {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Travelers + Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2">
                    <DataLabel>NUMBER_OF_TRAVELERS *</DataLabel>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                      <input
                        {...register('travelers', {
                          required: 'Required',
                          min: { value: 1, message: 'At least 1 traveler' },
                          max: { value: 20, message: 'Max 20 travelers' },
                        })}
                        type="number"
                        min={1}
                        max={20}
                        className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors ${errors.travelers ? 'border-brand-red' : ''}`}
                      />
                    </div>
                    {errors.travelers && (
                      <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                        <AlertCircle className="w-4 h-4" /> {errors.travelers.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <DataLabel>TRAVEL_DATE *</DataLabel>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                      <input
                        {...register('travelDate', { required: 'Date is required' })}
                        type="date"
                        min={minDate}
                        className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors cursor-pointer ${errors.travelDate ? 'border-brand-red' : ''}`}
                      />
                    </div>
                    {errors.travelDate && (
                      <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                        <AlertCircle className="w-4 h-4" /> {errors.travelDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={processing}
                className="btn-brutal-red w-full flex items-center justify-center gap-4 text-xl py-6"
              >
                {processing ? (
                  <span className="flex items-center gap-4 uppercase font-mono">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-void border-t-transparent" />
                    PROCESSING...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    PROCEED_TO_PAY // ₹{totalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ── Order Summary ─────────────────────────── */}
          <div className="lg:col-span-4">
            <div className="bg-void brutal-border brutal-shadow p-8 sticky top-32">
              <div className="border-b-2 border-paper/10 pb-4 mb-6">
                <DataLabel className="text-brand-yellow">ORDER_SUMMARY</DataLabel>
              </div>

              {pkg?.images?.[0] && (
                <div className="aspect-video overflow-hidden brutal-border mb-6">
                  <img
                    src={pkg.images[0]}
                    alt={pkg.title}
                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              )}

              <h3 className="text-3xl font-display mb-6 text-paper uppercase leading-none">{pkg?.title}</h3>

              <div className="space-y-4 font-mono text-sm uppercase">
                <div className="flex justify-between border-b border-paper/10 pb-2 text-paper/70">
                  <span>Price_Per_Person</span>
                  <span>₹{pkg?.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-paper/10 pb-2 text-paper/70">
                  <span>Travelers_Count</span>
                  <span>× {travelers}</span>
                </div>
                <div className="flex justify-between pt-4 text-paper text-lg font-bold">
                  <span>TOTAL_AMOUNT</span>
                  <span className="text-brand-yellow">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-8 bg-paper/5 p-4 brutal-border">
                <DataLabel>SECURITY_NOTICE</DataLabel>
                <p className="font-mono text-xs opacity-60 leading-relaxed uppercase mt-2">
                  Encrypted transmission via Razorpay gateway. All coordinate data secured.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BrutalFooter />
    </div>
  );
};

export default BookingPage;
