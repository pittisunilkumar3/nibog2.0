'use client'

import { ArrowRight, Baby, Footprints, Goal } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

interface Game {
  id: number
  name: string
  description: string
  minAge: number
  maxAge: number
  categories: string[]
  imageUrl: string
}

type GameCard = {
  key: string
  name: string
  description: string
  age: string
  image: string
  href: string
  isExample?: boolean
}

const fallbackGames: GameCard[] = [
  {
    key: 'crawling',
    name: 'Crawling adventures',
    description: 'A cheerful first race for babies finding their rhythm.',
    age: 'For early movers',
    image: '/images/baby-crawling.jpg',
    href: '/baby-one',
    isExample: true,
  },
  {
    key: 'walker',
    name: 'Baby walker fun',
    description: 'Supported movement, happy cheering and lots of little wins.',
    age: 'For growing walkers',
    image: '/images/baby-walker.jpg',
    href: '/baby-one',
    isExample: true,
  },
  {
    key: 'running',
    name: 'Running races',
    description: 'Short, exciting tracks for confident little runners.',
    age: 'For active explorers',
    image: '/images/running-race.jpg',
    href: '/baby-one',
    isExample: true,
  },
]

function formatAgeRange(minAge: number, maxAge: number) {
  if (minAge < 12 && maxAge < 12) return `${minAge}–${maxAge} months`
  if (minAge < 12) return `${minAge} months–${Math.floor(maxAge / 12)} years`
  return `${Math.floor(minAge / 12)}–${Math.floor(maxAge / 12)} years`
}

export default function HomepageGamesSection() {
  const [games, setGames] = useState<Game[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/games-with-images?t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        })

        if (!response.ok) return
        const payload = await response.json()
        if (isMounted && Array.isArray(payload)) setGames(payload.slice(0, 4))
      } catch {
        // Curated local cards keep discovery useful when the live source is unavailable.
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchGames()
    const interval = window.setInterval(fetchGames, 10 * 60 * 1000)
    return () => {
      isMounted = false
      window.clearInterval(interval)
    }
  }, [])

  const cards: GameCard[] = games.length
    ? games.map((game) => ({
        key: String(game.id),
        name: game.name,
        description: game.description,
        age: formatAgeRange(game.minAge, game.maxAge),
        image: game.imageUrl || '/images/baby-crawling.jpg',
        href: '/events',
      }))
    : fallbackGames

  return (
    <section className="bg-[#edf9f4] py-12 dark:bg-emerald-950/20 sm:py-16" aria-labelledby="games-heading">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <Baby className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Made for every stage
          </p>
          <h2 id="games-heading" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Find a game that feels just right
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
            From first crawls to confident runs, there is a joyful challenge waiting.
          </p>
        </div>

        {isLoading ? (
          <div className="-mx-4 mt-8 flex gap-4 overflow-hidden px-4" role="status" aria-label="Loading games">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="min-w-[82vw] overflow-hidden rounded-3xl bg-white sm:min-w-0 sm:flex-1 dark:bg-slate-900">
                <div className="aspect-[4/3] animate-pulse bg-emerald-100 dark:bg-slate-800" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-emerald-100 dark:bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
          {!games.length && (
            <p className="mx-auto mt-6 max-w-xl rounded-2xl bg-white/80 px-4 py-3 text-center text-sm font-semibold text-emerald-900 dark:bg-white/5 dark:text-emerald-100">
              A preview of typical NIBOG activities. Browse events to see what is currently available near you.
            </p>
          )}
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
            {cards.slice(0, 3).map((game, index) => {
              const Icon = index === 0 ? Footprints : index === 1 ? Baby : Goal
              return (
                <Link
                  key={game.key}
                  href={game.href}
                  className="group min-w-[82vw] snap-center overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_-30px_rgba(21,80,57,0.55)] transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:min-w-0 dark:bg-slate-900"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      sizes="(max-width: 639px) 82vw, (max-width: 1023px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent" />
                    {game.isExample && (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-900">
                        Example activity
                      </span>
                    )}
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-slate-950/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                      <Icon className="h-4 w-4 text-amber-300" aria-hidden="true" />
                      {game.age}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-black text-slate-950 dark:text-white">{game.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{game.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
                      {game.isExample ? 'Learn about the games' : 'Browse upcoming events'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
          </>
        )}

        <div className="mt-6 text-center">
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-emerald-200 bg-white px-7 font-black text-emerald-800 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-white/5 dark:text-emerald-200 dark:hover:bg-white/10">
            <Link href="/baby-one">See all NIBOG games <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
