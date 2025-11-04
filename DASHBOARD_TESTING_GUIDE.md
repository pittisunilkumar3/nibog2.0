# Dashboard Testing Guide

## Issues Fixed

### Issue 1: Loading State Not Displaying ✅
**Root Cause:** The loading state check was happening AFTER the authentication check. When `user` was null during initial auth loading, the `useCustomerProfile` hook would return `isLoading: false` because it received `null` as the userId parameter.

**Fix Applied:**
- Added `authLoading` state from `useAuth()` hook
- Updated loading condition to check both `authLoading || profileLoading`
- Reordered the conditional checks to show loading state BEFORE checking authentication
- This ensures the loading spinner displays while authentication is being verified AND while profile data is being fetched

### Issue 2: Bookings Not Visible ✅
**Root Cause:** The booking filter was using strict equality check `booking.status === "Confirmed"` which would fail if the API returned different case variations (e.g., "confirmed", "CONFIRMED") or other status values.

**Fixes Applied:**
1. **Case-Insensitive Status Check:** Changed all status comparisons to use `.toLowerCase()` for case-insensitive matching
2. **Flexible Filtering:** Updated filter to exclude only "cancelled" bookings instead of requiring "Confirmed" status
3. **Better Date Comparison:** Set time to start of day (00:00:00) for more accurate date comparisons
4. **Debug Logging:** Added comprehensive console logging to track:
   - Total bookings received from API
   - Each booking's details (name, date, status, ref)
   - Filter results for each booking
   - Final upcoming bookings count
5. **Improved Empty State:** Shows different messages based on whether bookings exist but are filtered out vs. no bookings at all
6. **Fallback Status Badge:** Added a catch-all badge for any status values not explicitly handled

## Testing Checklist

### 1. Loading State Test
- [ ] Navigate to `http://localhost:3111/dashboard`
- [ ] Verify loading spinner appears immediately
- [ ] Verify "Loading your dashboard..." text is visible
- [ ] Loading state should persist until both auth and profile data are loaded

### 2. Bookings Display Test
- [ ] Open browser console (F12)
- [ ] Navigate to dashboard
- [ ] Check console logs for:
  ```
  Dashboard - Total bookings: X
  Dashboard - Bookings data: [...]
  Booking 1: { event_name, event_date, status, booking_ref }
  Filtering booking XXX: { ... }
  Dashboard - Upcoming bookings count: X
  ```
- [ ] Verify bookings appear in the "Upcoming" tab
- [ ] Verify booking cards show:
  - Event name
  - Booking reference
  - Event date (formatted)
  - Status badge (with correct color)
  - Total amount
  - Games list (if available)
  - "View Details" button

### 3. Status Badge Test
Test with different status values:
- [ ] "Confirmed" / "confirmed" → Green badge
- [ ] "Pending" / "pending" → Amber outline badge
- [ ] "Cancelled" / "cancelled" → Red badge (should not appear in upcoming)
- [ ] Any other status → Gray outline badge with status text

### 4. Empty State Test
- [ ] If no upcoming bookings, verify message shows:
  - "All your bookings are in the past or cancelled" (if bookings exist)
  - "You don't have any upcoming events booked" (if no bookings at all)
  - Total bookings count (if bookings exist)

### 5. Error State Test
- [ ] Disconnect internet or block API endpoint
- [ ] Refresh dashboard
- [ ] Verify error message appears with retry button
- [ ] Click retry button
- [ ] Verify page attempts to reload

### 6. Authentication Flow Test
- [ ] Log out
- [ ] Try to access `/dashboard` directly
- [ ] Verify redirect to login page
- [ ] Log in
- [ ] Verify redirect back to dashboard with loading state

## Console Debug Output

When the dashboard loads successfully, you should see output like:

```
Dashboard - Total bookings: 2
Dashboard - Bookings data: [
  {
    booking_id: 209,
    booking_ref: "PPT250715841",
    event_name: "New India Baby Olympic Games Vizag 2025",
    event_date: "2025-08-16",
    status: "Paid",
    ...
  },
  ...
]
Booking 1: {
  event_name: "New India Baby Olympic Games Vizag 2025",
  event_date: "2025-08-16",
  status: "Paid",
  booking_ref: "PPT250715841"
}
Filtering booking PPT250715841: {
  event_date: "2025-08-16",
  status: "Paid",
  isFuture: true,
  isNotCancelled: true,
  included: true
}
Dashboard - Upcoming bookings count: 1
```

## Common Issues and Solutions

### Issue: Bookings still not showing
**Check:**
1. Console logs - Are bookings being received from API?
2. Event dates - Are they in the future?
3. Status values - Are they "cancelled"?
4. Browser timezone - Date comparisons use local timezone

**Solution:**
- Check the console logs to see filter results
- Verify API is returning correct data structure
- Check if event dates are actually in the future

### Issue: Loading state flickers
**Check:**
- Network speed - Slow connections may show loading longer
- SWR cache - Subsequent visits may load from cache instantly

**Solution:**
- This is expected behavior
- SWR caching improves performance on repeat visits

### Issue: Status badges wrong color
**Check:**
- Console logs for actual status values from API
- Case sensitivity of status values

**Solution:**
- All status checks are now case-insensitive
- Unknown statuses show gray badge with status text

## API Response Structure Expected

```json
[
  {
    "user_id": 1,
    "user_name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "email_status": "Verified",
    "phone_status": "Verified",
    "city": "Mumbai",
    "children": [...],
    "bookings": [
      {
        "booking_id": 209,
        "booking_ref": "PPT250715841",
        "event_name": "Event Name",
        "event_date": "2025-08-16",
        "status": "Confirmed",
        "total_amount": 1800,
        "payment_status": "Paid",
        "venue_id": 26,
        "games": [
          {
            "game_id": 1,
            "game_name": "Game Name",
            "game_price": 900,
            "attendance_status": "Registered"
          }
        ],
        "payments": [...]
      }
    ]
  }
]
```

## Next Steps After Testing

1. **Remove Debug Logs:** Once confirmed working, remove console.log statements from production code
2. **Add Error Tracking:** Consider adding error tracking service (e.g., Sentry) to monitor API failures
3. **Add Loading Skeletons:** Replace simple spinner with skeleton screens for better UX
4. **Add Refresh Button:** Allow users to manually refresh data without full page reload
5. **Add Filters:** Allow filtering by status, date range, etc.

