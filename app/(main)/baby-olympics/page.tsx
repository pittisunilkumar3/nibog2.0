"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Medal, Trophy, Award, Star, Loader2 } from "lucide-react"

import { AnimatedBackground } from "@/components/animated-background"
import AgeSelector from "@/components/age-selector"
import CitySelector from "@/components/city-selector"
import { formatPrice } from "@/lib/utils"
import { getAllActiveGamesWithImages, GameWithImage } from "@/services/babyGameService"

// Metadata is handled in layout.tsx for client components

// Helper function to format age range
const formatAgeRange = (minAge: number, maxAge: number): string => {
  // Convert months to years for better readability
  const minYears = Math.floor(minAge / 12);
  const maxYears = Math.floor(maxAge / 12);

  // If both ages are less than 12 months, show in months
  if (maxAge < 12) {
    return `${minAge}-${maxAge} months`;
  }

  // If min age is less than 12 months but max is more, show mixed format
  if (minAge < 12 && maxAge >= 12) {
    return `${minAge} months - ${maxYears} years`;
  }

  // If both are 12+ months, show in years
  if (minAge >= 12) {
    return `${minYears}-${maxYears} years`;
  }

  return `${minAge}-${maxAge} months`;
};

// Helper function to get game emoji based on categories and name
const getGameEmoji = (categories: string[], gameName: string): string => {
  const name = gameName.toLowerCase();
  const categoryStr = categories.join(' ').toLowerCase();

  // Check game name first for specific matches
  if (name.includes('crawling')) return '🍼';
  if (name.includes('walker')) return '🚶‍♀️';
  if (name.includes('running') || name.includes('race')) return '🏃‍♂️';
  if (name.includes('jump') || name.includes('high')) return '🤸‍♀️';
  if (name.includes('shot put')) return '🏋️‍♀️';
  if (name.includes('ball') && name.includes('jump')) return '⚽';
  if (name.includes('ring')) return '💍';
  if (name.includes('hurdle') || name.includes('toddle')) return '🏃‍♀️';

  // Check categories
  if (categoryStr.includes('crawling')) return '🍼';
  if (categoryStr.includes('walker')) return '🚶‍♀️';
  if (categoryStr.includes('race') || categoryStr.includes('running')) return '🏃‍♂️';
  if (categoryStr.includes('jump')) return '🤸‍♀️';
  if (categoryStr.includes('ball')) return '⚽';
  if (categoryStr.includes('ring')) return '💍';
  if (categoryStr.includes('shot')) return '🏋️‍♀️';

  return '🎮'; // Default game emoji
};

// Helper function to use image URL (already transformed by API)
const getImageUrl = (imageUrl: string): string => {
  // The API already transforms the URL, so we can use it directly
  return imageUrl || '';
};

