// Firestore Database Service
// CRUD helpers for packages, bookings, and settings collections

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Package {
  id?: string;
  title: string;
  price: number;
  description: string;
  itinerary: string[];   // Day-wise text array
  images: string[];      // Firebase Storage URLs
  duration: string;      // e.g. "7 Days / 6 Nights"
  category: string;      // e.g. "Beach", "Mountain", "Cultural"
  featured: boolean;
  createdAt?: unknown;
}

export interface Booking {
  id?: string;
  name: string;
  phone: string;
  email: string;
  travelers: number;
  travelDate: string;
  packageId: string;
  packageTitle?: string;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Cancelled';
  razorpayPaymentId?: string;
  createdAt?: unknown;
}

export interface SiteSettings {
  id?: string;
  phone: string;
  email: string;
  address: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const docToData = <T>(snap: QueryDocumentSnapshot<DocumentData>): T => ({
  id: snap.id,
  ...snap.data(),
}) as T;

// ─── Package Services ─────────────────────────────────────────────────────────

export const getPackages = async (): Promise<Package[]> => {
  const q = query(collection(db, 'packages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Package>(d));
};

export const getPackageById = async (id: string): Promise<Package | null> => {
  const snap = await getDoc(doc(db, 'packages', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Package;
};

export const addPackage = async (data: Omit<Package, 'id' | 'createdAt'>): Promise<string> => {
  const ref = await addDoc(collection(db, 'packages'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updatePackage = async (id: string, data: Partial<Package>): Promise<void> => {
  await updateDoc(doc(db, 'packages', id), { ...data });
};

export const deletePackage = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'packages', id));
};

// ─── Booking Services ─────────────────────────────────────────────────────────

export const createBooking = async (
  data: Omit<Booking, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getAllBookings = async (): Promise<Booking[]> => {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToData<Booking>(d));
};

export const updateBookingStatus = async (
  id: string,
  status: Booking['status'],
  razorpayPaymentId?: string
): Promise<void> => {
  const updates: { status: string; razorpayPaymentId?: string } = { status };
  if (razorpayPaymentId) updates.razorpayPaymentId = razorpayPaymentId;
  await updateDoc(doc(db, 'bookings', id), updates);
};

// ─── Settings Services ────────────────────────────────────────────────────────

export const getSettings = async (): Promise<SiteSettings> => {
  const snap = await getDoc(doc(db, 'settings', 'main'));
  if (!snap.exists()) {
    // Return defaults if not set yet
    return { phone: '', email: '', address: '' };
  }
  return { id: snap.id, ...snap.data() } as SiteSettings;
};

export const updateSettings = async (data: Omit<SiteSettings, 'id'>): Promise<void> => {
  await updateDoc(doc(db, 'settings', 'main'), { ...data });
};
