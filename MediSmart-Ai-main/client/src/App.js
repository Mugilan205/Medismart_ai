import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import AuthProvider from './context/AuthProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/common/Spinner';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PharmacyLoginPage = lazy(() => import('./pages/PharmacyLoginPage'));
const PharmacyRegisterPage = lazy(() => import('./pages/PharmacyRegisterPage'));
const MedicinesPage = lazy(() => import('./pages/MedicinesPage'));
const MedicineDetailPage = lazy(() => import('./pages/MedicineDetailPage'));
const OrderNowPage = lazy(() => import('./pages/OrderNowPage'));
const UploadPrescriptionPage = lazy(() => import('./pages/UploadPrescriptionPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const MyDeliveriesPage = lazy(() => import('./pages/MyDeliveriesPage'));

const ChatPage = lazy(() => import('./pages/ChatPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PharmacyDashboardPage = lazy(() => import('./pages/dashboard/PharmacyDashboardPage'));
const DeliveryDashboardPage = lazy(() => import('./pages/dashboard/DeliveryDashboardPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true }}>
        <AuthProvider>
          <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Spinner size="lg" /></div>}>
            <Routes>
              {/* Authentication Routes - No Layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Pharmacy Authentication Routes - No Layout */}
              <Route path="/pharmacy/login" element={<PharmacyLoginPage />} />
              <Route path="/pharmacy/register" element={<PharmacyRegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Main Application Routes - With Layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="medicines" element={<MedicinesPage />} />
                <Route path="medicines/:id" element={<MedicineDetailPage />} />

                <Route path="upload-prescription" element={<UploadPrescriptionPage />} />

                {/* Protected Routes for Patients */}
                <Route element={<ProtectedRoute roles={['patient']} />}>
                  <Route path="order/now/:medicineId" element={<OrderNowPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="orders/:id" element={<OrderDetailPage />} />
                  <Route path="chat/:orderId" element={<ChatPage />} />
                </Route>

                {/* Protected Route for all authenticated users */}
                <Route element={<ProtectedRoute />}>
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                {/* Role-specific routes */}
                <Route element={<ProtectedRoute roles={['pharmacy']} />}>
                  <Route path="dashboard" element={<PharmacyDashboardPage />} />
                </Route>
                <Route element={<ProtectedRoute roles={['delivery_boy']} />}>
                  <Route path="delivery-dashboard" element={<DeliveryDashboardPage />} />
                  <Route path="my-deliveries" element={<MyDeliveriesPage />} />
                  <Route path="delivery/orders/:id" element={<OrderDetailPage />} />
                </Route>

                {/* Not Found Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster 
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#334155',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
