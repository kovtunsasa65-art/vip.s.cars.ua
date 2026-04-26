/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PHONE_TEL } from './lib/config';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Phone, MessageCircle } from 'lucide-react';
import React from 'react';
import Navbar from './components/Navbar';
import SEOHead, { orgSchema } from './components/SEOHead';
import Hero from './components/Hero';
import FeaturedGallery from './components/FeaturedGallery';
import Services from './components/Services';
import Catalog from './components/Catalog';
import AboutUs from './components/AboutUs';
import Reviews from './components/Reviews';
import LeadForm from './components/LeadForm';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import InstallPWA from './components/InstallPWA';
import ToastContainer from './components/ToastContainer';

// Lazy-loaded — не завантажуються при першому відкритті сайту
const Admin           = lazy(() => import('./pages/Admin'));
const Login           = lazy(() => import('./pages/Login'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const SellCar         = lazy(() => import('./pages/SellCar'));
const CarDetails      = lazy(() => import('./pages/CarDetails'));
const ComparePage     = lazy(() => import('./pages/ComparePage'));
const FeedPage        = lazy(() => import('./pages/FeedPage'));
const NotFoundPage    = lazy(() => import('./pages/NotFoundPage'));
const Favorites       = lazy(() => import('./pages/Favorites'));
const BlogList        = lazy(() => import('./pages/BlogList'));
const BlogPost        = lazy(() => import('./pages/BlogPost'));
const SitemapHtml     = lazy(() => import('./pages/SitemapHtml'));
const SitemapXml      = lazy(() => import('./pages/SitemapXml'));
const Privacy         = lazy(() => import('./pages/Privacy'));
const Cookie          = lazy(() => import('./pages/Cookie'));
const Terms           = lazy(() => import('./pages/Terms'));
const Oferta          = lazy(() => import('./pages/Oferta'));
const ServerError     = lazy(() => import('./pages/ServerError'));
const Maintenance     = lazy(() => import('./pages/Maintenance'));
const { AvtopidbirPage, VykupPage, PerevirkaPage, ObminPage } = {
  AvtopidbirPage: lazy(() => import('./pages/ServicePages').then(m => ({ default: m.AvtopidbirPage }))),
  VykupPage:      lazy(() => import('./pages/ServicePages').then(m => ({ default: m.VykupPage }))),
  PerevirkaPage:  lazy(() => import('./pages/ServicePages').then(m => ({ default: m.PerevirkaPage }))),
  ObminPage:      lazy(() => import('./pages/ServicePages').then(m => ({ default: m.ObminPage }))),
};

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
  </div>
);

function ScrollAnimatedButtons() {
  const { scrollY } = useScroll();
  
  // Circular trajectory (approximate arc):
  // At scroll 0:   x: -72, y: 0
  // At scroll 75:  x: -51, y: -51 (the curve point)
  // At scroll 150: x: 0,   y: -72
  const x = useTransform(scrollY, [0, 75, 150], [-72, -51, 0]);
  const y = useTransform(scrollY, [0, 75, 150], [0, -51, -72]);
  const scale = useTransform(scrollY, [0, 150], [1, 1]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.a
        href="https://t.me/vips_cars"
        target="_blank"
        rel="noreferrer"
        style={{ x, y, scale }}
        className="absolute w-14 h-14 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 pointer-events-auto cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} />
      </motion.a>

      <motion.a
        href={PHONE_TEL}
        className="absolute w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-green-500/20 pointer-events-auto cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-green-500 opacity-20 pointer-events-none" />
        <Phone size={28} />
      </motion.a>
    </div>
  );
}

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SEOHead
        title="Автопідбір та викуп авто в Києві"
        description="Підберемо авто без ризику або викупимо за 1 день. Перевірені авто з Індексом Довіри 0–100. Київ."
        url="/"
        schema={orgSchema()}
      />
      <Hero />
      <FeaturedGallery />
      <Services />
      <Catalog />
      <AboutUs />
      <Reviews />
      <LeadForm />
    </motion.div>
  );
}

// Fallback for other routes as it's a landing page
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-20">
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="/cabinet/*" element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-blue selection:text-white">
            <Navbar />
            
            <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/services" element={<PageWrapper><Services /></PageWrapper>} />
                <Route path="/catalog" element={<PageWrapper><Catalog /></PageWrapper>} />
                <Route path="/catalog/:brandSlug" element={<PageWrapper><Catalog /></PageWrapper>} />
                <Route path="/car/:id"    element={<PageWrapper><CarDetails /></PageWrapper>} />
                <Route path="/cars/:id"  element={<PageWrapper><CarDetails /></PageWrapper>} />
                <Route path="/about"     element={<PageWrapper><AboutUs /></PageWrapper>} />
                <Route path="/reviews"   element={<PageWrapper><Reviews /></PageWrapper>} />
                <Route path="/avtopidbir" element={<AvtopidbirPage />} />
                <Route path="/vykup"      element={<VykupPage />} />
                <Route path="/perevirka"  element={<PerevirkaPage />} />
                <Route path="/obmin"      element={<ObminPage />} />
                <Route path="/compare"    element={<ComparePage />} />
                <Route path="/feed"       element={<FeedPage />} />
                <Route path="/favorites"  element={<Favorites />} />
                <Route path="/blog"       element={<BlogList />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/sitemap"    element={<SitemapHtml />} />
                <Route path="/sitemap.xml" element={<SitemapXml />} />
                <Route path="/privacy"    element={<Privacy />} />
                <Route path="/cookie"     element={<Cookie />} />
                <Route path="/terms"      element={<Terms />} />
                <Route path="/oferta"     element={<Oferta />} />
                <Route path="/500"        element={<ServerError />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="*"           element={<NotFoundPage />} />
              </Routes>
            </AnimatePresence>
            </Suspense>
            <InstallPWA />
            <ToastContainer />

            <Footer />

            {/* Floating Buttons Container */}
            <div className="fixed bottom-[74px] md:bottom-6 right-4 md:right-6 z-[60] h-16 w-16 pointer-events-none">
              <ScrollAnimatedButtons />
            </div>
          </div>
        } />
      </Routes>
      </Suspense>
    </Router>
  );
}
