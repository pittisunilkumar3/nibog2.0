'use client';

import { ReactNode, memo, useMemo } from 'react';
import { pageBackgrounds } from '@/lib/background-styles';

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

// CSS animation styles for floating effect
const floatingStyles = [
  'animate-float',
  'animate-float-delayed',
  'animate-float-slow',
  'animate-bounce-gentle',
];

function AnimatedBackgroundComponent({
  children,
  variant,
  className = ''
}: AnimatedBackgroundProps) {
  const config = pageBackgrounds[variant] as { gradient: string; elements: BackgroundElement[] };
  const { gradient, elements } = config;

  // Memoize elements to prevent unnecessary re-renders
  const renderedElements = useMemo(() => (
    elements.map((el: BackgroundElement, i: number) => (
      <div
        key={`${variant}-${i}`}
        className={`absolute ${el.position} ${el.size} ${el.className || 'opacity-30'} ${floatingStyles[i % floatingStyles.length]}`}
        style={{ animationDelay: `${i * 0.5}s` }}
        aria-hidden="true"
      >
        {el.icon}
      </div>
    ))
  ), [variant, elements]);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${gradient} ${className}`}>
      {/* Background Elements - using CSS animations instead of Framer Motion */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {renderedElements}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}

// Memoize for performance
export const AnimatedBackground = memo(AnimatedBackgroundComponent);
export default AnimatedBackground;
