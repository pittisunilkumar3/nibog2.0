'use client'

import { ReactNode, useEffect, useState } from 'react'

/**
 * HydrationWrapper component to prevent hydration mismatches
 * This wrapper ensures that the content is only rendered on the client side
 * after the component has mounted, preventing server-client HTML mismatches
 */
export function HydrationWrapper({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after the component mounts
    setIsHydrated(true)
  }, [])

  // Return null or a simple placeholder during SSR to avoid mismatch
  if (!isHydrated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
