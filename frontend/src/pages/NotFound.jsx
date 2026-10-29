import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-md mt-2 mb-6">
        The student page, hostel listing, or dashboard you are trying to visit does not exist or has been moved.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/">
          <Button variant="primary" size="md" icon={Home}>
            Back to Home
          </Button>
        </Link>
        <Link to="/pgs">
          <Button variant="secondary" size="md" icon={Compass}>
            Explore PGs
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

