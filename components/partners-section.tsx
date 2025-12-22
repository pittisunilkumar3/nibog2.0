"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useEffect, useState, memo } from "react"

// Cache configuration
const PARTNERS_CACHE_KEY = 'nibog_partners_data';
const PARTNERS_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface Partner {
  id: number
  partner_name: string
  image_url: string
  display_priority: number
  status: string
}

function PartnersSectionComponent() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        // Check sessionStorage cache first
        const cached = sessionStorage.getItem(PARTNERS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < PARTNERS_CACHE_EXPIRY) {
            setPartners(data);
            setLoading(false);
            return;
          }
        }

        const response = await fetch('/api/partners/get-all', {
          next: { revalidate: 300 }, // Revalidate every 5 minutes
        })
        if (response.ok) {
          const payload = await response.json()
          // payload may be an array or an object { success, data }
          const arr = Array.isArray(payload) ? payload : (payload && payload.data) ? payload.data : []
          // Filter only active partners and sort by display_priority
          const activePartners = arr
            .filter((partner: Partner) => partner.status === 'Active')
            .sort((a: Partner, b: Partner) => a.display_priority - b.display_priority)

          // Cache the result
          sessionStorage.setItem(PARTNERS_CACHE_KEY, JSON.stringify({
            data: activePartners,
            timestamp: Date.now()
          }));

          setPartners(activePartners)
        } else {
          console.warn('Partners fetch returned non-ok status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching partners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [])

  // Don't show section if no partners
  if (!loading && partners.length === 0) {
    return null
  }
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      {/* Floating decorative elements */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-20 h-20 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>

      <div className="container relative z-10">
        <div className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <Badge className="px-6 py-3 text-lg font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full shadow-lg animate-bounce-gentle">
              🤝 Our Partners
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                Trusted Partners
              </span>
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
              We're proud to collaborate with leading brands and organizations to bring the best baby games experience across India
            </p>
          </div>

          {/* Partners Grid - Centered */}
          <div className="flex justify-center w-full">
            <div className="w-full max-w-7xl px-4 flex justify-center">
              <div className="flex flex-wrap justify-center gap-6 max-w-full">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card
                      key={index}
                      className="w-[180px] bg-white dark:bg-slate-800 animate-pulse flex-shrink-0"
                    >
                      <CardContent className="flex items-center justify-center p-6 aspect-square">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  partners.map((partner) => (
                    <Card
                      key={partner.id}
                      className="group w-[180px] bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:scale-105 flex-shrink-0"
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                        <div className="relative w-full aspect-square flex items-center justify-center">
                          {partner.image_url ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={partner.image_url}
                                alt={`${partner.partner_name} Logo`}
                                fill
                                className="object-contain p-1 transition-all duration-500 ease-in-out group-hover:scale-110"
                                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 180px"
                                priority={partner.display_priority <= 6}
                                onError={(e) => {
                                  // Fallback to placeholder if image fails to load
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  const parent = target.parentElement
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="flex flex-col items-center justify-center gap-2 text-center w-full h-full">
                                        <div class="w-20 h-20 bg-gradient-to-br from-sunshine-300 to-coral-300 dark:from-sunshine-700 dark:to-coral-700 rounded-full flex items-center justify-center shadow-lg">
                                          <span class="text-3xl font-bold text-white">
                                            ${partner.partner_name.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                    `
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            // Placeholder for partners without logo
                            <div className="flex flex-col items-center justify-center gap-3 text-center w-full h-full">
                              <div className="w-20 h-20 bg-gradient-to-br from-sunshine-300 to-coral-300 dark:from-sunshine-700 dark:to-coral-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <span className="text-3xl font-bold text-white">
                                  {partner.partner_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 text-center group-hover:text-primary transition-colors line-clamp-2">
                          {partner.partner_name}
                        </h3>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Optional: Partnership CTA */}
          <div className="text-center mt-6">
            <p className="text-muted-foreground text-sm">
              Interested in partnering with NIBOG? {" "}
              <a
                href="/contact"
                className="text-primary hover:underline font-semibold"
              >
                Get in touch
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// Memoize to prevent unnecessary re-renders
export const PartnersSection = memo(PartnersSectionComponent);
export default PartnersSection;
