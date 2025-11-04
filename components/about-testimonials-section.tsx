'use client';

import { useMemo } from 'react';
import { TestimonialCarousel } from '@/components/testimonial-carousel';
import { useTestimonials } from '@/lib/swr-hooks';

interface AboutTestimonial {
  quote: string;
  name: string;
  location: string;
}

export function AboutTestimonialsSection() {
  // Use SWR hook to fetch testimonials data with caching
  const { testimonials, isLoading, isError } = useTestimonials();

  // Transform testimonials to match TestimonialCarousel format (text-only)
  const transformedTestimonials = useMemo(() => {
    return testimonials.map((testimonial) => ({
      quote: testimonial.testimonial,
      name: testimonial.name,
      location: testimonial.city,
    }));
  }, [testimonials]);

  // Fallback testimonials if API fails or no data (matching the original About page data)
  const fallbackTestimonials: AboutTestimonial[] = [
    {
      quote: "NIBOG has been a wonderful experience for my son. He's gained so much confidence and made new friends. The events are well-organized and the staff is amazing!",
      name: "Meera Reddy",
      location: "Hyderabad",
    },
    {
      quote: "My daughter looks forward to NIBOG events every year. It's become a family tradition for us. The joy on her face when she participates is priceless.",
      name: "Arjun Malhotra",
      location: "Bangalore",
    },
    {
      quote: "The way NIBOG organizes age-appropriate competitions is commendable. My twins have developed healthy competitive spirit while having fun.",
      name: "Lakshmi Nair",
      location: "Chennai",
    },
    {
      quote: "We traveled from Mumbai just for this event, and it was worth every mile! The organization was flawless.",
      name: "Rahul Verma",
      location: "Mumbai",
    },
    {
      quote: "My child was quite shy before joining NIBOG. Now, he's more confident and loves participating in events. Thank you for this platform!",
      name: "Priya Singh",
      location: "Delhi",
    },
    {
      quote: "The safety measures and care taken for the children are exceptional. We always feel comfortable at NIBOG events.",
      name: "Ananya Gupta",
      location: "Kolkata",
    },
  ];

  const displayTestimonials = transformedTestimonials.length > 0
    ? transformedTestimonials
    : fallbackTestimonials;

  const showingFallback = transformedTestimonials.length === 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(isError || showingFallback) && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isError
              ? "Showing sample testimonials (API temporarily unavailable)"
              : "Showing sample testimonials (No testimonials available in database)"
            }
          </p>
        </div>
      )}
      
      <TestimonialCarousel
        testimonials={displayTestimonials}
        autoPlayInterval={5000}
      />
    </div>
  );
}
