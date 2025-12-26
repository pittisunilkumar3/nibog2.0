# Checkbox Fix for Multi-Game Selection

## Issue
The slot selection checkboxes were appearing as circular radio buttons instead of square checkboxes.

## Root Cause
The Radix UI checkbox component had `rounded-sm` which can appear circular on some browsers/devices due to CSS specificity issues or caching.

## Fixes Applied

### 1. Base Checkbox Component (`components/ui/checkbox.tsx`)
- Added `!rounded-[0.25rem]` with `!important` to force square corners
- Changed `border` to `border-2` for better visibility
- Added explicit checked state styling with `data-[state=checked]:border-primary`

### 2. Slot Checkbox Styling (`app/(main)/register-event/client-page.tsx`)
- Used `!rounded-none` to completely remove any rounded corners
- Kept `border-2` for consistent border width
- Added `data-testid` for testing

### 3. Debugging
- Added `console.debug('[handleGameSelection]')` to log selection changes

## Verification Steps

1. **Clear Browser Cache**:
   ```bash
   # Hard refresh in browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   ```

2. **Restart Dev Server**:
   ```bash
   # Stop current server (Ctrl+C)
   pnpm dev
   # or
   npm run dev
   ```

3. **Check in Browser**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Navigate to register-event page
   - Select multiple slots across different games
   - Verify:
     - Checkboxes appear as **squares** (not circles)
     - Console shows: `[handleGameSelection] Updated selected games: [...]`
     - Multiple slots can be selected simultaneously
     - Selection count badge shows correct number

4. **Inspect Element**:
   - Right-click on a checkbox
   - Select "Inspect" or "Inspect Element"
   - Verify the element has:
     - `class` includes `rounded-none` or `rounded-[0.25rem]`
     - NO `rounded-full` or `rounded-circle` classes
     - `border-radius: 0` or very small value (not 50%)

## Technical Details

### Before:
```tsx
className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ..."
```

### After:
```tsx
className="peer h-4 w-4 shrink-0 !rounded-[0.25rem] border-2 border-primary ..."
```

### Slot Checkbox Before:
```tsx
className="h-5 w-5 rounded-sm border-2"
```

### Slot Checkbox After:
```tsx
className="h-5 w-5 !rounded-none border-2"
```

## Expected Behavior

- ✅ Checkboxes appear as **square** shapes
- ✅ Multiple slots can be selected across different games
- ✅ Clicking a selected checkbox deselects it
- ✅ Selection count badge updates correctly
- ✅ Payment proceeds with multiple `booking_games` entries

## If Issue Persists

If you still see circular checkboxes after following verification steps:

1. **Check for CSS conflicts**:
   ```bash
   # Search for any global CSS affecting checkboxes
   grep -r "rounded-full" app/
   grep -r "border-radius.*50%" app/
   ```

2. **Browser DevTools**:
   - Open DevTools → Elements
   - Find the checkbox element
   - Check "Computed" tab
   - Look for `border-radius` value
   - If it's `50%` or `9999px`, there's a CSS override

3. **Try different browser**:
   - Test in Chrome, Firefox, Edge
   - Some browsers cache CSS aggressively

4. **Nuclear option** (clear all caches):
   ```bash
   # Delete .next folder
   rm -rf .next
   # Reinstall dependencies
   pnpm install
   # Rebuild
   pnpm build
   # Run dev
   pnpm dev
   ```

## Testing Checklist

- [ ] Checkboxes are square (not circular)
- [ ] Can select multiple slots
- [ ] Can deselect by clicking again
- [ ] Console shows selection logs
- [ ] Payment payload includes multiple games
- [ ] Selection count badge updates correctly
- [ ] No visual glitches or layout issues

---

**Date**: December 26, 2025
**Status**: Fixed
**Modified Files**:
- `components/ui/checkbox.tsx`
- `app/(main)/register-event/client-page.tsx`
