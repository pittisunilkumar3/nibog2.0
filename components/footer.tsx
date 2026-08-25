"use client"

import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react"
import Link from "next/link"
import { memo, useEffect, useState } from "react"

import { NibogLogo } from "./nibog-logo"

const FOOTER_CACHE_KEY = "nibog_footer_data"
const FOOTER_CACHE_EXPIRY = 5 * 60 * 1000

type FooterSettings = {
  company_name?: string
  company_description?: string
  address?: string
  phone?: string
  email?: string
  copyright_text?: string
  facebook_url?: string
  instagram_url?: string
  linkedin_url?: string
  youtube_url?: string
}

const fallbackSettings: Required<Pick<FooterSettings, "company_name" | "company_description" | "address" | "phone" | "email" | "copyright_text">> = {
  company_name: "NIBOG",
  company_description: "Joyful, age-matched baby games that give children a proud first finish and families a memory to keep.",
  address: "NIBOG, P.No:18, H.NO 33-30/4, Officers Colony, R.K Puram, Hyderabad - 500056.",
  phone: "+91-8977939614/15",
  email: "Nibog100@gmail.com",
  copyright_text: "© {year} NIBOG. All rights reserved.",
}

const exploreLinks = [
  ["Upcoming events", "/events"],
  ["NIBOG games", "/baby-olympics"],
  ["Register your child", "/register-event"],
  ["About NIBOG", "/about"],
  ["Contact us", "/contact"],
] as const

const policyLinks = [
  ["FAQs", "/faq"],
  ["Terms & conditions", "/terms"],
  ["Privacy policy", "/privacy"],
  ["Refund policy", "/refund"],
] as const

function FooterComponent() {
  const [settings, setSettings] = useState<FooterSettings>(fallbackSettings)

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const cached = sessionStorage.getItem(FOOTER_CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached) as { data?: FooterSettings; timestamp?: number }
          if (parsed.data && parsed.timestamp && Date.now() - parsed.timestamp < FOOTER_CACHE_EXPIRY) {
            if (isMounted) setSettings({ ...fallbackSettings, ...parsed.data })
            return
          }
        }

        const response = await fetch("/api/footer-settings/with-social", { cache: "no-store" })
        if (!response.ok) return
        const data = (await response.json()) as FooterSettings
        if (isMounted) setSettings({ ...fallbackSettings, ...data })
        sessionStorage.setItem(FOOTER_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
      } catch {
        // The complete, neutral fallback footer is already visible.
      }
    }

    loadSettings()
    return () => {
      isMounted = false
    }
  }, [])

  const phoneHref = `tel:${(settings.phone || fallbackSettings.phone).replace(/[^+\d]/g, "")}`
  const emailHref = `mailto:${settings.email || fallbackSettings.email}`
  const socialLinks = [
    { label: "Facebook", href: settings.facebook_url, icon: Facebook },
    { label: "Instagram", href: settings.instagram_url, icon: Instagram },
    { label: "LinkedIn", href: settings.linkedin_url, icon: Linkedin },
    { label: "YouTube", href: settings.youtube_url, icon: Youtube },
  ].filter((item): item is typeof item & { href: string } => Boolean(item.href))

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-white">
      <div className="container px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1.1fr]">
          <div className="max-w-md">
            <Link href="/" aria-label={`${settings.company_name || "NIBOG"} home`} className="inline-flex min-h-11 items-center rounded-xl bg-white px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              <NibogLogo className="h-14" />
            </Link>
            <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">
              {settings.company_description || fallbackSettings.company_description}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3" aria-label="NIBOG social channels">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition hover:border-amber-300 hover:bg-amber-300 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <FooterLinks title="Explore" links={exploreLinks} />
          <FooterLinks title="Helpful" links={policyLinks} />

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-amber-300">Contact</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <a href={phoneHref} className="flex min-h-11 items-center gap-3 rounded-xl px-1 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                <Phone className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span className="break-words">{settings.phone || fallbackSettings.phone}</span>
              </a>
              <a href={emailHref} className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-1 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                <Mail className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span className="min-w-0 break-all">{settings.email || fallbackSettings.email}</span>
              </a>
              <div className="flex items-start gap-3 px-1 py-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                <span className="whitespace-pre-line leading-6">{settings.address || fallbackSettings.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs leading-5 text-slate-400 sm:text-left">
          {(settings.copyright_text || fallbackSettings.copyright_text).replace("{year}", String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  )
}

function FooterLinks({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div>
      <h2 className="text-sm font-black uppercase tracking-[0.18em] text-amber-300">{title}</h2>
      <ul className="mt-4 space-y-1">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="flex min-h-11 items-center rounded-xl text-sm text-slate-300 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default memo(FooterComponent)
