'use client'

import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  MapPin,
  Medal,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { DynamicTestimonialsSection } from '@/components/dynamic-testimonials'
import HomepageGamesSection from '@/components/homepage-games-section'
import { PartnersSection } from '@/components/partners-section'
import { Button } from '@/components/ui/button'
import { getAllCities, type City } from '@/services/cityService'

type TrustHighlight = {
  icon: LucideIcon
  label: string
  detail: string
}

const trustHighlights: TrustHighlight[] = [
  {
    icon: ShieldCheck,
    label: 'Age-matched games',
    detail: 'Activities designed around each little champion’s stage.',
  },
  {
    icon: Medal,
    label: 'Every finish is celebrated',
    detail: 'Medals and e-certificates make the moment feel special.',
  },
  {
    icon: Camera,
    label: 'Memories captured',
    detail: 'Professional event photos help families keep the day close.',
  },
]

const eventMoments = [
  {
    src: '/images/about/children/children-2.jpg',
    alt: 'Children racing together on a marked NIBOG event track',
    eyebrow: 'Cheer together',
    title: 'A real event atmosphere',
    copy: 'Branded lanes, a lively venue, and families close to every little finish line.',
  },
  {
    src: '/images/about/children/children-5.jpg',
    alt: 'A baby ready to take part in a NIBOG activity',
    eyebrow: 'Made for their stage',
    title: 'Little participants belong here',
    copy: 'Activities are grouped around age and ability so the experience feels encouraging.',
  },
  {
    src: '/images/about/children/children-1.jpg',
    alt: 'A child crossing a NIBOG running lane with families watching',
    eyebrow: 'Proud moments',
    title: 'More joy than competition',
    copy: 'The result is a day children enjoy and parents remember long after the event.',
  },
]

const daySteps = [
  {
    icon: MapPin,
    title: 'Choose your city',
    copy: 'Find an upcoming NIBOG event that works for your family.',
  },
  {
    icon: UsersRound,
    title: 'Pick the right games',
    copy: 'Explore activities matched to your child’s age and stage.',
  },
  {
    icon: PartyPopper,
    title: 'Arrive, play and cheer',
    copy: 'Enjoy a welcoming day built around movement, smiles and encouragement.',
  },
  {
    icon: Trophy,
    title: 'Celebrate their moment',
    copy: 'Take home a proud finish-line memory, medal and e-certificate.',
  },
]

function useHomepageHeroImages() {
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/homepage-sections?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        })
        if (!response.ok) return
        const result = await response.json()
        if (!isMounted || !result.success || !Array.isArray(result.data)) return

        setImages(
          result.data
            .filter((image: { status?: string; image_path?: string }) =>
              image.status === 'active' && Boolean(image.image_path),
            )
            .map((image: { image_path: string }) => {
              const relativePath = image.image_path.replace(/^public/, '')
              return relativePath.startsWith('/') ? relativePath : `/${relativePath}`
            }),
        )
      } catch {
        // The curated event photo remains visible when admin imagery is unavailable.
      }
    }

    const handleAdminUpdate = (event: StorageEvent) => {
      if (
        event.key?.startsWith('homeSlider') ||
        event.key === 'homeSlideCacheBust'
      ) fetchImages()
    }

    fetchImages()
    const interval = window.setInterval(fetchImages, 5 * 60 * 1000)
    window.addEventListener('focus', fetchImages)
    window.addEventListener('storage', handleAdminUpdate)

    return () => {
      isMounted = false
      window.clearInterval(interval)
      window.removeEventListener('focus', fetchImages)
      window.removeEventListener('storage', handleAdminUpdate)
    }
  }, [])

  return images
}

