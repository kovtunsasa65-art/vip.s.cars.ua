import React from 'react';
import ReviewSystem from './ReviewSystem';

export default function Reviews({ category }: { category?: string } = {}) {
  return (
    <section id="reviews" className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ReviewSystem category={category} />
      </div>
    </section>
  );
}
