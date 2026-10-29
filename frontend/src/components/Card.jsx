import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  roleAccent = null, // 'student' | 'pgOwner' | 'messOwner' | 'admin'
  onClick,
  ...props
}) => {
  const accentBorder = {
    student: 'border-t-4 border-t-[#14B8A6]',
    pgOwner: 'border-t-4 border-t-[#3B82F6]',
    messOwner: 'border-t-4 border-t-[#F97316]',
    admin: 'border-t-4 border-t-[#8B5CF6]',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white/70 backdrop-blur-md border border-slate-300/60 rounded-2xl shadow-md transition-all duration-200 ${
        hover ? 'hover:-translate-y-1 hover:shadow-lg hover:border-slate-400/80 cursor-pointer' : ''
      } ${roleAccent ? accentBorder[roleAccent] || '' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

