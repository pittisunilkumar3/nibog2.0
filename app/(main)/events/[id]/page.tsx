import { Baby, Calendar, Clock, Info, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

type Props = { params: { id: string } }

async function getEventDetails(id: string) {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3004"
    const response = await fetch(`${backendUrl}/api/events/${id}/details`, { cache: "no-store" })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const event = await getEventDetails(params.id)
  if (!event) return { title: "Event Not Found | NIBOG" }
  return {
    title: `${event.event_title || event.title || "NIBOG Event"} | NIBOG`,
    description: event.event_description || event.description || "NIBOG baby games event details",
  }
}

function formatTime(value?: string | null) {
  if (!value) return null
  const [hours, minutes = "00"] = value.split(":")
  const hour = Number.parseInt(hours)
  if (Number.isNaN(hour)) return value
  return `${hour % 12 || 12}:${minutes.slice(0, 2)} ${hour >= 12 ? "PM" : "AM"}`
}

export default async function EventPage({ params }: Props) {
  const event = await getEventDetails(params.id)
  if (!event) notFound()

  const games = Array.isArray(event.games)
    ? event.games
    : Array.isArray(event.games_with_slots)
      ? event.games_with_slots
      : []
  const activeGames = games.filter((game: any) => game.is_active === undefined || game.is_active === 1 || game.is_active === true)
  const ages = activeGames.flatMap((game: any) => [game.min_age, game.max_age]).filter((age: unknown): age is number => typeof age === "number" && age > 0)
  const minAge = ages.length ? Math.min(...ages) : null
  const maxAge = ages.length ? Math.max(...ages) : null
  const prices = activeGames
    .flatMap((game: any) => [game.custom_price, game.price, game.slot_price])
    .map(Number)
    .filter((price: number) => Number.isFinite(price) && price > 0)
  const startingPrice = prices.length ? Math.min(...prices) : null
  const title = event.event_title || event.title || "NIBOG Event"
  const description = event.event_description || event.description || "A joyful NIBOG baby games event for children and families."
  const date = event.event_date || event.date
  const venue = event.venue_name || event.venue?.venue_name || null
  const city = event.city_name || event.city?.city_name || null
  const address = event.venue_address || event.venue?.address || null
  const startTime = formatTime(event.start_time)
  const endTime = formatTime(event.end_time)
  const time = startTime && endTime ? `${startTime} – ${endTime}` : null
  const image = event.image_url || "/images/baby-crawling.jpg"

  // Past events must not offer registration — old links (Google, shared) still land here.
  const isPast = date ? new Date(date).getTime() < new Date(new Date().toDateString()).getTime() : false
  // Events in cities not open for booking (city deactivated) must not offer registration either.
  // Server component: fetch the backend directly (relative fetch() does not work server-side).
  let cityBookable = true
  try {
    const backendBase = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3004"
    const res = await fetch(`${backendBase}/api/city/booking-info/list`, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      const bookingCities = Array.isArray(data) ? data : (data?.data || [])
      if (city && Array.isArray(bookingCities) && bookingCities.length > 0) {
        cityBookable = bookingCities.some(
          (c: any) => String(c.city_name || "").trim().toLowerCase() === String(city).trim().toLowerCase() && (c.events?.length || 0) > 0
        )
      }
    }
  } catch { /* keep cityBookable = true on lookup failure */ }
  const registrationClosed = isPast || !cityBookable

  return (
    <div className="bg-[#fffaf3] text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="container px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/events" className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-black text-emerald-800 hover:text-emerald-950 dark:text-emerald-300">← Back to events</Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.8fr)]">
          <div className="min-w-0 space-y-7">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-emerald-50 shadow-[0_24px_60px_-38px_rgba(20,83,63,.65)] sm:aspect-[16/8]">
              <Image src={image} alt={title} fill priority sizes="(max-width: 1023px) 100vw, 68vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
              <Badge className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-slate-950/65 px-3 py-1.5 text-white">NIBOG event</Badge>
            </div>

            <section>
              <h1 className="text-3xl font-black leading-tight tracking-[-0.035em] sm:text-5xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">{description}</p>
            </section>

            <dl className="grid gap-3 rounded-[1.75rem] border border-orange-100 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:grid-cols-2 sm:p-6">
              {date && <EventDetail icon={Calendar} label="Date" value={formatDate(date)} />}
              <EventDetail icon={Clock} label="Time" value={time || "To be announced"} />
              <EventDetail icon={MapPin} label="Venue" value={[venue, city].filter(Boolean).join(", ") || "To be announced"} />
              <EventDetail icon={Baby} label="Age range" value={minAge && maxAge ? `${minAge}–${maxAge} months` : "Confirm during registration"} />
            </dl>

            {address && (
              <section className="rounded-[1.75rem] bg-white p-5 dark:bg-slate-900 sm:p-6">
                <h2 className="text-xl font-black">Location</h2>
                <p className="mt-2 leading-6 text-slate-600 dark:text-slate-300">{address}{city ? `, ${city}` : ""}</p>
              </section>
            )}

            <section className="rounded-[1.75rem] bg-white p-5 dark:bg-slate-900 sm:p-6">
              <h2 className="text-2xl font-black">Games at this event</h2>
              {activeGames.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {activeGames.map((game: any, index: number) => {
                    const gamePrice = [game.custom_price, game.price, game.slot_price].map(Number).find((price) => Number.isFinite(price) && price > 0)
                    return (
                      <article key={game.game_id || game.id || index} className="rounded-2xl border border-emerald-100 p-4 dark:border-white/10">
                        <h3 className="font-black">{game.custom_title || game.game_name || game.name || "NIBOG game"}</h3>
                        {(game.custom_description || game.game_description || game.description) && <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{game.custom_description || game.game_description || game.description}</p>}
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                          {game.min_age && game.max_age && <span className="rounded-full bg-emerald-50 px-3 py-1.5 dark:bg-emerald-400/10">{game.min_age}–{game.max_age} months</span>}
                          <span className="rounded-full bg-orange-50 px-3 py-1.5 dark:bg-orange-400/10">{gamePrice ? formatPrice(gamePrice) : "Price confirmed during registration"}</span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Games will be confirmed during registration.</p>}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl dark:border dark:border-white/10">
              <p className="text-xs font-black uppercase tracking-[0.17em] text-amber-300">Ready when you are</p>
              <h2 className="mt-2 text-2xl font-black">Register your child</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">Choose eligible games and see the confirmed price inside the secure registration flow.</p>
              {startingPrice && <p className="mt-4 text-lg font-black">Games from {formatPrice(startingPrice)}</p>}
              {registrationClosed ? (
                <div className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-white/10 px-6 text-center text-xs font-black uppercase tracking-wide text-slate-300">{isPast ? "This event has concluded" : "Registrations opening soon"}</div>
              ) : (
                <Button asChild className="mt-5 h-14 w-full rounded-full bg-[#ef5f52] font-black text-white hover:bg-[#dc4e43]">
                  <Link href={`/register-event${city ? `?city=${encodeURIComponent(city)}` : ""}`}>Continue to registration</Link>
                </Button>
              )}
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/5 p-3 text-xs leading-5 text-slate-300"><Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />Dates, games and charges are confirmed before payment.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function EventDetail({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm dark:bg-slate-950 dark:text-emerald-300"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0"><dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt><dd className="break-words font-bold text-slate-800 dark:text-white">{value}</dd></div>
    </div>
  )
}
