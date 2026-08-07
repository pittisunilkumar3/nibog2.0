"use client";

import { IconArrowLeft, IconArrowRight, IconQuote } from "@tabler/icons-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Testimonial = {
  quote: string;
  name: string;
  location: string;
  src: string;
  event: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
}) => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const hasMultipleTestimonials = testimonials.length > 1;

  const handleNext = () => {
    setActive((previous) => (previous + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((previous) =>
      (previous - 1 + testimonials.length) % testimonials.length,
    );
  };

  useEffect(() => {
    if (
      !autoplay ||
      !hasMultipleTestimonials ||
      isPaused ||
      shouldReduceMotion
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setActive((previous) => (previous + 1) % testimonials.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [
    autoplay,
    hasMultipleTestimonials,
    isPaused,
    shouldReduceMotion,
    testimonials.length,
  ]);

  useEffect(() => {
    if (active >= testimonials.length) {
      setActive(0);
    }
  }, [active, testimonials.length]);

  if (testimonials.length === 0) {
    return null;
  }

  const testimonial = testimonials[active];
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: "easeOut" as const };

  return (
    <div
      className={cn("mx-auto w-full max-w-5xl", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-amber-200/70 bg-white shadow-[0_20px_60px_-32px_rgba(69,42,12,0.45)] dark:border-amber-400/20 dark:bg-slate-950">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={`${testimonial.name}-${active}`}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={transition}
            className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
            aria-live="polite"
          >
            <div className="relative min-h-[230px] overflow-hidden sm:min-h-[280px] md:min-h-[360px]">
              <Image
                src={testimonial.src}
                alt={`NIBOG event shared by ${testimonial.name}`}
                fill
                sizes="(max-width: 767px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/55 to-transparent md:hidden" />
              <div className="absolute bottom-4 left-4 rounded-full border border-white/30 bg-slate-950/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm md:hidden">
                A real NIBOG family story
              </div>
            </div>

            <div className="flex flex-col justify-between p-5 sm:p-7 md:p-9">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                  <IconQuote className="h-5 w-5" aria-hidden="true" />
                </div>
                <blockquote className="text-base font-medium leading-7 text-slate-800 sm:text-lg sm:leading-8 dark:text-slate-100">
                  “{testimonial.quote}”
                </blockquote>
                <footer className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="font-bold text-slate-950 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                    Parent from {testimonial.location}
                    {testimonial.event ? ` · ${testimonial.event}` : ""}
                  </p>
                </footer>
              </div>

              {hasMultipleTestimonials && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {active + 1} of {testimonials.length}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Show previous parent story"
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 transition-colors hover:border-amber-400 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                    >
                      <IconArrowLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Show next parent story"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-slate-950 transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                    >
                      <IconArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
};
