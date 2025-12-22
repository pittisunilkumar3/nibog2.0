'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export function TestimonialCarousel({
  testimonials,
  autoPlayInterval = 5000,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(1);

  // Handle responsive slides per view
  useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setSlidesPerView(3);
      } else if (width >= 768) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    // Initial call
    updateSlidesPerView();

    // Add event listener for window resize
    window.addEventListener('resize', updateSlidesPerView);
    return () => window.removeEventListener('resize', updateSlidesPerView);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, autoPlayInterval]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / slidesPerView));
  }, [testimonials.length, slidesPerView]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.ceil(testimonials.length / slidesPerView) - 1 : prev - 1
    );
  }, [testimonials.length, slidesPerView]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate the current group of testimonials to display
  const getCurrentTestimonials = () => {
    const start = currentIndex * slidesPerView;
    const end = start + slidesPerView;
    const currentSlice = testimonials.slice(start, end);
    
    // Only wrap around if we need more testimonials to fill the view
    if (currentSlice.length < slidesPerView && testimonials.length > slidesPerView) {
      const needed = slidesPerView - currentSlice.length;
      return currentSlice.concat(testimonials.slice(0, needed));
    }
    
    return currentSlice;
  };

  // Calculate total number of slides based on testimonials and slides per view
  const totalSlides = Math.ceil(testimonials.length / slidesPerView);

  return (
    <div 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 1000)}
    >
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white/100 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 md:left-4"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-lg transition-all hover:bg-white/100 dark:bg-gray-800/80 dark:hover:bg-gray-700/90 md:right-4"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Testimonial Cards */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid h-full w-full gap-6 px-2 sm:px-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {getCurrentTestimonials().map((testimonial, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
              >
                <Card className="h-full">
                  <CardContent className="h-full pt-6">
                    <div className="mb-4 text-4xl text-yellow-500">"</div>
                    <p className="mb-4 italic text-muted-foreground">{testimonial.quote}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots Navigation */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 w-3 rounded-full transition-all ${currentIndex === index ? 'bg-yellow-500 w-6' : 'bg-slate-300 dark:bg-slate-600'}`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
