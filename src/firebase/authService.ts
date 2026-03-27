// Firebase Authentication Service
// Wraps Firebase Auth methods for clean usage across the app

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign in an admin user with email and password
 */
export const signIn = async (email: string, password: string): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

/**
 * Sign up a new admin user with email and password
 */
export const signUp = async (email: string, password: string): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

/**
 * Sign out the currently authenticated user
 */
export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

/**
 * Subscribe to auth state changes
 * Returns the unsubscribe function
 */
export const onAuthChanged = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user synchronously
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
