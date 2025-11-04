# Loading States Implementation - Event Registration Page

## Overview
This document describes the loading state improvements implemented for the event registration page at `/register-event`.

## Implementation Date
2025-10-15

## Changes Made

### 1. Initial Page Load Loading State

**Location:** `app/(main)/register-event/client-page.tsx` (lines 1452-1483)

**Description:**
When the page first loads, a full-page loading indicator is displayed while the cities data is being fetched from the API. This prevents users from seeing an incomplete or broken form.

**Implementation Details:**
- Added a conditional check at the beginning of the component's return statement
- If `isLoadingCities` is `true` AND `cities.length === 0`, the loading screen is displayed
- The loading screen includes:
  - Animated spinner with dual animation (spin + ping effect)
  - Clear messaging: "Loading Event Registration"
  - Subtext: "Please wait while we prepare the registration form..."
  - Maintains the same visual design as the main page (gradient background, decorative elements)

**Code Structure:**
```typescript
if (isLoadingCities && cities.length === 0) {
  return (
    <div className="container...">
      {/* Background elements */}
      <Card className="...">
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
          {/* Dual-animation spinner */}
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping h-16 w-16 border-4 border-primary/20 rounded-full"></div>
          </div>
          {/* Loading message */}
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

### 2. City Selection Loading State

**Location:** `app/(main)/register-event/client-page.tsx` (lines 1624-1684)

**Description:**
When a user selects a city from the dropdown, a loading overlay appears immediately, covering the city selection section while the events for that city are being fetched from the API.

**Implementation Details:**
- Added `relative` positioning to the city selection container
- Created a loading overlay that appears when `isLoadingEvents && selectedCity` is true
- The overlay includes:
  - Semi-transparent backdrop with blur effect
  - Centered loading spinner with dual animation
  - City-specific message: "Loading events for {selectedCity}..."
  - "Please wait" subtext
  - High z-index (z-10) to ensure it appears above all content
- Disabled the city selector dropdown while events are loading to prevent multiple simultaneous requests

**Code Structure:**
```typescript
<div className="p-4 rounded-lg border border-dashed border-primary/20 bg-white/80 space-y-4 mb-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 relative">
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
  
  {/* City selection content */}
  <Select value={selectedCity} onValueChange={handleCityChange} disabled={cities.length === 0 || isLoadingEvents}>
    {/* ... */}
  </Select>
</div>
```

## User Experience Flow

### Scenario 1: First-time Page Visit
1. User navigates to `/register-event`
2. **Loading State 1 Activated:** Full-page loading indicator appears
3. Cities API call is made in the background
4. Once cities are loaded, the form is rendered with the city dropdown populated
5. User can now interact with the form

### Scenario 2: City Selection
1. User selects a city from the dropdown (e.g., "Hyderabad")
2. **Loading State 2 Activated:** Overlay appears over the city selection section
3. Events API call is made for the selected city
4. The overlay remains visible during the API request
5. Once events are loaded:
   - The overlay disappears
   - Event dropdown becomes available
   - User can continue with registration

### Scenario 3: API Failure
- If the cities API fails, an error message is displayed: "Failed to load cities. Please try again."
- If the events API fails, an error message is displayed: "Failed to load events. Please try again."
- Both error states are handled gracefully without showing loading indicators indefinitely

## Visual Design

### Loading Indicators
- **Primary Spinner:** Rotating border with transparent top section
- **Secondary Effect:** Pulsing/ping animation for enhanced visibility
- **Colors:** Uses theme's primary color for consistency
- **Size:** 
  - Initial page load: 16x16 (h-16 w-16)
  - City selection: 12x12 (h-12 w-12)

### Backdrop Effects
- Semi-transparent white background (80% opacity)
- Backdrop blur for depth
- Dark mode support with appropriate color adjustments

## Technical Details

### State Management
- `isLoadingCities`: Boolean state tracking cities API loading status
- `isLoadingEvents`: Boolean state tracking events API loading status
- `cities`: Array of city objects
- `selectedCity`: String representing the currently selected city

### API Calls
1. **Cities API:** `getAllCities()` from `@/services/cityService`
   - Called on component mount via `useEffect`
   - Endpoint: `https://ai.nibog.in/webhook/v1/nibog/city/get-all-city-event-count`

2. **Events API:** `getEventsByCityId(cityId)` from `@/services/eventService`
   - Called when city is selected via `handleCityChange`
   - Endpoint: Uses city ID to fetch relevant events

### Error Handling
- Try-catch blocks around all API calls
- Error states stored in `cityError` and `eventError`
- User-friendly error messages displayed in place of loading indicators
- Console logging for debugging purposes

## Testing

### Test Page
A comprehensive test page has been created at `/test-loading-states.html` to demonstrate all loading states:

1. **Test 1:** Initial page load loading state
2. **Test 2:** City selection loading state
3. **Test 3:** Complete flow simulation

The test page can be accessed at: `http://localhost:3111/test-loading-states.html`

### Manual Testing Steps
1. Open the event registration page: `http://localhost:3111/register-event`
2. Observe the initial loading state (if cities take time to load)
3. Select a city from the dropdown
4. Observe the loading overlay while events are being fetched
5. Verify that the form becomes interactive after loading completes

## Browser Compatibility
- Modern browsers with CSS animation support
- Tailwind CSS animations (spin, ping)
- Backdrop blur effect (may have limited support in older browsers)

## Accessibility
- Loading indicators provide visual feedback
- Disabled states prevent interaction during loading
- Clear, descriptive text accompanies all loading states
- Maintains keyboard navigation support

## Performance Considerations
- Loading states appear immediately upon state change
- No artificial delays added
- Minimal DOM manipulation
- CSS animations are GPU-accelerated

## Future Enhancements
1. Add skeleton loaders for more granular loading feedback
2. Implement progressive loading for large datasets
3. Add retry mechanisms for failed API calls
4. Consider adding loading progress indicators for long operations

## Known Issues
- CORS issues may occur when testing locally if the backend API doesn't allow localhost origins
- The initial loading state may flash briefly if cities load very quickly (< 100ms)

## Related Files
- `app/(main)/register-event/client-page.tsx` - Main implementation
- `services/cityService.ts` - Cities API service
- `services/eventService.ts` - Events API service
- `public/test-loading-states.html` - Test/demo page

## Conclusion
The loading state improvements provide clear visual feedback to users during API operations, preventing confusion and improving the overall user experience. The implementation follows best practices for loading states and maintains consistency with the application's design system.

