import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Compass,
  Utensils,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Radio,
  Navigation,
  ThumbsUp,
  FileCheck2,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import PgCard from '../components/PgCard';
import MessCard from '../components/MessCard';
import MapView from '../components/MapView';
import Skeleton, { CardSkeleton } from '../components/Skeleton';
import { pgApi } from '../api/pgApi';
import { messApi } from '../api/messApi';
import { announcementApi } from '../api/announcementApi';
import { formatDate } from '../utils/formatters';
import COLLEGE_CONFIG from '../constants/college';

export const Home = () => {
  const shouldReduceMotion = useReducedMotion();
  const [featuredPgs, setFeaturedPgs] = useState([]);
  const [popularMesses, setPopularMesses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [pgRes, messRes, annRes] = await Promise.allSettled([
          pgApi.getAll({ verifiedOnly: true, size: 3, sortBy: 'rating', order: 'desc' }),
          messApi.getAll({ size: 3, sortBy: 'rating', order: 'desc' }),
          announcementApi.getAll()
        ]);

        if (pgRes.status === 'fulfilled' && pgRes.value?.content) {
          setFeaturedPgs(pgRes.value.content);
        }
        if (messRes.status === 'fulfilled' && messRes.value?.content) {
          setPopularMesses(messRes.value.content);
        }
        if (annRes.status === 'fulfilled' && Array.isArray(annRes.value)) {
          setAnnouncements(annRes.value);
        }
      } catch (err) {
        console.error('Error fetching home content:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const faqs = [
    {
      q: 'How is the distance from IPS Academy calculated?',
      a: 'We calculate exact geographic Haversine distance from the central IPS Academy Indore campus coordinates (22.6900° N, 75.8700° E) to each accommodation pin, providing accurate walking and commute distance estimates.'
    },
    {
      q: 'Are all PGs and Hostels listed on this portal verified?',
      a: 'Yes! Newly submitted listings go through administrative approval. Verified badges indicate that location coordinates, rent structure, and contact information have been vetted.'
    },
    {
      q: 'Is there any brokerage or booking fee for students?',
      a: 'Zero brokerage! StudentNest directly connects students with PG and Mess owners via phone, WhatsApp, and in-app messaging.'
    },
    {
      q: 'How does the Mess & Tiffin service work?',
      a: 'Mess profiles list real-time Open/Closed statuses, full weekly breakfast/lunch/dinner menus, per-meal thali prices, monthly subscription plans, and delivery area radius.'
    },
    {
      q: 'Is StudentNest available for other colleges?',
      a: 'Right now StudentNest is fully working for the IPS Academy, Indore area. More colleges and cities are coming soon.'
    }
  ];

  const fadeInUp = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-50px' },
        transition: { duration: 0.5 }
      };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Campus Distance', value: '< 2.5 km', sub: 'Average from IPS gate' },
            { label: 'Verified Listings', value: '100%', sub: 'Admin physically verified' },
            { label: 'Daily Tiffin Meals', value: '₹80 - ₹120', sub: 'Fresh home-style thali' },
            { label: 'Student Savings', value: '₹0 Brokerage', sub: 'Direct owner connect' },
          ].map((stat, idx) => (
            <Card key={idx} className="p-4 sm:p-5 text-center bg-white/80">
              <span className="block text-xl sm:text-2xl font-extrabold text-teal-700">
                {stat.value}
              </span>
              <span className="block text-xs font-bold text-slate-800 mt-0.5">
                {stat.label}
              </span>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                {stat.sub}
              </span>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Campus Announcements Banner (from GET /api/announcements) */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Campus Advisory
                  </span>
                  <span className="text-[10px] text-amber-700">
                    {formatDate(announcements[0].createdAt)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                  {announcements[0].title}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 max-w-3xl">
                  {announcements[0].content}
                </p>
              </div>
            </div>

            <Link to="/pgs" className="shrink-0">
              <Button variant="accent" size="sm">
                Explore Safe PGs
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* 4. Featured Verified PGs */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Recommended Accommodations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Featured Verified PGs & Hostels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top rated by IPS Academy students with walking distance to campus
            </p>
          </div>

          <Link to="/pgs">
            <Button variant="outlineTeal" size="sm" icon={Compass}>
              View All PGs
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : featuredPgs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPgs.map((pg) => (
              <PgCard key={pg.id} pg={pg} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            No approved featured PGs currently available.
          </Card>
        )}
      </motion.section>

      {/* 5. Popular Mess & Tiffin Services */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Utensils className="w-4 h-4" />
              <span>Campus Food Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Mess & Tiffin Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Hygienic daily thali meals, monthly plans and room delivery
            </p>
          </div>

          <Link to="/messes">
            <Button variant="secondary" size="sm" icon={Utensils}>
              View All Messes
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : popularMesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularMesses.map((mess) => (
              <MessCard key={mess.id} mess={mess} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500">
            No approved mess services available at the moment.
          </Card>
        )}
      </motion.section>

      {/* 6. Interactive Campus Map Preview */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6 sm:p-8 bg-white/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Spatial Proximity View
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Live Campus Map Preview
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Visualizing approved student stays and messes surrounding {COLLEGE_CONFIG.name}
              </p>
            </div>

            <Link to="/pgs">
              <Button variant="primary" size="sm" icon={Compass}>
                Open Interactive Map Filter
              </Button>
            </Link>
          </div>

          <MapView
            listings={[...featuredPgs, ...popularMesses]}
            height="420px"
          />
        </Card>
      </motion.section>

      {/* 7. How It Works (3 steps) */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Easy & Free
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How StudentNest Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find your ideal student room in 3 seamless steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Search & Filter',
              desc: 'Select your budget, preferred gender (Boys/Girls), sharing type, and distance radius from IPS Academy Indore.',
              icon: Compass,
              accent: 'bg-teal-50 text-teal-700 border-teal-200'
            },
            {
              step: '02',
              title: 'Verify & Compare',
              desc: 'Inspect genuine photos, distance, walking routes, authentic student reviews, and verify available bed counts.',
              icon: FileCheck2,
              accent: 'bg-amber-50 text-amber-700 border-amber-200'
            },
            {
              step: '03',
              title: 'Direct Connect',
              desc: 'Call the owner directly, send a WhatsApp inquiry, or book a visit with zero middleman or broker commission.',
              icon: PhoneCall,
              accent: 'bg-blue-50 text-blue-700 border-blue-200'
            }
          ].map((item, idx) => (
            <Card key={idx} className="p-6 relative group overflow-hidden bg-white/80">
              <span className="text-4xl font-black text-slate-200 group-hover:text-teal-200 transition-colors absolute top-4 right-4">
                {item.step}
              </span>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-4 ${item.accent}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* 8. Why Trust Us */}
      <motion.section {...fadeInUp} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block mb-2">
              Student Safety First
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Why Students Trust StudentNest
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Unlike generic commercial housing portals, every accommodation on our platform is evaluated specifically for students commuting to IPS Academy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Admin Verified Stays:</strong> Listings must pass rigorous screening of coordinates and safety rules.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Fresh Availability:</strong> Owners touch availability timestamps to prevent stale or full hostels.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Student-Only Reviews:</strong> Only authenticated IPS students can submit ratings and reviews.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Immediate Reporting:</strong> Flag suspicious or inaccurate listings for administrative takedown.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 9. FAQ Accordion */}
      <motion.section {...fadeInUp} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <Card
                key={idx}
                className="p-4 sm:p-5 cursor-pointer bg-white/80 transition-all"
                onClick={() => setFaqOpen(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-teal-700' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
};

export default Home;

