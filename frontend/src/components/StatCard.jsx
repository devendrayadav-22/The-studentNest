import React from 'react';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  roleAccent = 'student',
  className = ''
}) => {
  const iconBgs = {
    student: 'bg-teal-50 text-teal-700 border-teal-200/70',
    pgOwner: 'bg-blue-50 text-blue-700 border-blue-200/70',
    messOwner: 'bg-orange-50 text-orange-700 border-orange-200/70',
    admin: 'bg-purple-50 text-purple-700 border-purple-200/70',
  };

  return (
    <Card className={`p-5 flex items-start justify-between gap-4 ${className}`} roleAccent={roleAccent}>
      <div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
          {title}
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          {value !== undefined && value !== null ? value : 0}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {Icon && (
        <div className={`p-3 rounded-2xl border shadow-xs shrink-0 ${iconBgs[roleAccent] || iconBgs.student}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </Card>
  );
};

export default StatCard;

