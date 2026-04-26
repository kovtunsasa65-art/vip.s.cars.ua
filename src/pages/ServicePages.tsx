import React from 'react';
import ServicePage from '../components/ServicePage';
import { SERVICE_PAGES } from '../config/servicePages';

// Export individual page components that the router expects
export function AvtopidbirPage() {
  const data = SERVICE_PAGES.avtopidbir;
  return <ServicePage data={data} />;
}

export function VykupPage() {
  const data = SERVICE_PAGES.vykup;
  return <ServicePage data={data} />;
}

export function PerevirkaPage() {
  const data = SERVICE_PAGES.perevirka;
  return <ServicePage data={data} />;
}

// Placeholder for "obmin" (trade‑in) page – you can add its config later
export function ObminPage() {
  const data = SERVICE_PAGES.obmin;
  return <ServicePage data={data} />;
}
