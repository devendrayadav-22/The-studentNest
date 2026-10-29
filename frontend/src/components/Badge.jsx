import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

export const Badge = ({
  variant = 'default',
  children,
  className = '',
  size = 'sm'
}) => {
  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5'
  };

  if (variant === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#DCFCE7] text-[#15803D] border border-green-200/80 shadow-xs ${sizes[size]} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        {children || 'Verified'}
      </span>
    );
  }

  if (variant === 'pending') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#FEF3C7] text-[#B45309] border border-amber-200/80 ${sizes[size]} ${className}`}>
        <Clock className="w-3.5 h-3.5 shrink-0" />
        {children || 'Pending Approval'}
      </span>
    );
  }

  if (variant === 'rejected') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#FEE2E2] text-[#DC2626] border border-red-200/80 ${sizes[size]} ${className}`}>
        <XCircle className="w-3.5 h-3.5 shrink-0" />
        {children || 'Rejected'}
      </span>
    );
  }

  if (variant === 'stale') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#FEF3C7] text-[#B45309] border border-amber-300 ${sizes[size]} ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        {children || 'Not recently updated'}
      </span>
    );
  }

  if (variant === 'veg') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${sizes[size]} ${className}`}>
        <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
        {children || 'Pure Veg'}
      </span>
    );
  }

  if (variant === 'nonveg') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-800 border border-rose-200 ${sizes[size]} ${className}`}>
        <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
        {children || 'Non-Veg'}
      </span>
    );
  }

  if (variant === 'both') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizes[size]} ${className}`}>
        <span className="w-2 h-2 rounded-full bg-[#16A34A] shrink-0" />
        <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0 -ml-1" />
        {children || 'Veg & Non-Veg'}
      </span>
    );
  }

  if (variant === 'open') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizes[size]} ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Open Now
      </span>
    );
  }

  if (variant === 'closed') {
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-300 ${sizes[size]} ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-400" />
        Closed
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

