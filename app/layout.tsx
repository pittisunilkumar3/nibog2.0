import type React from "react"
import type { Metadata } from "next/types"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

// Optimized font loading with display swap for better performance
const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: "NIBOG - Baby Events Platform",
  description: "Discover and book baby-focused games and events across India",
  generator: 'v0.dev'
}

// Enable Incremental Static Regeneration with 60 second revalidation
// This provides a good balance between freshness and performance
export const revalidate = 60

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0072f5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NIBOG" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Remove any third-party injected elements before React hydration
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && node.hasAttribute && 
                            (node.hasAttribute('data-lastpass-icon-root') || 
                             node.hasAttribute('data-grammarly-shadow-root') ||
                             node.id === 'webpack-dev-server-client-overlay')) {
                          return; // Allow these known elements
                        }
                      });
                    });
                  });
                  if (document.body) {
                    observer.observe(document.body, { childList: true, subtree: true });
                  }
                } catch (e) {
                  console.warn('Hydration helper failed:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-poppins`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}