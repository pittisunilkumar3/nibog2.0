'use client';

import { useMemo } from 'react';
import { AnimatedTestimonials } from '@/components/animated-testimonials';
import { useTestimonials } from '@/lib/swr-hooks';

export function DynamicTestimonialsSection() {
  const { testimonials, isLoading } = useTestimonials();

  const transformedTestimonials = useMemo(() => {
    return testimonials.map((testimonial) => ({
      quote: testimonial.testimonial,
      name: testimonial.name,
      location: testimonial.city,
      src: testimonial.image || '/images/baby-crawling.jpg',
      event: testimonial.eventId
        ? `NIBOG Event #${testimonial.eventId}`
        : 'NIBOG Baby Games',
    }));
  }, [testimonials]);

  if (!isLoading && transformedTestimonials.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 via-white to-white py-10 sm:py-14 md:py-20 dark:from-amber-950/20 dark:via-background dark:to-background"
      aria-labelledby="parent-stories-heading"
    >
      <div className="pointer-events-none absolute -right-20 top-4 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl dark:bg-orange-500/10" />
      <div className="container relative px-4">
        <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-9">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            Loved by NIBOG families
          </p>
          <h2
            id="parent-stories-heading"
            className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl md:text-4xl dark:text-white"
          >
            Real moments. Proud parents.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
            See how a day of playful competition becomes a confidence-building
            memory for the whole family.
          </p>
        </div>

        {isLoading && testimonials.length === 0 ? (
          <div
            className="mx-auto grid min-h-[470px] w-full max-w-5xl animate-pulse overflow-hidden rounded-[1.75rem] border border-amber-100 bg-white md:grid-cols-2 dark:border-slate-800 dark:bg-slate-950"
            role="status"
            aria-label="Loading parent stories"
          >
            <div className="min-h-[230px] bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-4 p-6 sm:p-8">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-slate-800" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-11/12 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
              <span className="sr-only">Loading parent stories…</span>
            </div>
          </div>
        ) : (
          <AnimatedTestimonials testimonials={transformedTestimonials} />
        )}
      </div>
    </section>
  );
}
