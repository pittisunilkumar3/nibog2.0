export interface BackgroundElement {
  icon: string;
  size: string;
  position: string;
  className?: string;
}

export interface PageBackgroundConfig {
  gradient: string;
  elements: BackgroundElement[];
}

export type PageBackground = keyof typeof import('../background-styles').pageBackgrounds;
