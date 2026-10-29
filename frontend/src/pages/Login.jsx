import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Card from '../components/Card';

export const Login = () => {
  const { login, getDashboardPath } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect');

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(formData.email.trim(), formData.password);
      success(`Welcome back, ${user.name}!`);

      if (redirectPath) {
        navigate(decodeURIComponent(redirectPath), { replace: true });
      } else {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      const responseMsg = err.response?.data?.message || err.response?.data?.errors;

      if (status === 403 || (typeof responseMsg === 'string' && responseMsg.toLowerCase().includes('block'))) {
        setErrorMsg('Your account has been blocked by administrator. Please contact college support.');
      } else if (status === 401 || status === 400) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else {
        setErrorMsg(typeof responseMsg === 'string' ? responseMsg : 'Login failed. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo Login Quick Fill
  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    setLoading(true);
    setErrorMsg('');

    try {
      const user = await login(email, password);
      success(`Demo login successful as ${user.role}!`);
      if (redirectPath) {
        navigate(decodeURIComponent(redirectPath), { replace: true });
      } else {
        navigate(getDashboardPath(user.role), { replace: true });
      }
    } catch (err) {
      setErrorMsg('Demo login failed. Ensure backend seed data is loaded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Title Block */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-700 text-white shadow-md mb-1">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Sign in to your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Access StudentNest, bookmark hostels and connect with owners
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8 space-y-5 bg-white/85 shadow-lg">
          {errorMsg && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="student@ips.com"
                  className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-slate-900"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={LogIn}
              className="w-full py-2.5"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Grid */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Instant Demo Login
              </span>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                Pre-configured
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('student@ips.com', 'student123')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100 text-teal-900 font-semibold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                Student Demo
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('owner@ips.com', 'owner123')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 font-semibold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                PG Owner Demo
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('mess@ips.com', 'mess123')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-orange-900 font-semibold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-orange-600" />
                Mess Owner Demo
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin@ips.com', 'admin123')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 font-semibold transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                Admin Demo
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:underline">
              Create account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;

