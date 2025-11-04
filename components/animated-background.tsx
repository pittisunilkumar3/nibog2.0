'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageBackgrounds, floatingAnimation } from '@/lib/background-styles';

interface BackgroundElement {
  icon: string;
  size: string;
  position: string;
  className?: string;
}

type PageBackground = keyof typeof pageBackgrounds;

interface AnimatedBackgroundProps {
  children: ReactNode;
  variant: PageBackground;
  className?: string;
}

export function AnimatedBackground({ 
  children, 
  variant, 
  className = '' 
}: AnimatedBackgroundProps) {
  const config = pageBackgrounds[variant] as { gradient: string; elements: BackgroundElement[] };
  const { gradient, elements } = config;

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${gradient} ${className}`}>
      {/* Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {elements.map((el: BackgroundElement, i: number) => (
          <motion.div
            key={`${variant}-${i}`}
            className={`absolute ${el.position} ${el.size} ${el.className || 'opacity-30'}`}
            custom={i}
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
            aria-hidden="true"
          >
            {el.icon}
          </motion.div>
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