function CitiesExplorer() {
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    getAllCities()
      .then((data) => {
        if (!isMounted) return
        setCities(
          data.filter((city) => city.is_active === true || city.is_active === 1).slice(0, 6),
        )
      })
      .catch(() => {
        if (isMounted) setCities([])
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="bg-[#f6fbff] py-12 dark:bg-slate-950 sm:py-16" aria-labelledby="cities-heading">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
            Closer than you think
          </p>
          <h2 id="cities-heading" className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Find a NIBOG event near you
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
            Browse upcoming dates, venues and age groups before you register.
          </p>
        </div>

        {isLoading ? (
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3" role="status" aria-label="Loading cities">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-sky-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : cities.length ? (
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/events?city=${encodeURIComponent(city.city_name.toLowerCase())}`}
                className="group flex min-h-16 items-center justify-between rounded-2xl border border-sky-100 bg-white px-4 py-3 font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-slate-900 dark:text-white"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-coral-500" aria-hidden="true" />
                  {city.city_name}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-sky-100 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
            <CalendarDays className="mx-auto h-7 w-7 text-sky-600" aria-hidden="true" />
            <p className="mt-3 font-bold text-slate-900 dark:text-white">See the latest event calendar</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Dates and venues are kept together on the events page.</p>
          </div>
        )}

        <div className="mt-7 text-center">
          <Button asChild size="lg" className="h-12 rounded-full bg-slate-950 px-7 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
            <Link href="/events">
              Browse all events
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const heroImages = useHomepageHeroImages()
  const [heroIndex, setHeroIndex] = useState(0)
  const [hideStickyCta, setHideStickyCta] = useState(false)
  const finalCtaRef = useRef<HTMLElement>(null)

  useEffect(() => {
    setHeroIndex(0)
    if (heroImages.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const interval = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroImages.length),
      6500,
    )
    return () => window.clearInterval(interval)
  }, [heroImages.length])

  useEffect(() => {
    const updateStickyVisibility = () => {
      const finalCta = finalCtaRef.current?.getBoundingClientRect()
      const footer = document.querySelector('footer')?.getBoundingClientRect()
      setHideStickyCta(
        Boolean(
          (finalCta && finalCta.top < window.innerHeight && finalCta.bottom > 0) ||
          (footer && footer.top < window.innerHeight),
        ),
      )
    }

    updateStickyVisibility()
    window.addEventListener('scroll', updateStickyVisibility, { passive: true })
    window.addEventListener('resize', updateStickyVisibility)
    return () => {
      window.removeEventListener('scroll', updateStickyVisibility)
      window.removeEventListener('resize', updateStickyVisibility)
    }
  }, [])

  return (
    <div className="overflow-hidden bg-[#fffaf3] pb-24 text-slate-950 dark:bg-slate-950 dark:text-white md:pb-0">
      <section className="relative isolate" aria-labelledby="home-hero-heading">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_10%_15%,rgba(255,210,92,0.30),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(251,113,133,0.20),transparent_32%),linear-gradient(180deg,#fffaf3_0%,#fff_100%)] dark:bg-[radial-gradient(circle_at_10%_15%,rgba(255,210,92,0.12),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(251,113,133,0.10),transparent_32%),linear-gradient(180deg,#0f172a_0%,#020617_100%)]" />
        <div className="container grid min-h-[calc(100svh-5.25rem)] items-center gap-8 px-4 py-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12 md:py-12 lg:gap-16">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/85 px-3.5 py-2 text-xs font-black uppercase tracking-[0.16em] text-orange-800 shadow-sm backdrop-blur dark:border-orange-300/20 dark:bg-white/5 dark:text-orange-200">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Joyful firsts. Proud families.
            </div>

            <h1 id="home-hero-heading" className="mt-5 max-w-3xl text-[clamp(2.65rem,11vw,5.75rem)] font-black leading-[0.94] tracking-[-0.055em] text-slate-950 dark:text-white">
              Their first race.
              <span className="mt-1 block bg-gradient-to-r from-[#ef5f52] via-[#f0a617] to-[#2e9f75] bg-clip-text text-transparent">
                Your forever memory.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-600 sm:text-lg sm:leading-8 dark:text-slate-300">
              NIBOG brings babies and young children together for age-matched games,
              cheerful competition and a finish-line moment the whole family can celebrate.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full bg-[#ef5f52] px-7 text-base font-black text-white shadow-[0_14px_30px_-12px_rgba(239,95,82,0.8)] hover:bg-[#dc4e43]">
                <Link href="/register-event">
                  Register your child
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-slate-300 bg-white/80 px-7 text-base font-bold text-slate-900 hover:bg-white dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                <Link href="/events">
                  <CalendarDays className="mr-2 h-5 w-5" aria-hidden="true" />
                  Browse events
                </Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
              {['Age-matched activities', 'Medal & e-certificate', 'Professional photos'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative mx-auto max-w-[620px]">
              <div className="relative min-h-[410px] overflow-hidden rounded-[2rem] bg-emerald-100 shadow-[0_35px_80px_-35px_rgba(33,52,44,0.55)] sm:min-h-[540px] lg:min-h-[620px]">
                <Image
                  src={heroImages[heroIndex] || '/images/about/children/children-4.jpg'}
                  alt="A baby crawling during a NIBOG activity"
                  fill
                  priority
                  sizes="(max-width: 767px) 100vw, 52vw"
                  className="object-cover object-[46%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-white/5" />
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-slate-950/55 p-4 text-white backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-[18rem] sm:p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200">A real NIBOG event moment</p>
                  <p className="mt-1 text-lg font-black leading-tight sm:text-xl">Small steps feel enormous here.</p>
                </div>
              </div>

              <Image
                src="/images/generated/nibog-celebration.png"
                alt=""
                aria-hidden="true"
                width={260}
                height={260}
                className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rotate-6 object-contain drop-shadow-xl sm:-right-12 sm:-top-10 sm:h-52 sm:w-52 motion-safe:animate-float"
              />

              <div className="absolute -bottom-5 -left-2 hidden w-40 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:block lg:w-48 dark:border-slate-900 dark:bg-slate-900">
                <div className="relative aspect-[4/5]">
                  <Image
                    src="/images/about/team-1.jpg"
                    alt="A child enjoying a hurdle activity at NIBOG"
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-900 sm:py-16" aria-labelledby="reassurance-heading">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Built around little champions</p>
            <h2 id="reassurance-heading" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Parents should know what to expect</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">A clear, encouraging experience matters just as much as a beautiful one.</p>
          </div>
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-auto md:grid md:max-w-5xl md:grid-cols-3 md:overflow-visible md:px-0">
            {trustHighlights.map(({ icon: Icon, label, detail }) => (
              <article key={label} className="min-w-[82vw] snap-center rounded-3xl border border-orange-100 bg-[#fffaf3] p-5 shadow-[0_14px_35px_-28px_rgba(62,37,19,0.5)] dark:border-white/10 dark:bg-slate-950 sm:p-6 md:min-w-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-slate-950 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-black">{label}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff3e9] py-12 dark:bg-slate-950 sm:py-16" aria-labelledby="moments-heading">
        <div className="container px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-coral-700 dark:text-coral-300">See the feeling</p>
              <h2 id="moments-heading" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">A day they’ll talk about all week</h2>
            </div>
            <Link href="/about" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full px-1 text-sm font-black text-coral-700 hover:text-coral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 dark:text-coral-300">
              Meet NIBOG <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {eventMoments.map((moment) => (
              <article key={moment.title} className="group min-w-[84vw] snap-center overflow-hidden rounded-[1.75rem] bg-white shadow-[0_18px_45px_-30px_rgba(58,29,11,0.6)] sm:min-w-0 dark:bg-slate-900">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={moment.src} alt={moment.alt} fill sizes="(max-width: 639px) 84vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600 dark:text-orange-300">{moment.eyebrow}</p>
                  <h3 className="mt-1.5 text-lg font-black">{moment.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{moment.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 dark:bg-slate-900 sm:py-16" aria-labelledby="day-heading">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">Simple from start to finish</p>
            <h2 id="day-heading" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your NIBOG day in four steps</h2>
          </div>
          <ol className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
            {daySteps.map(({ icon: Icon, title, copy }, index) => (
              <li key={title} className="relative rounded-3xl border border-violet-100 bg-violet-50/50 p-4 dark:border-white/10 dark:bg-slate-950 sm:p-5">
                <span className="absolute right-3 top-2 text-3xl font-black text-violet-200 dark:text-violet-400/20 sm:right-4 sm:top-3 sm:text-4xl">{index + 1}</span>
                <Icon className="h-5 w-5 text-violet-700 dark:text-violet-300 sm:h-6 sm:w-6" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-black sm:mt-4 sm:text-base">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-6">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <HomepageGamesSection />
      <DynamicTestimonialsSection />
      <PartnersSection />
      <CitiesExplorer />

      <section ref={finalCtaRef} className="bg-[#fffaf3] px-4 py-12 dark:bg-slate-950 sm:py-16" aria-labelledby="final-cta-heading">
        <div className="container relative overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-10 text-white shadow-2xl sm:px-10 sm:py-14 lg:px-16">
          <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />
          <Image src="/images/generated/nibog-celebration.png" alt="" aria-hidden="true" width={260} height={260} className="pointer-events-none absolute -bottom-16 -right-12 hidden h-64 w-64 rotate-6 object-contain opacity-80 sm:block" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">One small race. One huge memory.</p>
            <h2 id="final-cta-heading" className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Ready for their big little moment?</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Find the right event, choose age-matched games and give your little champion a day worth cheering for.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-14 rounded-full bg-amber-400 px-7 font-black text-slate-950 hover:bg-amber-300">
                <Link href="/register-event">Register for NIBOG <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-white/25 bg-white/5 px-7 font-bold text-white hover:bg-white/10 hover:text-white">
                <Link href="/events">Browse upcoming events</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {!hideStickyCta && (
        <Link
          href="/register-event"
          className="fixed inset-x-3 z-40 flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#ef5f52] px-6 text-base font-black text-white shadow-[0_14px_35px_-12px_rgba(35,24,21,0.7)] transition hover:bg-[#dc4e43] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 md:hidden"
          style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          Register for an event
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
