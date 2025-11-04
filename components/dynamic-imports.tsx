"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component for Suspense fallbacks
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8 w-full">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

// Dynamically imported components with loading state
export const DynamicEventList = dynamic(
  () => import('./event-list'),
  {
    loading: () => <LoadingSpinner />,
    // This will disable server-side rendering which can improve performance
    // for client-heavy components
    ssr: false,
  }
)

// Using client-page as a reference since we know it exists
export const DynamicRegisterForm = dynamic(
  () => import('@/app/(main)/register-event/client-page'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: true, // Keep SSR for form to improve SEO and initial load
  }
)

// Commented until these components are created
// Placeholder for future components
/*
export const DynamicPaymentProcessor = dynamic(
  () => import('@/components/payment-processor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Payment processing is client-side only
  }
)

export const DynamicEventCalendarView = dynamic(
  () => import('@/components/event-calendar'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)*/

// Add more dynamically imported components as needed
