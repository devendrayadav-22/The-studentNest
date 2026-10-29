import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, Heart } from 'lucide-react';
import COLLEGE_CONFIG from '../constants/college';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                SN
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                StudentNest
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Indore’s exclusive verified student accommodation & mess discovery portal for IPS Academy, Indore students. More colleges coming soon.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Admin Verified Accommodations</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pgs" className="hover:text-teal-400 transition-colors">
                  All PGs & Hostels
                </Link>
              </li>
              <li>
                <Link to="/pgs?gender=BOYS" className="hover:text-teal-400 transition-colors">
                  Boys PG near IPS
                </Link>
              </li>
              <li>
                <Link to="/pgs?gender=GIRLS" className="hover:text-teal-400 transition-colors">
                  Girls PG near IPS
                </Link>
              </li>
              <li>
                <Link to="/messes" className="hover:text-teal-400 transition-colors">
                  Mess & Tiffin Services
                </Link>
              </li>
              <li>
                <Link to="/messes?foodType=VEG" className="hover:text-teal-400 transition-colors">
                  Pure Veg Messes
                </Link>
              </li>
            </ul>
          </div>

          {/* Dashboards & Portals */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/student" className="hover:text-teal-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-teal-400 transition-colors">
                  PG Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/mess" className="hover:text-teal-400 transition-colors">
                  Mess Owner Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-400 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-teal-400 transition-colors">
                  List Your PG / Mess
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Location Reference */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Campus Reference
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>{COLLEGE_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 731 4014600</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@studentnest.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} StudentNest. Built for IPS Academy Students, Indore &bull; More colleges coming soon.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Indore Campus Life
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

