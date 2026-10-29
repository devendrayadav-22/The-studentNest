import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Compass,
  Heart,
  Scale,
  MessageSquare,
  Star,
  User,
  LogOut,
  Building2,
  PlusCircle,
  UtensilsCrossed,
  MenuSquare,
  ShieldAlert,
  Users,
  CheckCircle,
  Radio,
  Menu,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Menu items config by role
  const getNavLinks = () => {
    if (role === 'STUDENT') {
      return [
        { label: 'Overview', path: '/student', icon: LayoutDashboard },
        { label: 'Wishlist', path: '/student/wishlist', icon: Heart },
        { label: 'Compare PGs', path: '/student/compare', icon: Scale },
        { label: 'My Inquiries', path: '/student/inquiries', icon: MessageSquare },
        { label: 'My Reviews', path: '/student/reviews', icon: Star },
        { label: 'Browse PGs', path: '/pgs', icon: Compass, external: true },
        { label: 'Mess Finder', path: '/messes', icon: UtensilsCrossed, external: true },
        { label: 'Profile', path: '/student/profile', icon: User },
      ];
    }

    if (role === 'PG_OWNER') {
      return [
        { label: 'Overview', path: '/owner', icon: LayoutDashboard },
        { label: 'My Listings', path: '/owner/listings', icon: Building2 },
        { label: 'Add PG Listing', path: '/owner/listings/new', icon: PlusCircle },
        { label: 'Inquiries', path: '/owner/inquiries', icon: MessageSquare },
        { label: 'Reviews & Replies', path: '/owner/reviews', icon: Star },
        { label: 'Profile', path: '/owner/profile', icon: User },
      ];
    }

    if (role === 'MESS_OWNER') {
      return [
        { label: 'Overview', path: '/mess', icon: LayoutDashboard },
        { label: 'Mess Profile', path: '/mess/profile', icon: UtensilsCrossed },
        { label: 'Menu', path: '/mess/menu', icon: MenuSquare },
        { label: 'Reviews', path: '/mess/reviews', icon: Star },
        { label: 'Inquiries', path: '/mess/inquiries', icon: MessageSquare },
        { label: 'Profile', path: '/mess/account', icon: User },
      ];
    }

    if (role === 'ADMIN') {
      return [
        { label: 'Overview', path: '/admin', icon: LayoutDashboard },
        { label: 'Pending Approvals', path: '/admin/pending', icon: CheckCircle },
        { label: 'All Listings', path: '/admin/listings', icon: Building2 },
        { label: 'Users Management', path: '/admin/users', icon: Users },
        { label: 'Review Moderation', path: '/admin/reviews', icon: Star },
        { label: 'User Reports', path: '/admin/reports', icon: ShieldAlert },
        { label: 'Announcements', path: '/admin/announcements', icon: Radio },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  // Role Accent Colors (Student #14B8A6, PG Owner #3B82F6, Mess Owner #F97316, Admin #8B5CF6)
  const roleStyles = {
    STUDENT: {
      accentBorder: 'border-t-4 border-t-[#14B8A6]',
      activeNav: 'bg-teal-50 text-teal-800 font-bold border-l-4 border-l-[#14B8A6]',
      badgeBg: 'bg-teal-100 text-teal-800',
      roleTitle: 'Student Portal',
      avatarBg: 'bg-[#14B8A6]',
    },
    PG_OWNER: {
      accentBorder: 'border-t-4 border-t-[#3B82F6]',
      activeNav: 'bg-blue-50 text-blue-800 font-bold border-l-4 border-l-[#3B82F6]',
      badgeBg: 'bg-blue-100 text-blue-800',
      roleTitle: 'PG Owner Portal',
      avatarBg: 'bg-[#3B82F6]',
    },
    MESS_OWNER: {
      accentBorder: 'border-t-4 border-t-[#F97316]',
      activeNav: 'bg-orange-50 text-orange-800 font-bold border-l-4 border-l-[#F97316]',
      badgeBg: 'bg-orange-100 text-orange-800',
      roleTitle: 'Mess Owner Portal',
      avatarBg: 'bg-[#F97316]',
    },
    ADMIN: {
      accentBorder: 'border-t-4 border-t-[#8B5CF6]',
      activeNav: 'bg-purple-50 text-purple-800 font-bold border-l-4 border-l-[#8B5CF6]',
      badgeBg: 'bg-purple-100 text-purple-800',
      roleTitle: 'Admin Console',
      avatarBg: 'bg-[#8B5CF6]',
    },
  };

  const currentTheme = roleStyles[role] || roleStyles.STUDENT;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Role Identity Badge */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${currentTheme.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-bold text-slate-900 truncate">
                {user?.name || 'User'}
              </span>
              <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${currentTheme.badgeBg}`}>
                {currentTheme.roleTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileDrawerOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? currentTheme.activeNav
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.external && <ExternalLink className="w-3 h-3 text-slate-400" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom controls */}
      <div className="p-4 border-t border-slate-200 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#E9ECEF] flex flex-col ${currentTheme.accentBorder}`}>
      {/* Topbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
              SN
            </div>
            <span className="font-bold text-slate-900 text-sm hidden sm:inline">
              StudentNest <span className="text-slate-400 font-normal">| {currentTheme.roleTitle}</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {role === 'STUDENT' && (
            <Link
              to="/pgs"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore PGs</span>
            </Link>
          )}

          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className={`w-8 h-8 rounded-full ${currentTheme.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="block font-bold text-slate-900">{user?.name}</span>
              <span className="text-slate-500 text-[10px]">{user?.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm self-start sticky top-24 h-[calc(100vh-7.5rem)] overflow-hidden">
          {sidebarContent}
        </aside>

        {/* Content Body */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-xs flex"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col animate-slide-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Navigation Menu</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;