export default function BabyOlympicsPage() {
  const [games, setGames] = useState<GameWithImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch games from API
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get all active games with images for Baby Olympics page
        const gamesData = await getAllActiveGamesWithImages()
        setGames(gamesData)

      } catch (err: any) {
        console.error("Failed to fetch games:", err)
        setError(err.message || "Failed to load games")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, [])

  return (
    <AnimatedBackground variant="olympics">
      <div className="flex flex-col gap-12 pb-8">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/baby-olympics/hero-bg.jpg"
            alt="NIBOG background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-amber-100 to-yellow-50 opacity-40" />
        </div>
        <div className="container relative flex flex-col items-center justify-center gap-6 sm:gap-8 py-16 sm:py-20 md:py-28 lg:py-36 text-center px-4 sm:px-6">
          {/* Floating decorative elements - hidden on mobile for better performance */}
          <div className="hidden sm:block absolute top-10 left-10 w-12 sm:w-16 h-12 sm:h-16 bg-sunshine-400 rounded-full opacity-30 animate-bounce-gentle"></div>
          <div className="hidden sm:block absolute top-20 right-20 w-10 sm:w-12 h-10 sm:h-12 bg-coral-400 rounded-full opacity-40 animate-float-delayed"></div>
          <div className="hidden sm:block absolute bottom-20 left-20 w-16 sm:w-20 h-16 sm:h-20 bg-mint-400 rounded-full opacity-35 animate-float-slow"></div>

          <Badge className="px-4 sm:px-8 py-3 sm:py-4 text-lg sm:text-xl font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full shadow-xl animate-bounce-gentle border-2 sm:border-4 border-white/50">
            <span className="hidden sm:inline">🏆 New India Baby Olympics Games 🏆</span>
            <span className="sm:hidden">🏆 NIBOG Games 🏆</span>
          </Badge>

          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
              <span className="block text-neutral-charcoal dark:text-white font-extrabold mb-2 sm:mb-4">
                NIBOG
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-500 via-coral-500 to-mint-500 bg-[length:200%_auto] animate-rainbow-shift">
                Game of Baby Thrones
              </span>
            </h1>

            {/* Fun emoji decorations */}
            <div className="flex justify-center gap-3 sm:gap-6 text-2xl sm:text-4xl">
              <span className="animate-bounce-gentle">👑</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '0.5s'}}>👶</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1s'}}>🏆</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1.5s'}}>⚔️</span>
            </div>
          </div>

          <p className="max-w-[800px] text-base sm:text-lg md:text-xl text-neutral-charcoal/80 dark:text-white/80 leading-relaxed px-4 sm:px-0">
            Step into the World of Baby Games and watch while they <span className="font-bold text-sunshine-600">Kick</span>,
            <span className="font-bold text-coral-600"> Crawl</span>,
            <span className="font-bold text-mint-600"> Conquer</span>.
            India's biggest baby Olympic games in <span className="font-bold text-sunshine-600">21 cities</span>.
          </p>

          <div className="w-full max-w-lg space-y-4 sm:space-y-6 px-4 sm:px-0">
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                size="lg"
                className="w-full py-6 sm:py-8 text-lg sm:text-xl font-bold bg-gradient-to-r from-sunshine-400 via-coral-400 to-mint-400 hover:from-sunshine-500 hover:via-coral-500 hover:to-mint-500 text-neutral-charcoal shadow-2xl transform transition-all hover:scale-105 sm:hover:scale-110 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white/50 animate-medal-shine touch-manipulation"
                asChild
              >
                <Link href="/register-event">
                  <span className="hidden sm:inline">👑 Claim Your Baby's Throne - Register Now!</span>
                  <span className="sm:hidden">👑 Register Now!</span>
                </Link>
              </Button>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white/80 hover:bg-white border-2 border-sunshine-400 text-sunshine-700 hover:text-sunshine-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all touch-manipulation"
                  asChild
                >
                  <Link href="/events">
                    📅 View Events
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white/80 hover:bg-white border-2 border-coral-400 text-coral-700 hover:text-coral-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all touch-manipulation"
                  asChild
                >
                  <Link href="/about">
                    📖 Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-mint-300 rounded-full opacity-10 animate-bounce-gentle"></div>

        <div className="container relative z-10">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full w-fit">
                🎯 About NIBOG
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                  What is NIBOG?
                </span>
              </h2>
              <p className="text-lg text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                NIBOG (New India Baby Olympics Games) is India's biggest baby Olympic games platform, executing in 21 cities across India. Our games are designed to encourage physical development, confidence, and social interaction in a fun, competitive environment for babies and young children.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-sunshine-400 to-sunshine-600 rounded-full p-3 shadow-lg animate-medal-shine">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">🎮 {games.length || 'Multiple'} Different Games</h3>
                  <p className="text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">From crawling races to running races, we have games for all ages from 5-84 months</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-coral-400 to-coral-600 rounded-full p-3 shadow-lg animate-medal-shine">
                  <Medal className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">🏙️ 21 Cities Across India</h3>
                  <p className="text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">NIBOG events are held in 21 cities across India, making it accessible to families nationwide</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-mint-400 to-mint-600 rounded-full p-3 shadow-lg animate-medal-shine">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">🏆 Medals & Certificates</h3>
                  <p className="text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">Every participant receives a medal and certificate, recognizing their achievement</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-lavender-400 to-lavender-600 rounded-full p-3 shadow-lg animate-medal-shine">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">📸 Professional Photography</h3>
                  <p className="text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">Capture these precious moments with our professional photographers at every event</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-96 w-full overflow-hidden rounded-3xl shadow-2xl border-4 border-white/50 group">
              <Image
                src="/images/baby-olympics/about-image.jpg"
                alt="NIBOG Baby Olympics"
                fill
                className="object-cover object-[10%_30%] transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <p className="text-neutral-charcoal font-bold text-center">
                    🌟 Where Champions Are Born! 🌟
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Games Section */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 text-center">
              <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full mx-auto">
                🎮 All NIBOG Games
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl dark:text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                  Complete Games Collection
                </span>
              </h2>
              <p className="mx-auto max-w-[700px] text-lg text-muted-foreground dark:text-white leading-relaxed">
                Explore all {games.length} exciting NIBOG games available across India. Each game is designed for specific age groups to ensure safe, fun, and developmental play.
              </p>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                  <p className="text-muted-foreground">Loading games...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">😔</div>
                <h3 className="text-xl font-semibold text-neutral-charcoal">Failed to Load Games</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {error}. Please try refreshing the page.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Games Grid */}
            {!isLoading && !error && games.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {games.map((game) => (
                  <Card key={game.id} className="group overflow-hidden transition-all hover:shadow-lg hover:scale-105 duration-300">
                    <div className="relative h-48">
                      <Image
                        src={getImageUrl(game.imageUrl)}
                        alt={game.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to a default image if the game image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-game.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 rounded-full p-2 text-2xl animate-bounce-gentle">
                          {getGameEmoji(game.categories, game.name)}
                        </div>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold border-0">
                          Priority {game.imagePriority}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{game.name}</h3>
                        <p className="text-white/90 font-semibold text-sm">{formatAgeRange(game.minAge, game.maxAge)}</p>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                          {game.description || "Fun and exciting baby game designed for skill development and physical growth"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Duration: {game.duration} minutes</span>
                        </div>
                        {game.categories && game.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {game.categories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {game.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{game.categories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <div className="flex items-center justify-between border-t bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
                      <div className="text-xs">
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          Available
                        </span>
                      </div>
                      <Button size="sm" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg" asChild>
                        <Link href="/events">Find Events</Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* No Games State */}
            {!isLoading && !error && games.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="text-6xl">🎮</div>
                <h3 className="text-xl font-semibold text-neutral-charcoal">No Games Available</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  There are currently no games available. Check back soon for exciting new games!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>


      </div>
    </AnimatedBackground>
  );
}
