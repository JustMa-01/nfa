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
  startDate: string;
  endDate: string;
  paymentMode: 'full' | 'advance' | 'request';
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
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({ defaultValues: { travelers: 2 } });

  const travelers = watch('travelers') || 2;
  const paymentMode = watch('paymentMode');
  
  const totalAmount = pkg ? pkg.price * Number(travelers) : 0;
  let amountToPay = 0;
  if (paymentMode === 'full') amountToPay = totalAmount;
  if (paymentMode === 'advance' && pkg?.advanceAmount) amountToPay = pkg.advanceAmount * Number(travelers);
  if (paymentMode === 'request') amountToPay = 0;

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
        
        // Output default payment mode
        if (data.allowFullPayment ?? true) setValue('paymentMode', 'full');
        else if (data.allowAdvancePayment) setValue('paymentMode', 'advance');
        else if (data.allowRequestBooking) setValue('paymentMode', 'request');
        
      } catch {
        toast.error('Failed to load package details.');
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate, setValue]);

  /**
   * Opens Razorpay checkout. On success, updates booking status to "Paid".
   */
  const initiatePayment = (bookingId: string, formData: BookingFormData, amount: number) => {
    if (!pkg) return;

    if (amount === 0) {
      toast.success('Booking requested successfully!');
      navigate('/booking-success', { state: { bookingId, packageTitle: pkg.title } });
      setProcessing(false);
      return;
    }

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
      amount: amount * 100, // Razorpay uses paise
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
        startDate: data.startDate,
        endDate: data.endDate,
        packageId: id,
        packageTitle: pkg.title,
        totalAmount,
        status: 'Pending',
        paymentMode: data.paymentMode,
        amountPaid: amountToPay,
      });

      // Then open Razorpay (or skip if amount is 0)
      initiatePayment(bookingId, data, amountToPay);
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
          <DataLabel className="text-brand-yellow mb-6">SECURE BOOKING</DataLabel>
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
                {/* Travelers + Date rows */}
                <div className="grid grid-cols-1 gap-8">
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

                  {pkg?.availableDates && pkg.availableDates.length > 0 ? (
                    <div className="flex flex-col gap-4 border-t-2 border-paper/10 pt-8 mt-4">
                      <DataLabel>SELECT_DEPARTURE_WINDOW *</DataLabel>
                      <div className="grid grid-cols-1 gap-4">
                        {pkg.availableDates.map((d, i) => {
                          const isSelected = watch('startDate') === d.startDate && watch('endDate') === d.endDate;
                          return (
                            <label 
                              key={i} 
                              className={`flex items-center gap-4 p-4 brutal-border cursor-pointer transition-colors ${
                                isSelected ? 'bg-brand-yellow text-void border-brand-yellow' : 'bg-void text-paper hover:border-brand-yellow'
                              }`}
                            >
                              <input 
                                type="radio" 
                                name="departureDates" 
                                className="hidden"
                                checked={isSelected}
                                onChange={() => {
                                  setValue('startDate', d.startDate, { shouldValidate: true });
                                  setValue('endDate', d.endDate, { shouldValidate: true });
                                }}
                              />
                              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between font-mono uppercase text-sm">
                                <span className={`${isSelected ? 'font-bold' : ''}`}>START // {d.startDate}</span>
                                <span className="opacity-50 hidden md:inline">➔</span>
                                <span className={`${isSelected ? 'font-bold' : ''}`}>END // {d.endDate}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      <input type="hidden" {...register('startDate', { required: 'Please select a departure window' })} />
                      <input type="hidden" {...register('endDate', { required: 'Please select a departure window' })} />
                      {(errors.startDate || errors.endDate) && (
                        <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                          <AlertCircle className="w-4 h-4" /> Please select a departure window
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-2">
                        <DataLabel>START_DATE *</DataLabel>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                          <input
                            {...register('startDate', { required: 'Date is required' })}
                            type="date"
                            min={minDate}
                            className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors cursor-pointer ${errors.startDate ? 'border-brand-red' : ''}`}
                          />
                        </div>
                        {errors.startDate && (
                          <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                            <AlertCircle className="w-4 h-4" /> {errors.startDate.message}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <DataLabel>END_DATE *</DataLabel>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-yellow" />
                          <input
                            {...register('endDate', { 
                              required: 'Date is required',
                              validate: (val) => !watch('startDate') || val >= watch('startDate') || 'End date must be after start date'
                            })}
                            type="date"
                            min={watch('startDate') || minDate}
                            className={`w-full bg-void text-paper font-mono p-4 pl-12 text-lg brutal-border focus:border-brand-yellow outline-none transition-colors cursor-pointer ${errors.endDate ? 'border-brand-red' : ''}`}
                          />
                        </div>
                        {errors.endDate && (
                          <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-2">
                            <AlertCircle className="w-4 h-4" /> {errors.endDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Options Row */}
                <div className="border-t-2 border-paper/10 pt-8 mt-8">
                  <DataLabel className="text-brand-yellow mb-4">PAYMENT_METHOD *</DataLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(pkg?.allowFullPayment ?? true) && (
                      <label className={`brutal-border p-4 cursor-pointer transition-colors group flex flex-col items-center justify-center text-center gap-2 ${paymentMode === 'full' ? 'bg-brand-yellow text-void' : 'bg-void text-paper hover:border-brand-yellow'}`}>
                        <input type="radio" value="full" {...register('paymentMode', { required: 'Select a payment mode' })} className="hidden" />
                        <span className="font-display uppercase">FULL_PAYMENT</span>
                        <span className="font-mono text-xs opacity-80">Pay ₹{totalAmount.toLocaleString('en-IN')} now</span>
                      </label>
                    )}
                    {pkg?.allowAdvancePayment && (
                      <label className={`brutal-border p-4 cursor-pointer transition-colors group flex flex-col items-center justify-center text-center gap-2 ${paymentMode === 'advance' ? 'bg-brand-yellow text-void' : 'bg-void text-paper hover:border-brand-yellow'}`}>
                        <input type="radio" value="advance" {...register('paymentMode', { required: 'Select a payment mode' })} className="hidden" />
                        <span className="font-display uppercase">ADVANCE_DEPLOY</span>
                        <span className="font-mono text-xs opacity-80">Pay ₹{(pkg.advanceAmount! * Number(travelers)).toLocaleString('en-IN')} now</span>
                      </label>
                    )}
                    {pkg?.allowRequestBooking && (
                      <label className={`brutal-border p-4 cursor-pointer transition-colors group flex flex-col items-center justify-center text-center gap-2 ${paymentMode === 'request' ? 'bg-brand-yellow text-void' : 'bg-void text-paper hover:border-brand-yellow'}`}>
                        <input type="radio" value="request" {...register('paymentMode', { required: 'Select a payment mode' })} className="hidden" />
                        <span className="font-display uppercase">REQUEST_ONLY</span>
                        <span className="font-mono text-xs opacity-80">Pay Later / Discuss</span>
                      </label>
                    )}
                  </div>
                  {errors.paymentMode && (
                    <p className="flex items-center gap-2 font-mono text-brand-red text-xs uppercase mt-3">
                      <AlertCircle className="w-4 h-4" /> {errors.paymentMode.message}
                    </p>
                  )}
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
                    {paymentMode === 'request' ? 'SUBMIT BOOKING REQUEST' : `MAKE PAYMENT // ₹${amountToPay.toLocaleString('en-IN')}`}
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
                {paymentMode === 'advance' && (
                  <div className="flex justify-between border-b border-paper/10 pb-2 text-paper/70">
                    <span className="text-brand-yellow">Advance_Per_Person</span>
                    <span className="text-brand-yellow">₹{pkg?.advanceAmount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-paper/10 pb-2 text-paper/70">
                  <span>Travelers_Count</span>
                  <span>× {travelers}</span>
                </div>
                <div className="flex justify-between pt-4 text-paper text-lg font-bold">
                  <span>{paymentMode === 'advance' ? 'DUE_NOW (ADVANCE)' : paymentMode === 'request' ? 'DUE_NOW' : 'TOTAL_AMOUNT'}</span>
                  <span className="text-brand-yellow">₹{amountToPay.toLocaleString('en-IN')}</span>
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
