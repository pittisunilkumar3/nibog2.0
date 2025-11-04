import React from 'react';
import Image from 'next/image';
import { Badge } from "./ui/badge";

interface NibogLogoProps {
  className?: string;
}

export function NibogLogo({ className }: NibogLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative h-12 w-auto" style={{ aspectRatio: '462/316' }}>
        <Image
          src="/noboggamelogo.svg"
          alt="NIBOG Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <Badge variant="outline" className="ml-3 hidden md:inline-flex border-primary text-xs">
        India's Biggest Baby Games
      </Badge>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
