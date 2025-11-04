'use client';

import { useMemo } from 'react';
import { AnimatedTestimonials } from '@/components/animated-testimonials';
import { useTestimonials } from '@/lib/swr-hooks';

export function DynamicTestimonialsSection() {
  // Use SWR hook to fetch testimonials data with caching
  const { testimonials, isLoading, isError } = useTestimonials();

  // Transform testimonials to match AnimatedTestimonials format
  const transformedTestimonials = useMemo(() => {
    return testimonials.map((testimonial) => ({
      quote: testimonial.testimonial,
      name: testimonial.name,
      location: testimonial.city,
      src: testimonial.image,
      event: `NIBOG Event #${testimonial.eventId}`
    }));
  }, [testimonials]);

  // Fallback testimonials if API fails or no data
  const fallbackTestimonials = [
    {
      quote: "The annual NIBOG game has been a huge hit with my kids. They love competing in different challenges and games, and it's been great for their confidence and self-esteem. I love that they're learning important life skills like perseverance and determination while they're having fun.",
      name: "Harikrishna",
      location: "Hyderabad",
      src: "/images/baby-crawling.jpg",
      event: "NIBOG Baby Olympics"
    },
    {
      quote: "New India Baby Olympic games has been a great experience for my kids. They love competing with other kids and showing off their skills, and it's been great for their hand-eye coordination and fine motor skills. I love that they're learning important life skills like teamwork and sportsmanship while they're having fun.",
      name: "Durga Prasad",
      location: "Bangalore",
      src: "/images/baby-walker.jpg",
      event: "NIBOG Baby Olympics"
    },
    {
      quote: "My kids love participating in games. It's been great for their problem-solving skills, as they get to tackle different challenges and puzzles. They've also developed their critical thinking skills and made new friends from different schools.",
      name: "Srujana",
      location: "Vizag",
      src: "/images/running-race.jpg",
      event: "NIBOG Baby Olympics"
    }
  ];

  const displayTestimonials = transformedTestimonials.length > 0
    ? transformedTestimonials
    : fallbackTestimonials;

  const showingFallback = transformedTestimonials.length === 0;

  return (
    <section className="container">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Children's Parents Speak for Us</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground">
            Hear what parents have to say about NIBOG events
          </p>

          {(isError || showingFallback) && (
            <p className="text-sm text-muted-foreground">
              {isError
                ? "Showing sample testimonials (API temporarily unavailable)"
                : "Showing sample testimonials (No testimonials available in database)"
              }
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatedTestimonials
            testimonials={displayTestimonials}
            className="py-8"
          />
        )}
      </div>
    </section>
  );
}
