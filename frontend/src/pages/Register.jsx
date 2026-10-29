import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Building, GraduationCap, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import Card from '../components/Card';

export const Register = () => {
  const { register, getDashboardPath } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    college: 'IPS Academy, Indore',
    course: '',
    homeCity: '',
    ownerBusinessName: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      errs.phone = 'Valid 10-digit phone number is required';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (role === 'STUDENT') {
      if (!formData.course.trim()) errs.course = 'Course is required (e.g. B.Tech CSE)';
      if (!formData.homeCity.trim()) errs.homeCity = 'Home city is required';
    }

    if (role === 'PG_OWNER' || role === 'MESS_OWNER') {
      if (!formData.ownerBusinessName.trim()) {
        errs.ownerBusinessName = 'Business or PG/Mess name is required';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
      role,
      college: role === 'STUDENT' ? formData.college.trim() : null,
      course: role === 'STUDENT' ? formData.course.trim() : null,
      homeCity: role === 'STUDENT' ? formData.homeCity.trim() : null,
      ownerBusinessName: role !== 'STUDENT' ? formData.ownerBusinessName.trim() : null
    };

    try {
      const newUser = await register(payload);
      success(`Welcome to StudentNest, ${newUser.name}!`);
      navigate(getDashboardPath(newUser.role), { replace: true });
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (typeof backendErrors === 'object' && backendErrors !== null) {
        setErrors(backendErrors);
      } else {
        setServerError(err.response?.data?.message || 'Registration failed. Please check details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-700 text-white shadow-md mb-1">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Join the IPS Academy community for student living & dining
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-5 bg-white/85 shadow-lg">
          {serverError && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium" role="alert">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Role Selection Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">
              I am registering as:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'STUDENT', label: 'Student', color: 'teal' },
                { id: 'PG_OWNER', label: 'PG Owner', color: 'blue' },
                { id: 'MESS_OWNER', label: 'Mess Owner', color: 'orange' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id);
                    setErrors({});
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    role === item.id
                      ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Aman Gupta"
                    className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.name ? 'border-red-400' : 'border-slate-300'}`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-red-600 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aman@ips.com"
                    className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.email ? 'border-red-400' : 'border-slate-300'}`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-red-600 mt-0.5">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.phone ? 'border-red-400' : 'border-slate-300'}`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-red-600 mt-0.5">{errors.phone}</p>}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.password ? 'border-red-400' : 'border-slate-300'}`}
                  />
                </div>
                {errors.password && <p className="text-[11px] text-red-600 mt-0.5">{errors.password}</p>}
              </div>
            </div>

            {/* Student Specific Fields */}
            {role === 'STUDENT' && (
              <div className="pt-2 border-t border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-teal-800 block uppercase tracking-wide">
                  Student Verification Details
                </span>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    College Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="IPS Academy Indore"
                      className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Course & Year
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech CSE 3rd Year"
                        className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.course ? 'border-red-400' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.course && <p className="text-[11px] text-red-600 mt-0.5">{errors.course}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Home City
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="homeCity"
                        value={formData.homeCity}
                        onChange={handleChange}
                        placeholder="e.g. Bhopal, Gwalior"
                        className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.homeCity ? 'border-red-400' : 'border-slate-300'}`}
                      />
                    </div>
                    {errors.homeCity && <p className="text-[11px] text-red-600 mt-0.5">{errors.homeCity}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Owner Specific Fields */}
            {(role === 'PG_OWNER' || role === 'MESS_OWNER') && (
              <div className="pt-2 border-t border-slate-200/80">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Business / Establishment Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="ownerBusinessName"
                    value={formData.ownerBusinessName}
                    onChange={handleChange}
                    placeholder={role === 'PG_OWNER' ? 'e.g. Sharma Residency & Hostels' : 'e.g. Maa Annapurna Tiffin Services'}
                    className={`w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none ${errors.ownerBusinessName ? 'border-red-400' : 'border-slate-300'}`}
                  />
                </div>
                {errors.ownerBusinessName && <p className="text-[11px] text-red-600 mt-0.5">{errors.ownerBusinessName}</p>}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full py-2.5 mt-2"
            >
              Complete Registration
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-1">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-700 hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;

