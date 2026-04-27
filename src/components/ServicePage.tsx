import React from 'react';
import SEOHead from '../components/SEOHead';
import LeadFormBlock from '../components/LeadFormBlock';
import FAQ from '../components/FAQ';
import Reviews from '../components/Reviews';
import { ServiceContent } from '../config/servicePages';
import { useSeoPage } from '../lib/useSeoPage';

export default function ServicePage({ data }: { data: ServiceContent }) {
  const {
    title,
    heroTagline,
    heroSubtitle,
    heroDescription,
    steps,
    benefits,
    price,
    reviewCategory,
    faq,
    form,
  } = data;

  // Slug без лідного "/" (напр. "avtopidbir")
  const seo = useSeoPage(data.path.replace(/^\//, ''));

  return (
    <>
      <SEOHead
        title={seo.seo_title || title}
        description={seo.seo_desc || heroDescription}
        url={data.path}
      />
      <div className="min-h-screen bg-slate-50 pb-20">
        {/* Hero */}
        <section className="bg-white border-b border-slate-100 py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-block bg-brand-blue/10 text-brand-blue text-xs font-black px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
                  {heroTagline}
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                  {heroSubtitle}
                </h1>
                <p className="text-slate-500 text-lg mb-6 leading-relaxed">{heroDescription}</p>
                {price && (
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                      {price}
                    </span>
                  </div>
                )}
              </div>
              <LeadFormBlock type={form.type} title={form.title} placeholder={form.placeholder} />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 space-y-16">
          {/* Steps */}
          {steps && steps.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Як це працює</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {steps.map(s => (
                  <div key={s.n} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div className="text-4xl font-black text-brand-blue/20 mb-3">{s.n}</div>
                    <h3 className="font-black text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Benefits / Why us */}
          {benefits && benefits.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Чому обирають нас</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map(b => (
                  <div key={b.title} className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 shadow-sm">
                    <span className="text-2xl shrink-0">{b.icon}</span>
                    <div>
                      <h4 className="font-black text-slate-900 mb-1">{b.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          {faq && faq.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Питання та відповіді</h2>
              <FAQ items={faq} />
            </section>
          )}

          {/* Reviews */}
          {reviewCategory && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 text-center">Відгуки</h2>
              <Reviews category={reviewCategory} />
            </section>
          )}
        </div>
      </div>
    </>
  );
}
