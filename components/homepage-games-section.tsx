'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface Game {
  id: number;
  name: string;
  description: string;
  minAge: number;
  maxAge: number;
  duration: number;
  categories: string[];
  imageUrl: string;
  imagePriority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function HomepageGamesSectionComponent() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Add timestamp to bust cache
      const timestamp = Date.now();
      const response = await fetch(`/api/games-with-images?t=${timestamp}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        setGames([]);
        setIsLoading(false);
        return;
      }

      setGames(data);

    } catch (error) {
      console.error('❌ Homepage: Error fetching games:', error);
      setError(error instanceof Error ? error.message : 'Failed to load games');
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();

    // Refresh games every 10 minutes instead of 2 minutes
    const interval = setInterval(fetchGames, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to format age range
  const formatAgeRange = (minAge: number, maxAge: number) => {
    const minMonths = minAge;
    const maxMonths = maxAge;

    if (minMonths < 12 && maxMonths < 12) {
      return `${minMonths}-${maxMonths} months`;
    } else if (minMonths < 12) {
      const maxYears = Math.floor(maxMonths / 12);
      return `${minMonths} months - ${maxYears} years`;
    } else {
      const minYears = Math.floor(minMonths / 12);
      const maxYears = Math.floor(maxMonths / 12);
      return `${minYears}-${maxYears} years`;
    }
  };

  // Helper function to get game emoji based on categories
  const getGameEmoji = (categories: string[], gameName: string) => {
    const name = gameName.toLowerCase();
    const cats = categories.map(c => c.toLowerCase());

    if (name.includes('crawling') || cats.includes('crawling')) return '🍼';
    if (name.includes('walker') || cats.includes('walker')) return '🚶‍♀️';
    if (name.includes('running') || name.includes('race') || cats.includes('race')) return '🏃‍♂️';
    if (name.includes('jumping') || cats.includes('jumping') || cats.includes('jump')) return '🦘';
    if (name.includes('ball') || cats.includes('ball')) return '⚽';
    if (name.includes('ring') || cats.includes('ring')) return '💍';
    if (name.includes('shot put') || cats.includes('shot put')) return '🏋️‍♀️';
    if (name.includes('high jump') || cats.includes('high')) return '🤸‍♀️';
    if (name.includes('hurdle') || name.includes('toddle')) return '🏃‍♀️';

    return '🎮'; // Default game emoji
  };

  // Helper function to get gradient colors for game cards
  const getGradientColors = (index: number) => {
    const colors = [
      'from-sunshine-500/80 via-sunshine-300/40 to-transparent',
      'from-coral-500/80 via-coral-300/40 to-transparent',
      'from-mint-500/80 via-mint-300/40 to-transparent',
      'from-lavender-500/80 via-lavender-300/40 to-transparent',
    ];

    return colors[index % colors.length];
  };


  // Debug output for API data and errors
  if (isLoading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col gap-12 text-center">
            <div className="space-y-4">
              <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full">
                🎯 Age Groups
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                  NIBOG Games by Age Group
                </span>
              </h2>
              <p className="mt-4 text-lg text-neutral-charcoal/70 dark:text-white/70 max-w-2xl mx-auto">
                Loading exciting games for your little champions...
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="card-baby-gradient overflow-hidden h-full animate-pulse">
                  <div className="relative h-48 bg-gray-300 dark:bg-gray-700"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || games.length === 0) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col gap-12 text-center">
            <div className="space-y-4">
              <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full">
                🎯 Age Groups
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                  NIBOG Games by Age Group
                </span>
              </h2>
              <p className="mt-4 text-lg text-neutral-charcoal/70 dark:text-white/70 max-w-2xl mx-auto">
                {error ? 'Unable to load games at the moment' : 'No games available'}
              </p>
            </div>
            <div className="mt-8">
              <Button
                size="lg"
                className="btn-baby-primary text-lg px-8 py-4"
                asChild
              >
                <Link href="/baby-olympics">
                  🎮 Explore All Games
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-mint-300 rounded-full opacity-10 animate-bounce-gentle"></div>

      <div className="container relative z-10">
        <div className="flex flex-col gap-12 text-center">
          <div className="space-y-4">
            <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full">
              🎯 Featured Games
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                NIBOG Games by Age Group
              </span>
            </h2>
            <p className="mt-4 text-lg text-neutral-charcoal/70 dark:text-white/70 max-w-2xl mx-auto">
              Featured {games.length} games designed for every stage of your little champion's development
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game, index) => (
              <Link key={game.id} href={`/events?gameId=${game.id}`} className="group">
                <Card className="card-baby-gradient overflow-hidden h-full">
                  <div className="relative h-48">
                    <Image
                      src={game.imageUrl || '/images/default-game.jpg'}
                      alt={game.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                      onError={(e) => {
                        // Fallback to a default image if the game image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-game.jpg';
                      }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${getGradientColors(index)}`} />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 rounded-full p-2 text-2xl animate-bounce-gentle">
                        {getGameEmoji(game.categories, game.name)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                      <p className="text-white/90 font-semibold">{formatAgeRange(game.minAge, game.maxAge)}</p>
                      <p className="text-white/80 text-sm mt-2 line-clamp-2">
                        {game.description.length > 80
                          ? `${game.description.substring(0, 80)}...`
                          : game.description
                        }
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {game.categories.slice(0, 2).map((category) => (
                          <Badge key={category} className="bg-white/20 text-white text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <Button
              size="lg"
              className="btn-baby-primary text-lg px-8 py-4"
              asChild
            >
              <Link href="/baby-olympics">
                🎮 Explore All Games
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Export without memo to ensure updates are always reflected
export default HomepageGamesSectionComponent;
