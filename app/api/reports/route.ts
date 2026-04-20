import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const { searchParams } = new URL(request.url);
    const cityFilterParam = searchParams.get('city_id') || '';
    const eventId = searchParams.get('event_id') || '';

    const bookingsUrl = `${BACKEND_URL}/api/bookings/all`;
    const response = await fetch(bookingsUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const result = await response.json();
    const bookings = result.data || result || [];

    // Filter by city/event if provided
    const filtered = bookings.filter((b: any) => {
      if (cityFilterParam) {
        const city = b.event?.venue?.city || b.city_name || '';
        if (city !== cityFilterParam) return false;
      }
      if (eventId && String(b.event?.id || b.event_id || '') !== eventId) return false;
      return true;
    });

    // ---- OVERVIEW ----
    const totalBookings = filtered.length;
    const totalRevenue = filtered.reduce((s: number, b: any) => s + (parseFloat(b.total_amount) || 0), 0);
    const paidBookings = filtered.filter((b: any) => b.payment_status === 'Paid');
    const paidRevenue = paidBookings.reduce((s: number, b: any) => s + (parseFloat(b.total_amount) || 0), 0);
    const pendingBookings = filtered.filter((b: any) => b.payment_status === 'Pending').length;
    const confirmedBookings = filtered.filter((b: any) => b.status === 'Confirmed' || b.payment_status === 'Paid').length;

    // ---- CHILDREN COUNT ----
    let totalChildren = 0;
    const childGenderDist: Record<string, number> = {};
    const childAgeGroupDist: Record<string, number> = { '0-1 yr': 0, '1-2 yr': 0, '2-4 yr': 0, '4-6 yr': 0, '6+ yr': 0 };
    filtered.forEach((b: any) => {
      const children = b.children || [];
      totalChildren += children.length;
      children.forEach((child: any) => {
        // Gender
        const gRaw = child.gender || 'Unknown';
        const g = gRaw.charAt(0).toUpperCase() + gRaw.slice(1).toLowerCase(); // Normalize casing
        childGenderDist[g] = (childGenderDist[g] || 0) + 1;

        // Age group (at event date or now)
        if (child.date_of_birth) {
          const refDate = b.event?.date ? new Date(b.event.date) : new Date();
          const birth = new Date(child.date_of_birth);
          const ageMonths = (refDate.getFullYear() - birth.getFullYear()) * 12 + (refDate.getMonth() - birth.getMonth());
          if (ageMonths < 12) childAgeGroupDist['0-1 yr']++;
          else if (ageMonths < 24) childAgeGroupDist['1-2 yr']++;
          else if (ageMonths < 48) childAgeGroupDist['2-4 yr']++;
          else if (ageMonths < 72) childAgeGroupDist['4-6 yr']++;
          else childAgeGroupDist['6+ yr']++;
        }
      });
    });

    // ---- GAME BOOKING COUNT ----
    let totalGameBookings = 0;
    const gamePopularity: Record<string, { bookings: number; revenue: number }> = {};
    filtered.forEach((b: any) => {
      const children = b.children || [];
      children.forEach((child: any) => {
        const games = child.booking_games || [];
        totalGameBookings += games.length;
        games.forEach((game: any) => {
          const name = game.game_name || 'Unknown Game';
          if (!gamePopularity[name]) gamePopularity[name] = { bookings: 0, revenue: 0 };
          gamePopularity[name].bookings++;
          gamePopularity[name].revenue += parseFloat(game.game_price) || 0;
        });
      });
    });

    // ---- UNIQUE PARENTS ----
    const uniqueParents = new Set<string>();
    filtered.forEach((b: any) => {
      const email = b.parent?.email || '';
      if (email) uniqueParents.add(email);
    });

    // ---- GAMES PER BOOKING ----
    const gamesPerBooking = totalBookings > 0 ? totalGameBookings / totalBookings : 0;

    // ---- REVENUE BY CITY ----
    const revenueByCity: Record<string, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
    filtered.forEach((b: any) => {
      const city = b.event?.venue?.city || b.city_name || 'Unknown';
      if (!revenueByCity[city]) revenueByCity[city] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 };
      revenueByCity[city].bookings++;
      revenueByCity[city].revenue += parseFloat(b.total_amount) || 0;
      const kids = b.children || [];
      revenueByCity[city].children += kids.length;
      kids.forEach((child: any) => {
        revenueByCity[city].gameBookings += (child.booking_games || []).length;
      });
    });

    // ---- REVENUE BY EVENT ----
    const revenueByEvent: Record<string, { bookings: number; revenue: number; city: string; date: string; children: number; gameBookings: number }> = {};
    filtered.forEach((b: any) => {
      const eventTitle = b.event?.name || b.event_title || 'Unknown Event';
      if (!revenueByEvent[eventTitle]) {
        revenueByEvent[eventTitle] = {
          bookings: 0, revenue: 0,
          city: b.event?.venue?.city || b.city_name || '',
          date: b.event?.date || b.event_date || '',
          children: 0, gameBookings: 0
        };
      }
      revenueByEvent[eventTitle].bookings++;
      revenueByEvent[eventTitle].revenue += parseFloat(b.total_amount) || 0;
      const kids = b.children || [];
      revenueByEvent[eventTitle].children += kids.length;
      kids.forEach((child: any) => {
        revenueByEvent[eventTitle].gameBookings += (child.booking_games || []).length;
      });
    });

    // ---- MONTHLY TREND ----
    const monthlyTrend: Record<string, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
    filtered.forEach((b: any) => {
      const dateStr = b.booking_date || b.created_at || b.updated_at;
      if (dateStr) {
        const d = new Date(dateStr);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyTrend[month]) monthlyTrend[month] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 };
        monthlyTrend[month].bookings++;
        monthlyTrend[month].revenue += parseFloat(b.total_amount) || 0;
        const kids = b.children || [];
        monthlyTrend[month].children += kids.length;
        kids.forEach((child: any) => {
          monthlyTrend[month].gameBookings += (child.booking_games || []).length;
        });
      }
    });

    // ---- PAYMENT STATUS DISTRIBUTION ----
    const paymentStatusDist: Record<string, number> = {};
    filtered.forEach((b: any) => {
      const status = b.payment_status || 'Unknown';
      paymentStatusDist[status] = (paymentStatusDist[status] || 0) + 1;
    });

    // ---- BOOKING STATUS DISTRIBUTION ----
    const bookingStatusDist: Record<string, number> = {};
    filtered.forEach((b: any) => {
      const status = b.status || 'Unknown';
      bookingStatusDist[status] = (bookingStatusDist[status] || 0) + 1;
    });

    // ---- UNIQUE CITIES & EVENTS for dropdowns ----
    const citySet = new Map<string, string>();
    const eventSet = new Map<string, string>();
    filtered.forEach((b: any) => {
      const cityName = b.event?.venue?.city || b.city_name;
      if (cityName) {
        if (!citySet.has(cityName)) citySet.set(cityName, cityName);
      }
      const eventIdVal = String(b.event?.id || b.event_id || '');
      const eventTitle = b.event?.name || b.event_title || '';
      if (eventIdVal && eventTitle) eventSet.set(eventIdVal, eventTitle);
    });

    const data: Record<string, any> = {
      overview: {
        totalBookings,
        totalRevenue,
        paidRevenue,
        paidBookings: paidBookings.length,
        pendingBookings,
        confirmedBookings,
        avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        totalChildren,
        totalGameBookings,
        uniqueParents: uniqueParents.size,
        gamesPerBooking: Math.round(gamesPerBooking * 10) / 10,
      },
      revenueByCity: Object.entries(revenueByCity).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue),
      revenueByEvent: Object.entries(revenueByEvent).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.revenue - a.revenue),
      gamePopularity: Object.entries(gamePopularity).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.bookings - a.bookings),
      monthlyTrend: Object.entries(monthlyTrend).sort((a, b) => a[0].localeCompare(b[0])).map(([month, d]) => ({ month, ...d })),
      paymentStatusDist: Object.entries(paymentStatusDist).map(([name, value]) => ({ name, value })),
      bookingStatusDist: Object.entries(bookingStatusDist).map(([name, value]) => ({ name, value })),
      childGenderDist: Object.entries(childGenderDist).map(([name, value]) => ({ name, value })),
      childAgeGroupDist: Object.entries(childAgeGroupDist).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value })),
      cities: Array.from(citySet.entries()).map(([id, name]) => ({ id, name })),
      events: Array.from(eventSet.entries()).map(([id, name]) => ({ id, name })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
