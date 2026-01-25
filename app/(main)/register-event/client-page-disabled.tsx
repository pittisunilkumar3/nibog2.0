"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RegisterEventClientPage() {
  const router = useRouter()

  return (
    <div className="container py-12 px-4 relative min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20">
      {/* Homepage-style background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-10 w-16 h-16 bg-skyblue-400 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-coral-400 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-mint-400 rounded-full opacity-25 animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 bg-lavender-400 rounded-full opacity-20 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-10 h-10 bg-skyblue-300 rounded-full opacity-25 animate-float-delayed" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Card className="mx-auto w-full max-w-2xl relative overflow-hidden shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
        {/* Homepage-style top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>

        {/* Homepage-style corner decorations */}
        <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-skyblue-100 opacity-50 dark:bg-skyblue-900/50"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-mint-100 opacity-50 dark:bg-mint-900/50"></div>

        <CardHeader className="space-y-6 relative pb-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-gradient-to-br from-skyblue-400/20 to-coral-400/20 p-4 rounded-3xl shadow-lg border-2 border-skyblue-400/30">
              <CalendarIcon className="h-16 w-16 text-skyblue-600" />
            </div>
            <div>
              <CardTitle className="text-4xl font-bold tracking-tight mb-4">
                <span className="bg-gradient-to-r from-skyblue-600 via-coral-600 to-mint-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-rainbow-shift">
                  🎯 Event Registration 🎯
                </span>
              </CardTitle>
              <CardDescription className="text-lg text-neutral-charcoal/70 dark:text-white/70">
                Registration form has been temporarily disabled
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-12 px-6 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-2xl font-bold text-neutral-charcoal dark:text-white">
              Registration Currently Unavailable
            </h3>
            <p className="text-neutral-charcoal/70 dark:text-white/70">
              We're making improvements to our registration system. Please check back later or contact us for more information.
            </p>
            <div className="pt-4">
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400 hover:from-skyblue-500 hover:via-coral-500 hover:to-mint-500 text-white px-8 py-6 text-lg rounded-2xl"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 border-t-2 border-skyblue-200 bg-gradient-to-r from-skyblue-50 via-coral-50 to-mint-50 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20 px-6 py-6 rounded-b-3xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-skyblue-400 animate-bounce-gentle"></div>
              <div className="h-2 w-2 rounded-full bg-coral-400 animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 rounded-full bg-mint-400 animate-bounce-gentle" style={{animationDelay: '0.4s'}}></div>
              <div className="h-2 w-2 rounded-full bg-lavender-400 animate-bounce-gentle" style={{animationDelay: '0.6s'}}></div>
              <div className="h-2 w-2 rounded-full bg-mint-400 animate-bounce-gentle" style={{animationDelay: '0.4s'}}></div>
              <div className="h-2 w-2 rounded-full bg-coral-400 animate-bounce-gentle" style={{animationDelay: '0.2s'}}></div>
              <div className="h-2 w-2 rounded-full bg-skyblue-400 animate-bounce-gentle"></div>
            </div>
            <div className="text-neutral-charcoal/70 dark:text-white/70 font-semibold">
              🏆 Need help? Contact us at{" "}
              <Link href="mailto:newindiababyolympics@gmail.com" className="text-skyblue-600 font-bold underline-offset-4 hover:underline transition-colors hover:text-coral-600">
                newindiababyolympics@gmail.com
              </Link>
              {" "}🏆
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
