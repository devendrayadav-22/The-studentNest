import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Lazy loaded public pages
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const NotFound = lazy(() => import('../pages/NotFound'));
const PgList = lazy(() => import('../pages/pg/PgList'));
const PgDetail = lazy(() => import('../pages/pg/PgDetail'));
const MessList = lazy(() => import('../pages/mess/MessList'));
const MessDetail = lazy(() => import('../pages/mess/MessDetail'));

// Lazy loaded student dashboard pages
const StudentOverview = lazy(() => import('../pages/student/Overview'));
const StudentWishlist = lazy(() => import('../pages/student/Wishlist'));
const StudentCompare = lazy(() => import('../pages/student/Compare'));
const StudentInquiries = lazy(() => import('../pages/student/Inquiries'));
const StudentReviews = lazy(() => import('../pages/student/Reviews'));
const StudentProfile = lazy(() => import('../pages/student/Profile'));

// Lazy loaded PG owner dashboard pages
const OwnerOverview = lazy(() => import('../pages/owner/Overview'));
const MyListings = lazy(() => import('../pages/owner/MyListings'));
const ListingEditor = lazy(() => import('../pages/owner/ListingEditor'));
const OwnerInquiries = lazy(() => import('../pages/owner/Inquiries'));
const OwnerReviews = lazy(() => import('../pages/owner/Reviews'));
const OwnerProfile = lazy(() => import('../pages/owner/Profile'));

// Lazy loaded Mess owner dashboard pages
const MessOwnerOverview = lazy(() => import('../pages/messOwner/Overview'));
const MessProfileEditor = lazy(() => import('../pages/messOwner/MessProfileEditor'));
const MenuManager = lazy(() => import('../pages/messOwner/MenuManager'));
const MessOwnerInquiries = lazy(() => import('../pages/messOwner/Inquiries'));
const MessOwnerReviews = lazy(() => import('../pages/messOwner/Reviews'));

// Lazy loaded Admin dashboard pages
const AdminOverview = lazy(() => import('../pages/admin/Overview'));
const PendingApprovals = lazy(() => import('../pages/admin/PendingApprovals'));
const AllListings = lazy(() => import('../pages/admin/AllListings'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const ReviewModeration = lazy(() => import('../pages/admin/ReviewModeration'));
const AdminReports = lazy(() => import('../pages/admin/Reports'));
const AdminAnnouncements = lazy(() => import('../pages/admin/Announcements'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs font-semibold text-slate-500">Loading content...</span>
  </div>
);

const PgRouteGuard = ({ children }) => {
  const { role, isAuthenticated } = useAuth();
  if (isAuthenticated && role === 'MESS_OWNER') {
    return <Navigate to="/mess" replace />;
  }
  return children;
};

const MessRouteGuard = ({ children }) => {
  const { role, isAuthenticated } = useAuth();
  if (isAuthenticated && role === 'PG_OWNER') {
    return <Navigate to="/owner" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Website Routes inside MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pgs" element={<PgRouteGuard><PgList /></PgRouteGuard>} />
          <Route path="/pgs/:id" element={<PgRouteGuard><PgDetail /></PgRouteGuard>} />
          <Route path="/messes" element={<MessRouteGuard><MessList /></MessRouteGuard>} />
          <Route path="/messes/:id" element={<MessRouteGuard><MessDetail /></MessRouteGuard>} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentOverview />} />
          <Route path="wishlist" element={<StudentWishlist />} />
          <Route path="compare" element={<StudentCompare />} />
          <Route path="inquiries" element={<StudentInquiries />} />
          <Route path="reviews" element={<StudentReviews />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </Route>

        {/* PG Owner Dashboard Routes */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['PG_OWNER', 'ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<OwnerOverview />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="listings/new" element={<ListingEditor />} />
          <Route path="listings/:id/edit" element={<ListingEditor />} />
          <Route path="inquiries" element={<OwnerInquiries />} />
          <Route path="reviews" element={<OwnerReviews />} />
          <Route path="profile" element={<OwnerProfile />} />
          <Route path="*" element={<Navigate to="/owner" replace />} />
        </Route>

        {/* Mess Owner Dashboard Routes */}
        <Route
          path="/mess"
          element={
            <ProtectedRoute allowedRoles={['MESS_OWNER', 'ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MessOwnerOverview />} />
          <Route path="profile" element={<MessProfileEditor />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="inquiries" element={<MessOwnerInquiries />} />
          <Route path="reviews" element={<MessOwnerReviews />} />
          <Route path="account" element={<OwnerProfile />} />
          <Route path="*" element={<Navigate to="/mess" replace />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="pending" element={<PendingApprovals />} />
          <Route path="listings" element={<AllListings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<ReviewModeration />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;

