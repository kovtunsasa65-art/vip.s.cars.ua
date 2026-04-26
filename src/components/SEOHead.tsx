import { useEffect } from 'react';
import { PHONE_RAW } from '../lib/config';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: object;
}

const SITE_NAME = 'VIP.S CARS';
const SITE_URL  = 'https://vip-s-cars.com';
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80';

export default function SEOHead({ title, description, image, url, type = 'website', schema }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Автопідбір та викуп авто в Києві`;
  const desc = description ?? 'Підберемо авто без ризику або викупимо за 1 день. Перевірені авто з Індексом Довіри. Київ.';
  const img  = image ?? DEFAULT_IMG;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Standard meta
    const setName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('name', name); document.head.appendChild(el); }
      el.content = content;
    };
    const setProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setName('description', desc);
    setName('robots', 'index, follow');

    // OpenGraph
    setProp('og:title', fullTitle);
    setProp('og:description', desc);
    setProp('og:image', img);
    setProp('og:url', canonical);
    setProp('og:type', type);
    setProp('og:site_name', SITE_NAME);
    setProp('og:locale', 'uk_UA');

    // Twitter Card
    setName('twitter:card', 'summary_large_image');
    setName('twitter:title', fullTitle);
    setName('twitter:description', desc);
    setName('twitter:image', img);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalEl) { canonicalEl = document.createElement('link'); canonicalEl.rel = 'canonical'; document.head.appendChild(canonicalEl); }
    canonicalEl.href = canonical;

    // Schema.org JSON-LD
    const schemaId = 'schema-jsonld';
    let schemaEl = document.getElementById(schemaId);
    if (schema) {
      if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = schemaId; (schemaEl as HTMLScriptElement).type = 'application/ld+json'; document.head.appendChild(schemaEl); }
      schemaEl.textContent = JSON.stringify(schema);
    } else if (schemaEl) {
      schemaEl.remove();
    }
  }, [fullTitle, desc, img, canonical, type, schema]);

  return null;
}

// ── Готові схеми ────────────────────────────────────────────
export function carSchema(car: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: car.title,
    brand: { '@type': 'Brand', name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage, unitCode: 'KMT' },
    fuelType: car.engine_type,
    vehicleTransmission: car.transmission,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: car.currency ?? 'USD',
      availability: car.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      seller: { '@type': 'AutoDealer', name: 'VIP.S CARS', url: 'https://vip-s-cars.com' },
    },
    image: car.car_images?.[0]?.url ?? car.images?.[0] ?? '',
    description: car.description ?? '',
  };
}

export function orgSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'VIP.S CARS',
    url: 'https://vip-s-cars.com',
    telephone: PHONE_RAW,
    address: { '@type': 'PostalAddress', addressLocality: 'Київ', addressCountry: 'UA' },
    sameAs: ['https://t.me/vips_cars'],
    openingHours: 'Mo-Su 09:00-21:00',
  };
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name,
      item: `https://vip-s-cars.com${c.url}`,
    })),
  };
}
