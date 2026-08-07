'use client';

import { useMemo } from 'react';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { useTestimonials } from '@/lib/swr-hooks';

export function AboutTestimonialsSection() {
  // Use SWR hook to fetch testimonials data with caching
  const { testimonials, isLoading } = useTestimonials();

  // Transform testimonials to match TestimonialCarousel format (text-only)
  const transformedTestimonials = useMemo(() => {
    return testimonials.map((testimonial) => ({
      quote: testimonial.testimonial,
      name: testimonial.name,
      location: testimonial.city,
    }));
  }, [testimonials]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (transformedTestimonials.length === 0) return null

  return (
    <div className="space-y-4">
      <TestimonialCarousel
        testimonials={transformedTestimonials}
        autoPlayInterval={5000}
      />
    </div>
  );
}
