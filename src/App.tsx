// ─── App.tsx — Root Router ─────────────────────────────────────────────────
// Defines all routes for the public site and admin dashboard

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// ── Lazy-loaded pages (code splitting for performance) ──────────────────────
const HomePage            = lazy(() => import('./pages/HomePage'));
const PackagesPage        = lazy(() => import('./pages/PackagesPage'));
const PackageDetailPage   = lazy(() => import('./pages/PackageDetailPage'));
const BookingPage         = lazy(() => import('./pages/BookingPage'));
const BookingSuccessPage  = lazy(() => import('./pages/BookingSuccessPage'));

// Admin pages
const AdminLogin      = lazy(() => import('./admin/AdminLogin'));
const AdminLayout     = lazy(() => import('./admin/AdminLayout'));
const Dashboard       = lazy(() => import('./admin/Dashboard'));
const PackagesManager = lazy(() => import('./admin/PackagesManager'));
const PackageForm     = lazy(() => import('./admin/PackageForm'));
const BookingsManager = lazy(() => import('./admin/BookingsManager'));
const CategoriesManager = lazy(() => import('./admin/CategoriesManager'));
const AdminSettings   = lazy(() => import('./admin/AdminSettings'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* ── Public Routes ───────────────────── */}
            <Route path="/"                   element={<HomePage />} />
            <Route path="/packages"           element={<PackagesPage />} />
            <Route path="/packages/:id"       element={<PackageDetailPage />} />
            <Route path="/book/:id"           element={<BookingPage />} />
            <Route path="/booking-success"    element={<BookingSuccessPage />} />

            {/* ── Admin Routes ────────────────────── */}
            <Route path="/admin/login"        element={<AdminLogin />} />

            {/* Protected admin area — requires Firebase Auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                {/* Redirect /admin → /admin/dashboard */}
                <Route path="/admin"                      element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard"            element={<Dashboard />} />
                <Route path="/admin/packages"             element={<PackagesManager />} />
                <Route path="/admin/packages/add"         element={<PackageForm />} />
                <Route path="/admin/packages/edit/:id"    element={<PackageForm />} />
                <Route path="/admin/bookings"             element={<BookingsManager />} />
                <Route path="/admin/categories"           element={<CategoriesManager />} />
                <Route path="/admin/settings"             element={<AdminSettings />} />
              </Route>
            </Route>

            {/* ── 404 fallback ────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global toast notifications */}
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
