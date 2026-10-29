import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Utensils, Heart, User, LogOut, Menu, X, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'PG & Hostels', path: '/pgs', icon: Compass },
    { label: 'Mess & Tiffin', path: '/messes', icon: Utensils },
  ];

  if (isAuthenticated && user?.role === 'STUDENT') {
    navLinks.push({ label: 'Wishlist', path: '/student/wishlist', icon: Heart });
  }

  const roleLabels = {
    STUDENT: { label: 'Student', color: 'bg-teal-100 text-teal-800' },
    PG_OWNER: { label: 'PG Owner', color: 'bg-blue-100 text-blue-800' },
    MESS_OWNER: { label: 'Mess Owner', color: 'bg-orange-100 text-orange-800' },
    ADMIN: { label: 'Admin', color: 'bg-purple-100 text-purple-800' },
  };

  return (
    <header className="sticky top-0 z-40 bg-[#E9ECEF]/90 backdrop-blur-md border-b border-slate-300/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
              Student<span className="text-teal-700">Nest</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-1 tracking-wide">
              Now live near IPS Academy, Indore
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <Link
                to={getDashboardPath()}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/80 hover:bg-white border border-slate-300/70 shadow-xs transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${roleLabels[user.role]?.color || 'bg-slate-100 text-slate-700'}`}>
                    {roleLabels[user.role]?.label || user.role}
                  </span>
                </div>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600"
                aria-label="Logout"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-300 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-teal-700 text-white' : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-slate-900">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>

                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full py-2.5 px-3 text-center text-sm font-semibold bg-teal-50 text-teal-800 rounded-xl border border-teal-200"
                >
                  Go to Dashboard ({roleLabels[user.role]?.label})
                </Link>

                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

