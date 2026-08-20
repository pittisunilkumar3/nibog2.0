/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Image from 'next/image';
import { Badge } from "./ui/badge";

interface NibogLogoProps {
  className?: string;
}

export function NibogLogo({ className }: NibogLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative h-12 w-auto" style={{ aspectRatio: '1517/1037' }}>
        <Image
          src="/nibog-logo-2026.jpg"
          alt="NIBOG Logo"
          fill
          className="object-contain rounded-md"
          priority
        />
      </div>

      <Badge variant="outline" className="ml-3 hidden xl:inline-flex border-primary text-xs">
        India's Biggest Baby Games
      </Badge>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
