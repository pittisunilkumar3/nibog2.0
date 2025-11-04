interface BackgroundElement {
  icon: string;
  size: string;
  position: string;
  className?: string;
}

interface PageBackgroundConfig {
  gradient: string;
  elements: BackgroundElement[];
}

export const pageBackgrounds = {
  home: {
    gradient: 'bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      { icon: '⭐', size: 'text-2xl', position: 'top-1/4 left-1/5' },
      { icon: '☁️', size: 'text-4xl', position: 'top-1/3 right-1/4' },
      { icon: '🎈', size: 'text-3xl', position: 'bottom-1/4 left-1/3' },
      { icon: '🌈', size: 'text-3xl', position: 'top-1/6 right-1/6' },
      { icon: '🌞', size: 'text-3xl', position: 'top-1/5 left-1/10' },
      { icon: '🎨', size: 'text-2xl', position: 'bottom-1/3 right-1/5' },
      { icon: '🎯', size: 'text-2xl', position: 'top-3/4 right-1/4' },
    ],
  },
  events: {
    gradient: 'bg-gradient-to-br from-purple-50 via-green-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      { icon: '🎉', size: 'text-3xl', position: 'top-1/5 right-1/4' },
      { icon: '✨', size: 'text-2xl', position: 'bottom-1/3 left-1/4' },
      { icon: '📅', size: 'text-2xl', position: 'top-2/3 right-1/3' },
      { icon: '🥇', size: 'text-3xl', position: 'top-1/3 left-1/5' },
      { icon: '🏆', size: 'text-4xl', position: 'bottom-1/4 right-1/5' },
      { icon: '🎊', size: 'text-2xl', position: 'top-1/6 left-1/3' },
      { icon: '🎪', size: 'text-3xl', position: 'bottom-1/6 left-1/4' },
    ],
  },
  games: {
    gradient: 'bg-gradient-to-br from-pink-100 via-cyan-100 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      { icon: '🎮', size: 'text-4xl', position: 'top-1/4 left-1/4' },
      { icon: '🧩', size: 'text-3xl', position: 'bottom-1/3 right-1/3' },
      { icon: '🎲', size: 'text-2xl', position: 'top-1/2 right-1/4' },
      { icon: '👾', size: 'text-2xl', position: 'top-3/4 left-1/3' },
      { icon: '🎯', size: 'text-3xl', position: 'top-1/6 right-1/5' },
      { icon: '🎳', size: 'text-3xl', position: 'bottom-1/4 left-1/5' },
      { icon: '🎰', size: 'text-2xl', position: 'top-1/3 right-1/6' },
      { icon: '🎲', size: 'text-2xl', position: 'bottom-1/5 right-1/4' },
    ],
  },
  register: {
    gradient: 'bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      { icon: '✏️', size: 'text-3xl', position: 'top-1/5 right-1/5' },
      { icon: '📝', size: 'text-2xl', position: 'bottom-1/4 left-1/5' },
      { icon: '✅', size: 'text-2xl', position: 'top-3/4 right-1/4' },
      { icon: '📋', size: 'text-3xl', position: 'top-1/3 left-1/4' },
      { icon: '📄', size: 'text-2xl', position: 'bottom-1/3 right-1/6' },
      { icon: '✉️', size: 'text-3xl', position: 'top-1/6 right-1/6' },
      { icon: '📎', size: 'text-2xl', position: 'bottom-1/5 left-1/4' },
    ],
  },
  about: {
    gradient: 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      { icon: '🌱', size: 'text-3xl', position: 'top-1/3 left-1/4', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '🌿', size: 'text-2xl', position: 'bottom-1/3 right-1/4', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '👶', size: 'text-2xl', position: 'top-1/4 right-1/5', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '🌱', size: 'text-3xl', position: 'top-1/6 left-1/6', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '🌟', size: 'text-2xl', position: 'bottom-1/4 left-1/5', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '🏆', size: 'text-3xl', position: 'top-2/3 right-1/6', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
      { icon: '🎯', size: 'text-2xl', position: 'bottom-1/6 right-1/4', className: 'text-emerald-500/30 dark:text-emerald-400/20' },
    ],
  },
  contact: {
    gradient: 'bg-gradient-to-br from-blue-50 to-sky-100 dark:from-gray-900 dark:to-gray-800',
    elements: [
      { icon: '☁️', size: 'text-4xl', position: 'top-1/4 right-1/4' },
      { icon: '💬', size: 'text-3xl', position: 'bottom-1/3 left-1/4' },
      { icon: '📧', size: 'text-2xl', position: 'top-3/4 right-1/3' },
      { icon: '📞', size: 'text-3xl', position: 'top-1/6 left-1/5' },
      { icon: '📍', size: 'text-2xl', position: 'bottom-1/4 right-1/6' },
      { icon: '📱', size: 'text-3xl', position: 'top-1/3 right-1/6' },
      { icon: '📫', size: 'text-2xl', position: 'bottom-1/6 left-1/4' },
    ],
  },
  olympics: {
    gradient: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    elements: [
      // Top corners
      { icon: '🎮', size: 'text-3xl', position: 'top-5 left-5' },
      { icon: '🧩', size: 'text-4xl', position: 'top-5 right-5' },
      
      // Quarter points from top
      { icon: '🎲', size: 'text-3xl', position: 'top-1/4 left-1/4' },
      { icon: '🎯', size: 'text-4xl', position: 'top-1/4 right-1/4' },
      
      // Middle sides
      { icon: '🏆', size: 'text-5xl', position: 'top-1/2 left-10' },
      { icon: '👶', size: 'text-4xl', position: 'top-1/2 right-10' },
      
      // Three-quarter points from top
      { icon: '🎪', size: 'text-3xl', position: 'top-3/4 left-1/3' },
      { icon: '🧸', size: 'text-4xl', position: 'top-3/4 right-1/3' },
      
      // Bottom corners
      { icon: '🏅', size: 'text-3xl', position: 'bottom-5 left-5' },
      { icon: '🎨', size: 'text-4xl', position: 'bottom-5 right-5' },
      
      // Center points
      { icon: '✨', size: 'text-3xl', position: 'top-1/3 left-1/2' },
      { icon: '🌟', size: 'text-3xl', position: 'top-2/3 left-1/2' },
      
      // Additional points
      { icon: '⚽', size: 'text-4xl', position: 'top-1/3 left-1/3' },
      { icon: '🏀', size: 'text-4xl', position: 'top-1/3 right-1/3' },
      { icon: '🏐', size: 'text-4xl', position: 'top-2/3 left-1/3' },
      { icon: '🎾', size: 'text-4xl', position: 'top-2/3 right-1/3' },
    ],
  },
};

export const floatingAnimation = {
  initial: { y: 0 },
  animate: (i: number) => ({
    y: [0, 15, 0],
    transition: {
      duration: 3 + i,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }),
};

export type PageBackground = keyof typeof pageBackgrounds;
