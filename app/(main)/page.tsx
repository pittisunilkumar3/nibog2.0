'use client';

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getAllCities, City } from "@/services/cityService"

// Interface for homepage stats
interface HomepageStats {
  userRegistrations: number;
  totalCities: number;
  totalGames: number;
  lastUpdated: string;
  error?: string;
}

// Dynamic Home Hero Slider
function HomeHeroSlider() {
  const [sliderImages, setSliderImages] = useState<string[]>([])
  const [lastFetch, setLastFetch] = useState<number>(0)

  const fetchSliderImages = async (forceRefresh = false) => {
    try {
      const timestamp = Date.now()
      const cacheBust = Math.random().toString(36).substring(7)
      const url = `/api/homepage-sections?t=${timestamp}&cb=${cacheBust}`

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store", // Disable caching
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      const imgs = result.success && Array.isArray(result.data)
        ? result.data
          .filter((img: any) => img.status === "active")
          .map((img: any) => {
            const rel = img.image_path.replace(/^public/, "")
            return rel.startsWith("/") ? rel : "/" + rel
          })
        : []

      setSliderImages(imgs)
      setLastFetch(timestamp)

    } catch (error) {
      setSliderImages([])
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchSliderImages()
  }, [])

  // Periodic refresh every 5 minutes instead of 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSliderImages()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Listen for focus events to refresh when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now()
      if (now - lastFetch > 10000) {
        fetchSliderImages()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [lastFetch])

  // Listen for localStorage changes (notifications from admin panel)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'homeSliderUpdate' || e.key === 'homeSliderClearCache' || e.key === 'homeSliderDeleteComplete') {

        if (e.key === 'homeSliderClearCache' || e.key === 'homeSliderDeleteComplete') {
          setSliderImages([]) // Clear current images immediately

          setTimeout(() => {
            fetchSliderImages(true) // Force refresh after clearing
          }, 100)
        } else {
          fetchSliderImages(true) // Force refresh
        }

        // Clear all related notifications
        localStorage.removeItem('homeSliderUpdate')
        localStorage.removeItem('homeSliderClearCache')
        localStorage.removeItem('homeSliderDeleteComplete')
        localStorage.removeItem('homeSlideCacheBust')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // Also check for updates on component mount
    const checkForUpdates = () => {
      const updateFlag = localStorage.getItem('homeSliderUpdate')
      const clearCacheFlag = localStorage.getItem('homeSliderClearCache')
      const deleteCompleteFlag = localStorage.getItem('homeSliderDeleteComplete')
      const cacheBustFlag = localStorage.getItem('homeSlideCacheBust')

      if (updateFlag || clearCacheFlag || deleteCompleteFlag || cacheBustFlag) {

        if (clearCacheFlag || deleteCompleteFlag) {
          setSliderImages([])
        }

        fetchSliderImages(true) // Force refresh

        // Clear all notifications
        localStorage.removeItem('homeSliderUpdate')
        localStorage.removeItem('homeSliderClearCache')
        localStorage.removeItem('homeSliderDeleteComplete')
        localStorage.removeItem('homeSlideCacheBust')
      }
    }

    checkForUpdates()

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // If no images, show default background
  if (sliderImages.length === 0) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 opacity-40 dark:opacity-25">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,190,255,0.6),rgba(255,182,193,0.6))]"></div>
      </div>
    )
  }

  // For single image, don't duplicate
  const loopImages = sliderImages.length === 1
    ? sliderImages
    : [...sliderImages, sliderImages[0]]

  // Calculate dynamic width and animation class
  const totalImages = loopImages.length
  const containerWidth = totalImages * 100 // Each image is 100% of container width
  const imageWidth = 100 / totalImages // Each image takes equal portion

  // Determine animation class based on number of original images
  const getAnimationClass = (count: number) => {
    if (count === 1) return "animate-slide-slow-1"
    if (count === 2) return "animate-slide-slow-2"
    if (count === 3) return "animate-slide-slow-3"
    if (count === 4) return "animate-slide-slow-4"
    if (count === 5) return "animate-slide-slow-5"
    if (count === 6) return "animate-slide-slow-6"
    return "animate-slide-slow" // fallback for more than 6
  }

  const animationClass = getAnimationClass(sliderImages.length)

  return (
    <div
      className={`absolute inset-y-0 left-0 flex ${animationClass}`}
      style={{ width: `${containerWidth}%` }}
    >
      {loopImages.map((src, i) => (
        <div
          key={`heroimg-${i}`}
          className="flex-none h-full"
          style={{ width: `${imageWidth}%` }}
        >
          <img
            src={src}
            alt="Home Hero"
            className="w-full h-full object-cover opacity-40 dark:opacity-25"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import CitySelector from "@/components/city-selector"
import AgeSelector from "@/components/age-selector"
import { AnimatedTestimonials } from "@/components/animated-testimonials"
import dynamic from 'next/dynamic'

const DynamicTestimonialsSection = dynamic(
  () => import('@/components/dynamic-testimonials').then(mod => ({ default: mod.DynamicTestimonialsSection })),
  {
    ssr: false,
    loading: () => (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Children's Parents Speak for Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    )
  }
)











import { Award, MapPin } from "lucide-react"
import { AnimatedBackground } from "@/components/animated-background"
import HomepageGamesSection from "@/components/homepage-games-section"
import { PartnersSection } from "@/components/partners-section"

// Custom hook for homepage stats
function useHomepageStats() {
  const [stats, setStats] = useState<HomepageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/homepage-stats', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Homepage: Error fetching stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stats');
      // Set fallback stats
      setStats({
        userRegistrations: 1500,
        totalCities: 21,
        totalGames: 16,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 minutes instead of 5 minutes
    const interval = setInterval(fetchStats, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading, error };
}

// Cities Section Component
function CitiesSection() {
  const [cities, setCities] = useState<City[]>([]);
  const [showAllCities, setShowAllCities] = useState(false);
  const [visibleCount, setVisibleCount] = useState(11);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);

  useEffect(() => {
    const fetchCitiesData = async () => {
      try {
        setIsCitiesLoading(true);
        const data = await getAllCities();
        // Filter for active cities
        const activeCities = data.filter(city => city.is_active === true || city.is_active === 1);
        setCities(activeCities);
      } catch (err) {
        console.error("Failed to fetch cities for homepage:", err);
      } finally {
        setIsCitiesLoading(false);
      }
    };
    fetchCitiesData();
  }, []);

  // Calculate number of cities to show based on screen size
  const calculateVisibleCount = () => {
    if (typeof window === 'undefined') return 11;
    if (window.innerWidth >= 1024) return 11;
    if (window.innerWidth >= 768) return 7;
    if (window.innerWidth >= 640) return 5;
    return 3;
  };

  // Update visible count on mount and resize
  useEffect(() => {
    setVisibleCount(calculateVisibleCount());

    const handleResize = () => {
      if (!showAllCities) {
        setVisibleCount(calculateVisibleCount());
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showAllCities]);

  // Toggle between showing all cities and initial count
  const toggleShowAll = () => {
    setShowAllCities(!showAllCities);
  };

  // Determine which cities to show
  const displayCities = showAllCities ? cities : cities.slice(0, visibleCount);

  if (isCitiesLoading && cities.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {displayCities.map((city) => (
          <Link key={city.id} href={`/events?city=${city.city_name.toLowerCase()}`}>
            <Card className="group h-full flex flex-col justify-center transition-all hover:border-primary hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-primary">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center h-full">
                <MapPin className="mb-2 h-6 w-6 text-muted-foreground group-hover:text-primary" />
                <span className="text-lg font-medium group-hover:text-primary dark:text-white uppercase">{city.city_name}</span>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* Show More/Less Button - only if more cities exist than visible */}
        {cities.length > visibleCount && (
          <div
            onClick={toggleShowAll}
            className="flex items-center justify-center cursor-pointer group"
          >
            <Card className="h-full w-full flex items-center justify-center transition-all hover:border-primary hover:shadow-sm dark:bg-slate-800/90 dark:hover:border-primary group-hover:bg-primary/5">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <div className="w-8 h-8 mb-2 flex items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 dark:bg-primary/20 dark:group-hover:bg-primary/30">
                  {showAllCities ? (
                    <span className="text-primary font-bold text-lg">−</span>
                  ) : (
                    <span className="text-primary font-bold text-lg">+</span>
                  )}
                </div>
                <span className="font-medium text-primary">
                  {showAllCities ? 'Show Less' : 'Show More'}
                </span>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// Dynamic Stats Component
function DynamicStatsSection({ stats, isLoading, error }: { stats: HomepageStats | null, isLoading: boolean, error: string | null }) {
  // Format numbers with + suffix for display
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${Math.floor(count / 100) / 10}k+`;
    }
    return `${count}+`;
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-sunshine-400 via-coral-400 to-mint-400 overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.3),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">🏆 NIBOG by the Numbers 🏆</h2>
          <p className="text-white/90 text-lg">Celebrating achievements across India</p>
        </div>

        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-3">
          <div className="group">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 rounded-3xl">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce-gentle">👶</div>
                  <h3 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 to-coral-600">
                    {isLoading ? (
                      <div className="animate-pulse bg-gradient-to-r from-sunshine-300 to-coral-300 rounded h-12 w-24 mx-auto"></div>
                    ) : (
                      formatCount(stats?.userRegistrations || 1500)
                    )}
                  </h3>
                  <p className="text-neutral-charcoal font-semibold text-lg">Happy Registrations</p>
                  <p className="text-neutral-charcoal/70 text-sm">Little champions ready to play!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 rounded-3xl">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>🎮</div>
                  <h3 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-coral-600 to-mint-600">
                    {isLoading ? (
                      <div className="animate-pulse bg-gradient-to-r from-coral-300 to-mint-300 rounded h-12 w-16 mx-auto"></div>
                    ) : (
                      stats?.totalGames || 16
                    )}
                  </h3>
                  <p className="text-neutral-charcoal font-semibold text-lg">Exciting Games</p>
                  <p className="text-neutral-charcoal/70 text-sm">From crawling to racing!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="group">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 rounded-3xl">
              <CardContent className="pt-8 pb-8">
                <div className="space-y-4">
                  <div className="text-6xl animate-bounce-gentle" style={{ animationDelay: '1s' }}>🏙️</div>
                  <h3 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-mint-600 to-sunshine-600">
                    {isLoading ? (
                      <div className="animate-pulse bg-gradient-to-r from-mint-300 to-sunshine-300 rounded h-12 w-16 mx-auto"></div>
                    ) : (
                      stats?.totalCities || 21
                    )}
                  </h3>
                  <p className="text-neutral-charcoal font-semibold text-lg">Cities Across India</p>
                  <p className="text-neutral-charcoal/70 text-sm">Bringing joy nationwide!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-semibold">
            <span className="animate-sparkle">⭐</span>
            <span>Join thousands of happy families!</span>
            <span className="animate-sparkle" style={{ animationDelay: '1s' }}>⭐</span>
          </div>
          {error && (
            <p className="text-white/70 text-xs mt-2">
              Stats refreshed: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'Never'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { stats, isLoading, error } = useHomepageStats();

  return (
    <AnimatedBackground variant="home">
      <div className="flex flex-col gap-12 pb-8">
        {/* Hero Section */}
        <section className="relative">
          {/* Semi-transparent overlay - adjusted for better balance */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/20 dark:from-black/50 dark:to-black/30 -z-10" />

          {/* Background image overlay */}
          <div className="absolute inset-0 overflow-hidden -z-20">
            <div className="absolute inset-0 w-full h-full overflow-hidden">

              <HomeHeroSlider />

            </div>
          </div>
          <div className="container relative z-10 flex flex-col items-center justify-center gap-8 py-20 text-center md:py-28 lg:py-36">
            {/* Floating decorative elements */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-sunshine-400 rounded-full opacity-20 animate-bounce-gentle"></div>
            <div className="absolute top-20 right-20 w-12 h-12 bg-coral-400 rounded-full opacity-30 animate-float-delayed"></div>
            <div className="absolute bottom-20 left-20 w-20 h-20 bg-mint-400 rounded-full opacity-25 animate-float-slow"></div>

            <Badge className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-sunshine-400 to-rainbow-orange text-neutral-charcoal rounded-full shadow-lg animate-bounce-gentle border-2 border-sunshine-500">
              🏆 New India Baby Olympics Games 🏆
            </Badge>

            <div className="relative z-20 space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="block text-neutral-charcoal dark:text-white font-extrabold">
                  NIBOG
                </span>
                <span className="relative block mt-2">
                  <span
                    className="relative z-10 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sunshine-500 via-coral-500 to-mint-500 bg-[length:200%_auto] animate-rainbow-shift"
                    style={{
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    From Crawling to Racing
                  </span>
                  <span className="absolute inset-0 z-0 text-transparent bg-clip-text bg-gradient-to-r from-sunshine-300 via-coral-300 to-mint-300 bg-[length:200%_auto] animate-rainbow-shift opacity-50 blur-sm">
                    From Crawling to Racing
                  </span>
                </span>
              </h1>

              {/* Fun emoji decorations */}
              <div className="flex justify-center gap-4 text-4xl animate-bounce-gentle">
                <span className="animate-sparkle">🏃‍♀️</span>
                <span className="animate-sparkle" style={{ animationDelay: '0.5s' }}>👶</span>
                <span className="animate-sparkle" style={{ animationDelay: '1s' }}>🏆</span>
                <span className="animate-sparkle" style={{ animationDelay: '1.5s' }}>🎉</span>
              </div>
            </div>

            <p className="max-w-[800px] text-lg md:text-xl text-neutral-charcoal/80 dark:text-white/80 leading-relaxed">
              India's biggest baby Olympic games, executing in <span className="font-bold text-sunshine-600">{stats?.totalCities || 21} cities</span> across India.
              Join us for exciting baby games including <span className="font-semibold text-coral-600">crawling races</span>,
              <span className="font-semibold text-mint-600"> baby walker</span>,
              <span className="font-semibold text-lavender-600"> running races</span>, and more for children aged
              <span className="font-bold text-sunshine-600">5-84 months</span>.
            </p>

            <div className="w-full max-w-lg space-y-4 sm:space-y-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="w-full py-6 sm:py-8 text-lg sm:text-xl font-bold bg-gradient-to-r from-sunshine-400 via-coral-400 to-mint-400 hover:from-sunshine-500 hover:via-coral-500 hover:to-mint-500 text-neutral-charcoal shadow-2xl transform transition-all hover:scale-105 sm:hover:scale-110 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white/50 animate-medal-shine touch-manipulation"
                  asChild
                >
                  <Link href="/register-event">
                    🎯 Register Now for NIBOG 2025 🎯
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
                      📅 Browse Events
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white/80 hover:bg-white border-2 border-coral-400 text-coral-700 hover:text-coral-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all touch-manipulation"
                    asChild
                  >
                    <Link href="/baby-olympics">
                      🎮 View Games
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        {/* <section className="container">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Upcoming NIBOG Events</h2>
              <Button variant="link" asChild className="gap-1">
                <Link href="/events">
                  View All →
                </Link>
              </Button>
            </div>
            <p className="text-muted-foreground dark:text-gray-700">Join us for these exciting events featuring multiple baby games in cities across India</p>
          </div>
        </div>
      </section> */}

        {/* Partners Section */}
        <PartnersSection />

        {/* NIBOG Games by Age Group Section - Now Dynamic */}
        <HomepageGamesSection />

        {/* Why Choose NIBOG Section */}
        <section className="relative py-20 bg-gradient-to-r from-sunshine-50 via-coral-50 to-mint-50 dark:from-sunshine-900/10 dark:via-coral-900/10 dark:to-mint-900/10">
          {/* Floating decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-sunshine-300 rounded-full opacity-20 animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-coral-300 rounded-full opacity-20 animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-mint-300 rounded-full opacity-20 animate-bounce-gentle"></div>
          <div className="absolute bottom-20 right-1/4 w-18 h-18 bg-lavender-300 rounded-full opacity-20 animate-float-slow"></div>

          <div className="container relative z-10">
            <div className="flex flex-col gap-12 text-center">
              <div className="space-y-4">
                <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-coral-400 to-mint-400 text-neutral-charcoal rounded-full">
                  💪 Benefits
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-coral-600 via-mint-600 to-sunshine-600">
                    WHY SPORTS ARE IMPORTANT TO CHILDREN
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-[800px] text-lg text-neutral-charcoal/70 dark:text-white/70">
                  The Child Olympic Games are a wonderful opportunity to get kids excited about sport, national pride and counting medals
                </p>
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="card-baby-gradient group hover:scale-105 transition-all duration-300">
                  <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
                    <div className="relative">
                      <div className="rounded-full bg-gradient-to-br from-sunshine-400 to-sunshine-600 p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-medal-shine">
                        <span className="text-4xl">💪</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-coral-400 rounded-full animate-sparkle"></div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">Physical Development</h3>
                    <p className="text-center text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                      Physical activity stimulates growth and leads to improved physical and emotional health, building strong foundations for life.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-baby-gradient group hover:scale-105 transition-all duration-300">
                  <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
                    <div className="relative">
                      <div className="rounded-full bg-gradient-to-br from-coral-400 to-coral-600 p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-medal-shine">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-mint-400 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">Learning Resilience</h3>
                    <p className="text-center text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                      Exposing kids to healthy challenges builds character, confidence, and the ability to overcome obstacles with grace.
                    </p>
                  </CardContent>
                </Card>

                <Card className="card-baby-gradient group hover:scale-105 transition-all duration-300">
                  <CardContent className="flex flex-col items-center gap-6 pt-8 pb-8">
                    <div className="relative">
                      <div className="rounded-full bg-gradient-to-br from-mint-400 to-mint-600 p-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-medal-shine">
                        <span className="text-4xl">🎨</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-sunshine-400 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-charcoal dark:text-white">Creativity & Imagination</h3>
                    <p className="text-center text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                      Sport allows children to use their creativity while developing imagination, dexterity, and physical, cognitive, and emotional strength.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <Button
                  size="lg"
                  className="btn-baby-secondary text-lg px-8 py-4"
                  asChild
                >
                  <Link href="/about">
                    🌟 Learn More About NIBOG
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section - Now Dynamic */}
        <DynamicTestimonialsSection />

        {/* Cities Section */}
        <section className="bg-muted/50 py-12">
          <div className="container">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 text-center">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">NIBOG Events Across India</h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground">Find NIBOG events in {stats?.totalCities || 21} cities across India</p>
              </div>
              <div className="w-full">
                <CitiesSection />
              </div>
            </div>
          </div>
        </section>



        {/* Stats Section - Now Dynamic */}
        <DynamicStatsSection stats={stats} isLoading={isLoading} error={error} />

        {/* CTA Section */}
        <section className="container py-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-lavender-200 via-sunshine-100 to-coral-200 dark:from-lavender-800 dark:via-sunshine-800 dark:to-coral-800 p-12 text-center md:p-16 overflow-hidden shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 w-12 h-12 bg-sunshine-400 rounded-full opacity-30 animate-bounce-gentle"></div>
            <div className="absolute top-8 right-8 w-16 h-16 bg-coral-400 rounded-full opacity-30 animate-float"></div>
            <div className="absolute bottom-4 left-8 w-10 h-10 bg-mint-400 rounded-full opacity-30 animate-float-delayed"></div>
            <div className="absolute bottom-8 right-4 w-14 h-14 bg-lavender-400 rounded-full opacity-30 animate-bounce-gentle"></div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <Badge className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-sunshine-500 to-coral-500 text-white rounded-full shadow-lg">
                  🚀 NIBOG 2025
                </Badge>
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                    Ready to Join the Fun?
                  </span>
                </h2>
                <p className="mx-auto max-w-[700px] text-lg text-neutral-charcoal/80 dark:text-white/80 leading-relaxed">
                  Join thousands of families across India in celebrating your little champion's journey from crawling to racing!
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="btn-baby-primary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 shadow-2xl hover:shadow-3xl touch-manipulation"
                  asChild
                >
                  <Link href="/register-event">
                    🎯 Register Now - Limited Spots!
                  </Link>
                </Button>
                <Button
                  size="lg"
                  className="btn-baby-secondary text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 shadow-2xl hover:shadow-3xl touch-manipulation"
                  asChild
                >
                  <Link href="/events">
                    📅 Browse All Events
                  </Link>
                </Button>
              </div>

              <div className="flex justify-center items-center gap-4 text-sm text-neutral-charcoal/70 dark:text-white/70">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-sunshine-400 rounded-full animate-pulse"></span>
                  <span>Medal for All</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-coral-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                  <span>E-certificate for All</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-coral-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                  <span>Free Gifts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-mint-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></span>
                  <span>Professional Photos</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AnimatedBackground>
  )
}
