# Loading States - Code Changes Reference

## Quick Reference Guide for Developers

This document provides a quick reference to the exact code changes made for the loading states implementation.

---

## Change 1: Initial Page Load Loading State

**File:** `app/(main)/register-event/client-page.tsx`  
**Location:** Lines 1452-1483 (before the main return statement)

### Code Added:

```typescript
// Show initial loading state while cities are being fetched
if (isLoadingCities && cities.length === 0) {
  return (
    <div className="container py-6 sm:py-12 px-3 sm:px-4 lg:px-6 relative min-h-screen bg-gradient-to-br from-skyblue-100 via-coral-100 to-mint-100 dark:from-skyblue-900/20 dark:via-coral-900/20 dark:to-mint-900/20">
      {/* Homepage-style background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-20 hidden sm:block">
        <div className="absolute top-10 left-10 w-16 h-16 bg-skyblue-400 rounded-full opacity-20 animate-bounce-gentle"></div>
        <div className="absolute top-20 right-20 w-12 h-12 bg-coral-400 rounded-full opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-mint-400 rounded-full opacity-25 animate-float-slow"></div>
        <div className="absolute bottom-10 right-10 w-14 h-14 bg-lavender-400 rounded-full opacity-20 animate-bounce-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-10 h-10 bg-skyblue-300 rounded-full opacity-25 animate-float-delayed" style={{animationDelay: '0.5s'}}></div>
      </div>

      <Card className="mx-auto w-full max-w-4xl relative overflow-hidden shadow-2xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm dark:bg-gray-800/90 rounded-3xl">
        {/* Homepage-style top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-skyblue-400 via-coral-400 to-mint-400"></div>

        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-primary/20 rounded-full"></div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-primary">Loading Event Registration</h3>
            <p className="text-muted-foreground">Please wait while we prepare the registration form...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Key Points:
- Added **before** the main return statement
- Checks if `isLoadingCities` is true AND `cities.length === 0`
- Returns early with loading screen
- Prevents rendering of incomplete form

---

## Change 2: City Selection Loading Overlay

**File:** `app/(main)/register-event/client-page.tsx`  
**Location:** Lines 1624-1684 (within the city selection section)

### Code Changes:

#### 2.1: Added `relative` class to container

**Before:**
```typescript
<div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50">
```

**After:**
```typescript
<div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 relative">
```

#### 2.2: Added loading overlay (immediately after opening div)

```typescript
{/* Loading overlay when city is selected and events are being fetched */}
{isLoadingEvents && selectedCity && (
  <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        <div className="absolute inset-0 animate-ping h-12 w-12 border-4 border-primary/20 rounded-full"></div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-primary">Loading events for {selectedCity}...</p>
        <p className="text-xs text-muted-foreground mt-1">Please wait</p>
      </div>
    </div>
  </div>
)}
```

#### 2.3: Updated Select component to disable during loading

**Before:**
```typescript
<Select value={selectedCity} onValueChange={handleCityChange} disabled={cities.length === 0}>
```

**After:**
```typescript
<Select value={selectedCity} onValueChange={handleCityChange} disabled={cities.length === 0 || isLoadingEvents}>
```

### Key Points:
- Container needs `relative` positioning for overlay to work
- Overlay uses `absolute` positioning with `inset-0` to cover entire container
- Overlay has high `z-index` (z-10) to appear above content
- Select is disabled during loading to prevent multiple requests
- Overlay automatically shows/hides based on `isLoadingEvents && selectedCity`

---

## State Variables Reference

These state variables are already defined in the component and are used by the loading states:

```typescript
const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false)
const [cityError, setCityError] = useState<string | null>(null)
const [cities, setCities] = useState<{ id: string | number; name: string }[]>([])
const [selectedCity, setSelectedCity] = useState<string>("")
const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false)
const [eventError, setEventError] = useState<string | null>(null)
```

---

## API Call Flow

### 1. Cities API (on component mount)

```typescript
useEffect(() => {
  const fetchCities = async () => {
    try {
      setIsLoadingCities(true)  // ← Triggers initial loading state
      setCityError(null)
      
      const citiesData = await getAllCities()
      const formattedCities = citiesData.map(city => ({
        id: city.id || 0,
        name: city.city_name
      }))
      
      setCities(formattedCities)
    } catch (error: any) {
      console.error("Failed to fetch cities:", error)
      setCityError("Failed to load cities. Please try again.")
    } finally {
      setIsLoadingCities(false)  // ← Hides initial loading state
    }
  }

  fetchCities()
}, [])
```

### 2. Events API (on city selection)

```typescript
const handleCityChange = async (city: string) => {
  setSelectedCity(city)
  setSelectedEventType("")
  setSelectedEvent("")
  setEligibleEvents([])
  setEligibleGames([])
  setSelectedGames([])

  const cityObj = cities.find(c => c.name === city)
  if (!cityObj) return

  const cityId = Number(cityObj.id)
  setSelectedCityId(cityId);

  try {
    setIsLoadingEvents(true);  // ← Triggers city selection loading overlay
    setEventError(null);

    const eventsData = await getEventsByCityId(cityId);
    setApiEvents(eventsData);
    
    // Process events data...
    
  } catch (error: any) {
    console.error(`Failed to fetch events for city ID ${cityId}:`, error);
    setEventError("Failed to load events. Please try again.");
    setEligibleEvents([]);
    setAvailableDates([]);
  } finally {
    setIsLoadingEvents(false);  // ← Hides city selection loading overlay
  }
}
```

---

## CSS Classes Used

### Tailwind CSS Classes for Loading Indicators

```css
/* Spinner animation */
.animate-spin          /* Rotates 360 degrees continuously */
.border-4              /* 4px border width */
.border-primary        /* Primary theme color */
.border-t-transparent  /* Transparent top border creates the spinner effect */
.rounded-full          /* Makes it circular */

