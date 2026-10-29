import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-[#0D9488] hover:bg-[#0F766E] text-white focus:ring-teal-500 shadow-sm hover:shadow',
    secondary: 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300 focus:ring-slate-400 shadow-sm',
    accent: 'bg-[#F59E0B] hover:bg-amber-500 text-slate-900 font-semibold focus:ring-amber-500 shadow-sm hover:shadow',
    danger: 'bg-[#EF4444] hover:bg-red-600 text-white focus:ring-red-400 shadow-sm',
    ghost: 'bg-transparent hover:bg-slate-200/60 text-slate-700 focus:ring-slate-300',
    outlineTeal: 'border-2 border-[#0D9488] text-[#0D9488] hover:bg-teal-50 focus:ring-teal-400',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1 gap-1',
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-medium',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;

