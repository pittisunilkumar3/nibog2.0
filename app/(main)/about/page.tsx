import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Users, Trophy, Calendar, MapPin, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import type { Metadata } from "next"
import { AnimatedBackground } from "@/components/animated-background"
import { ImageSlideshow } from "@/components/image-slideshow"
import { AboutTestimonialsSection } from "@/components/about-testimonials-section"

export const metadata: Metadata = {
  title: "About NIBOG | New India Baby Olympic Games",
  description: "Learn about NIBOG - India's biggest baby Olympic games, our mission, vision, and the team behind it.",
}

export default function AboutPage() {
  return (
    <AnimatedBackground variant="about">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sunshine-100 via-coral-100 to-mint-100 dark:from-sunshine-900/20 dark:via-coral-900/20 dark:to-mint-900/20 py-20 md:py-28">
        {/* Floating decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-sunshine-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-coral-300 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-mint-300 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute bottom-10 right-10 w-18 h-18 bg-lavender-300 rounded-full opacity-20 animate-float-slow"></div>

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <Badge className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full shadow-xl animate-bounce-gentle border-4 border-white/50">
              📖 About NIBOG
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-500 via-coral-500 to-mint-500 bg-[length:200%_auto] animate-rainbow-shift">
                About NIBOG
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-neutral-charcoal/80 dark:text-white/80 leading-relaxed max-w-3xl mx-auto">
              India's biggest baby Olympic games, celebrating the <span className="font-bold text-sunshine-600">joy of childhood</span> through
              <span className="font-bold text-coral-600"> play</span> and
              <span className="font-bold text-mint-600"> competition</span> ✨
            </p>

            {/* Fun emoji decorations */}
            <div className="flex justify-center gap-6 text-4xl">
              <span className="animate-bounce-gentle">📚</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '0.5s'}}>👶</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1s'}}>🏆</span>
              <span className="animate-bounce-gentle" style={{animationDelay: '1.5s'}}>❤️</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 bg-gradient-to-br from-lavender-100 via-mint-50 to-coral-50 dark:from-lavender-900/20 dark:via-mint-900/20 dark:to-coral-900/20 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-sunshine-300 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-coral-300 rounded-full opacity-10 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-mint-300 rounded-full opacity-10 animate-bounce-gentle"></div>

        <div className="container relative z-10">
          <div className="grid gap-16 md:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-sunshine-400 to-coral-400 text-neutral-charcoal rounded-full w-fit">
                  🎯 Our Mission
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-sunshine-600 via-coral-600 to-mint-600">
                    Nurturing India's Future Champions
                  </span>
                </h2>
                <p className="text-lg text-neutral-charcoal/70 dark:text-white/70 leading-relaxed">
                  At NIBOG, our mission is to create a platform that celebrates the natural abilities and
                  enthusiasm of children through age-appropriate competitive events. We believe in fostering
                  physical activity, social skills, and confidence in children from an early age.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  { text: "Promote physical activity and healthy competition", emoji: "💪", color: "sunshine" },
                  { text: "Build confidence and social skills in children", emoji: "🌟", color: "coral" },
                  { text: "Create memorable experiences for families", emoji: "❤️", color: "mint" },
                  { text: "Celebrate childhood achievements", emoji: "🏆", color: "lavender" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className={`bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-full p-2 shadow-lg animate-medal-shine`}>
                      <span className="text-lg">{item.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-semibold text-neutral-charcoal dark:text-white">{item.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="card-baby-gradient rounded-3xl p-6 shadow-2xl border-4 border-white/50">
                <ImageSlideshow
                  images={[
                    {
                      src: "/images/about/children/children-1.jpg",
                      alt: "Children playing together happily"
                    },
                    {
                      src: "/images/about/children/children-2.jpg",
                      alt: "Kids participating in fun activities"
                    },
                    {
                      src: "/images/about/children/children-3.jpg",
                      alt: "Children laughing and having fun"
                    },
                    {
                      src: "/images/about/children/children-4.jpg",
                      alt: "Kids playing outdoor games"
                    },
                    {
                      src: "/images/about/children/children-5.jpg",
                      alt: "Children celebrating together"
                    }
                  ]}
                  interval={4000}
                />
                <div className="mt-4 text-center">
                  <p className="text-neutral-charcoal font-bold">
                    🌈 Happy Moments at NIBOG Events 🌈
                  </p>
                </div>
              </div>

              {/* Floating decorative elements around the slideshow */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-sunshine-400 rounded-full animate-bounce-gentle"></div>
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-coral-400 rounded-full animate-sparkle"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-mint-400 rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-lavender-400 rounded-full animate-bounce-gentle" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-slate-50 py-16 dark:bg-slate-900/30 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
              Our Story
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">The NIBOG Journey</h2>
            <p className="mt-4 text-muted-foreground">
              NIBOG was founded with a simple idea: to create a platform where children can showcase their
              natural abilities in a fun, supportive environment. What started as a small event in one city
              has now grown into India's largest baby Olympic games.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Founded in 2018</h3>
                <p className="mt-2 text-muted-foreground">
                  NIBOG was established with our first event in Hyderabad, featuring just 100 participants.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">21 Cities and Growing</h3>
                <p className="mt-2 text-muted-foreground">
                  Today, NIBOG events are held in 21 cities across India, bringing joy to thousands of families.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">50,000+ Participants</h3>
                <p className="mt-2 text-muted-foreground">
                  We've welcomed over 50,000 young participants to our events, creating countless memories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
              Gallery
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Moments of Joy</h2>
            <p className="mt-4 text-muted-foreground">
              Capturing the excitement, determination, and pure joy of our little champions
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              {
                src: "/images/about/gallery-1.jpg",
                alt: "Baby crawling competition",
              },
              {
                src: "/images/about/gallery-2.jpg",
                alt: "Children in a running race",
              },
              {
                src: "/images/about/gallery-3.jpg",
                alt: "Baby walker event",
              },
              {
                src: "/images/about/gallery-4.jpg",
                alt: "Child receiving medal",
              },
              {
                src: "/images/about/gallery-5.jpg",
                alt: "Parents cheering for their children",
              },
              {
                src: "/images/about/gallery-6.jpg",
                alt: "Children playing together",
              },
              {
                src: "/images/about/gallery-7.jpg",
                alt: "Baby smiling during event",
              },
              {
                src: "/images/about/gallery-8.jpg",
                alt: "Group photo of participants",
              },
              {
                src: "/images/about/gallery-9.jpg",
                alt: "Joyful moment at NIBOG event",
              },
              {
                src: "/images/about/gallery-10.jpg",
                alt: "Kids having fun at NIBOG",
              },
            ].map((image, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-block rounded-lg bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">What Parents Say</h2>
            <p className="mt-4 text-muted-foreground">
              Hear from the parents whose children have participated in NIBOG events
            </p>
          </div>

          <div className="mt-12">
            <AboutTestimonialsSection />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white dark:bg-blue-900 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Join the NIBOG Family
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Register your child for our upcoming events and be part of India's biggest baby Olympic games
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register-event">Register Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </AnimatedBackground>
  )
}