/* Ping animation (pulsing effect) */
.animate-ping          /* Scales and fades out repeatedly */
.absolute              /* Positioned absolutely */
.inset-0               /* Covers entire parent */

/* Overlay */
.absolute              /* Positioned absolutely */
.inset-0               /* Covers entire parent (top-0 right-0 bottom-0 left-0) */
.bg-white/80           /* White background with 80% opacity */
.backdrop-blur-sm      /* Blurs content behind overlay */
.z-10                  /* High z-index to appear above content */
.flex                  /* Flexbox for centering */
.items-center          /* Vertical centering */
.justify-center        /* Horizontal centering */

/* Container */
.relative              /* Required for absolute positioning of children */
```

---

## Testing Checklist

### ✅ Initial Page Load
- [ ] Navigate to `/register-event`
- [ ] Observe loading screen appears (if API is slow)
- [ ] Verify loading screen disappears when cities load
- [ ] Check error message appears if API fails

### ✅ City Selection
- [ ] Select a city from dropdown
- [ ] Verify overlay appears immediately
- [ ] Check city name appears in loading message
- [ ] Verify overlay disappears when events load
- [ ] Confirm dropdown is disabled during loading
- [ ] Check error message appears if API fails

### ✅ Visual Design
- [ ] Spinner animations work smoothly
- [ ] Colors match theme
- [ ] Dark mode works correctly
- [ ] Responsive on mobile devices
- [ ] Backdrop blur effect works

---

## Troubleshooting

### Issue: Loading state doesn't appear
**Solution:** Check that state variables are being set correctly in API calls

### Issue: Overlay doesn't cover content
**Solution:** Ensure parent container has `relative` class

### Issue: Overlay appears behind content
**Solution:** Verify overlay has `z-10` or higher z-index

### Issue: Loading state never disappears
**Solution:** Ensure `finally` block sets loading state to false

### Issue: Multiple API calls triggered
**Solution:** Verify dropdown is disabled during loading

---

## Related Files

- `app/(main)/register-event/client-page.tsx` - Main implementation
- `services/cityService.ts` - Cities API service
- `services/eventService.ts` - Events API service
- `public/test-loading-states.html` - Test page
- `LOADING_STATES_IMPLEMENTATION.md` - Detailed documentation
- `LOADING_STATES_SUMMARY.md` - High-level summary

---

**Last Updated:** 2025-10-15  
**Version:** 1.0

