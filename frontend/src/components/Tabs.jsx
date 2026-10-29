import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  roleAccent = 'student',
  className = ''
}) => {
  const accentClasses = {
    student: 'text-teal-700 border-teal-600 bg-teal-50/60',
    pgOwner: 'text-blue-700 border-blue-600 bg-blue-50/60',
    messOwner: 'text-orange-700 border-orange-600 bg-orange-50/60',
    admin: 'text-purple-700 border-purple-600 bg-purple-50/60',
  };

  return (
    <div className={`border-b border-slate-200 flex gap-2 overflow-x-auto no-scrollbar ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap rounded-t-xl ${
              isActive
                ? `${accentClasses[roleAccent] || accentClasses.student} font-semibold`
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.icon && <tab.icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-white shadow-xs' : 'bg-slate-200/80'}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;

