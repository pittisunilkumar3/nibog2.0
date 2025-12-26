# Comprehensive Cache Busting Solution for NIBOG 2.0

## Problem
Database changes (e.g., deleting events) were not reflected in the frontend due to aggressive caching at multiple levels.

## Root Causes
1. **Browser Caching**: HTTP responses cached by browser
2. **Next.js Static Generation**: Pages pre-rendered at build time
3. **Service Worker**: Caching HTML/assets for offline support
4. **React State**: Stale state persisting across re-renders
5. **LocalStorage/SessionStorage**: Cached data surviving page reloads

## Complete Solution

### 1. Next.js Configuration (`next.config.mjs`)
```javascript
async headers() {
  return [
    // API routes - no cache, always fresh
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate',
        },
      ],
    },
    // HTML pages - no cache for dynamic pages
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, no-cache, must-revalidate, max-age=0',
        },
      ],
    },
  ];
}
```

### 2. Page-Level Configuration (`app/(main)/register-event/page.tsx`)
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 3. API Route Configuration
All API routes include:
```typescript
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Response headers
{
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
  "X-Content-Type-Options": "nosniff"
}
```

### 4. Fetch-Level Cache Busting (`services/cityService.ts`)
```typescript
export async function getCitiesWithBookingInfo(): Promise<BookingCity[]> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  
  const response = await fetch(
    `/api/city/booking-info/list?_t=${timestamp}&_r=${random}&nocache=1`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      cache: 'no-store',
    }
  );
  
  return response.json();
}
```

### 5. React State Management (`client-page.tsx`)
```typescript
const fetchCitiesData = useCallback(async () => {
  // Clear ALL state
  setBookingCities([])
  setCities([])
  setApiEvents([])
  setEligibleEvents([])
  setEligibleGames([])
  setSelectedGames([])
  setSelectedEventType("")
  setSelectedEvent("")
  
  // Clear ALL storage
  sessionStorage.removeItem('registrationData')
  sessionStorage.removeItem('selectedAddOns')
  localStorage.removeItem('nibog_booking_data')
  
  // Clear all NIBOG-related items
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('nibog_') || key.startsWith('registration_')) {
      localStorage.removeItem(key);
    }
  });
  
  // Force Next.js revalidation
  router.refresh();
  
  // Fetch fresh data
  const bookingData = await getCitiesWithBookingInfo()
  setBookingCities(bookingData)
}, [router])
```

### 6. Auto-Refresh on Tab Visibility
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && !isLoadingCities) {
      router.refresh();
      fetchCitiesData();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [fetchCitiesData, isLoadingCities, router]);
```

### 7. Manual Refresh Button
```tsx
<Button
  onClick={async () => {
    router.refresh();
    await fetchCitiesData();
  }}
  disabled={isLoadingCities}
>
  <svg className={cn("h-4 w-4", isLoadingCities && "animate-spin")}>
    {/* Refresh icon */}
  </svg>
  Refresh
</Button>
```

### 8. Service Worker Configuration (`public/sw.js`)
```javascript
// Skip API requests - don't cache them
if (event.request.url.includes('/api/') || 
    event.request.url.includes('/auth/') ||
    event.request.url.includes('/payments/')) {
  return; // Don't cache
}
```

## Testing Instructions

### Development Mode
```bash
# Restart dev server to clear any cached modules
npm run dev

# Navigate to http://localhost:3112/register-event
# Make changes in database
# Click Refresh button OR switch to another tab and back
# Changes should appear immediately
```

### Production Mode
```bash
# Build and start production server
npm run build
npm start

# Navigate to http://localhost:3112/register-event
# Test same as development mode
```

## Verification Checklist

- [ ] Database changes appear immediately on refresh
- [ ] Deleted events don't show in dropdowns
- [ ] New events appear without server restart
- [ ] Tab switching triggers auto-refresh
- [ ] Console logs show fresh API calls
- [ ] Network tab shows no cached responses (200 OK, not 304 Not Modified)
- [ ] No "testttt" event appearing in logs

## Debugging Tips

### Check if cache is the issue:
1. Open DevTools → Network tab
2. Disable cache checkbox
3. Refresh page
4. If data is correct, it's a caching issue

### Check console logs:
- `[fetchCitiesData] Starting to fetch cities...`
- `[Refresh] Manual refresh triggered`
- `[Visibility] Page became visible, refreshing data...`

### Force clear everything:
1. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear site data: DevTools → Application → Clear storage → Clear site data
3. Unregister service worker: DevTools → Application → Service Workers → Unregister

## Production Deployment Notes

1. **CDN Configuration**: If using a CDN (Vercel, Netlify), ensure:
   - API routes bypass CDN cache
   - Dynamic routes marked as such
   - Cache-Control headers respected

2. **Environment Variables**: Ensure production has:
   - `BACKEND_URL` pointing to production API
   - No caching environment variables set

3. **Monitoring**: Watch for:
   - 304 Not Modified responses (should be 200 OK)
   - Stale data persisting beyond refresh
   - Console errors about failed fetches

## Summary

This multi-layered approach ensures:
✅ No browser caching of API responses
✅ No Next.js static generation caching
✅ No service worker caching of dynamic data
✅ No React state persistence
✅ No localStorage/sessionStorage stale data
✅ Automatic refresh on tab visibility change
✅ Manual refresh button always available
✅ Works in both development and production

**Result**: Database changes reflect immediately in UI without manual server restart.
