'use client'

import { ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/toaster'
import StagewiseToolbar from '@/components/stagewise-toolbar'
import { HydrationWrapper } from '@/components/hydration-wrapper'
import { GoogleOAuthProvider } from '@react-oauth/google'

export function Providers({ children }: { children: ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  
  return (
    <HydrationWrapper>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem={false}
          storageKey="nibog-theme"
        >
          <AuthProvider>
            {children}
            <Toaster />
            <StagewiseToolbar />
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </HydrationWrapper>
  )
}

