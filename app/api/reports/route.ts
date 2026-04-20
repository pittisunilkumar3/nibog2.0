import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';
    const { searchParams } = new URL(request.url);
    const cityFilterParam = searchParams.get('city_id') || '';
    const eventId = searchParams.get('event_id') || '';
    const eventStatusFilter = searchParams.get('event_status') || ''; // active, completed, all

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

    // Helper: determine if an event is active or completed
    const isEventActive = (b: any): boolean | null => {
      const eventDate = b.event?.date;
      if (!eventDate) return null;
      const d = new Date(eventDate);
      const now = new Date();
      // Event is active/upcoming if event_date >= today
      return d >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
    };

    // Filter by city/event/event_status if provided
    const filtered = bookings.filter((b: any) => {
      if (cityFilterParam) {
        const city = b.event?.venue?.city || b.city_name || '';
        if (city !== cityFilterParam) return false;
      }
      if (eventId && String(b.event?.id || b.event_id || '') !== eventId) return false;
      if (eventStatusFilter === 'active') {
        const active = isEventActive(b);
        if (active !== true) return false;
      } else if (eventStatusFilter === 'completed') {
        const active = isEventActive(b);
        if (active !== false) return false;
      }
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

    // ---- MONTHLY TREND (default, kept for backward compat) ----
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

    // ---- DETAILED TREND (today / weekly / monthly / yearly) ----
    const trendPeriod = searchParams.get('trend_period') || 'monthly';
    let trendData: { label: string; bookings: number; revenue: number; children: number; gameBookings: number }[] = [];

    if (trendPeriod === 'today') {
      // 24 hours: 12am, 1am ... 11pm
      const hourMap: Record<number, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
      for (let h = 0; h < 24; h++) hourMap[h] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 };
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered.forEach((b: any) => {
        const dateStr = b.booking_date || b.created_at || b.updated_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d >= todayStart) {
          const h = d.getHours();
          hourMap[h].bookings++;
          hourMap[h].revenue += parseFloat(b.total_amount) || 0;
          const kids = b.children || [];
          hourMap[h].children += kids.length;
          kids.forEach((child: any) => { hourMap[h].gameBookings += (child.booking_games || []).length; });
        }
      });
      trendData = Object.entries(hourMap).map(([h, d]) => ({
        label: `${Number(h) === 0 ? '12' : Number(h) > 12 ? Number(h) - 12 : Number(h)}${Number(h) < 12 ? 'am' : 'pm'}`,
        ...d
      }));
    } else if (trendPeriod === 'weekly') {
      // Mon-Sun of current week
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset);
      const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const dayMap: Record<string, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
      dayNames.forEach(d => dayMap[d] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 });
      filtered.forEach((b: any) => {
        const dateStr = b.booking_date || b.created_at || b.updated_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d >= weekStart) {
          let jsDay = d.getDay(); // 0=Sun
          let idx = jsDay === 0 ? 6 : jsDay - 1; // convert to Mon=0
          const name = dayNames[idx];
          dayMap[name].bookings++;
          dayMap[name].revenue += parseFloat(b.total_amount) || 0;
          const kids = b.children || [];
          dayMap[name].children += kids.length;
          kids.forEach((child: any) => { dayMap[name].gameBookings += (child.booking_games || []).length; });
        }
      });
      trendData = dayNames.map(name => ({ label: name, ...dayMap[name] }));
    } else if (trendPeriod === 'monthly') {
      // Days 1-31 of current month
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const dayMap: Record<number, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
      for (let i = 1; i <= daysInMonth; i++) dayMap[i] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 };
      filtered.forEach((b: any) => {
        const dateStr = b.booking_date || b.created_at || b.updated_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate();
          dayMap[day].bookings++;
          dayMap[day].revenue += parseFloat(b.total_amount) || 0;
          const kids = b.children || [];
          dayMap[day].children += kids.length;
          kids.forEach((child: any) => { dayMap[day].gameBookings += (child.booking_games || []).length; });
        }
      });
      trendData = Object.entries(dayMap).map(([day, d]) => ({ label: `${day}`, ...d }));
    } else if (trendPeriod === 'yearly') {
      // Jan-Dec of current year
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const now = new Date();
      const moMap: Record<number, { bookings: number; revenue: number; children: number; gameBookings: number }> = {};
      for (let i = 0; i < 12; i++) moMap[i] = { bookings: 0, revenue: 0, children: 0, gameBookings: 0 };
      filtered.forEach((b: any) => {
        const dateStr = b.booking_date || b.created_at || b.updated_at;
        if (!dateStr) return;
        const d = new Date(dateStr);
        if (d.getFullYear() === now.getFullYear()) {
          const mo = d.getMonth();
          moMap[mo].bookings++;
          moMap[mo].revenue += parseFloat(b.total_amount) || 0;
          const kids = b.children || [];
          moMap[mo].children += kids.length;
          kids.forEach((child: any) => { moMap[mo].gameBookings += (child.booking_games || []).length; });
        }
      });
      trendData = Object.entries(moMap).map(([mo, d]) => ({ label: monthNames[Number(mo)], ...d }));
    }

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
      trend: trendData,
      cities: Array.from(citySet.entries()).map(([id, name]) => ({ id, name })),
      events: Array.from(eventSet.entries()).map(([id, name]) => ({ id, name })),
      activeEvents: bookings.filter((b: any) => isEventActive(b) === true)
        .reduce((set: Set<string>, b: any) => { const eid = String(b.event?.id||''); if(eid) set.add(eid); return set; }, new Set()).size,
      completedEvents: bookings.filter((b: any) => isEventActive(b) === false)
        .reduce((set: Set<string>, b: any) => { const eid = String(b.event?.id||''); if(eid) set.add(eid); return set; }, new Set()).size,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
