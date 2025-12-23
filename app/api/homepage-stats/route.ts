import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'

import { USER_API, CITY_API, BABY_GAME_API } from '@/config/api';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache variables
let cachedStats: any = null;
let cacheTimestamp = 0;

export async function GET() {
  try {

    // Check if we have cached data that's still valid
    const now = Date.now();
    if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedStats, { status: 200 });
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3004';

    // Fetch data from all three endpoints in parallel
    const [usersResponse, citiesResponse, gamesResponse] = await Promise.all([
      fetch(USER_API.GET_ALL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch(`${BACKEND_URL}/api/city/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }),
      fetch(BABY_GAME_API.GET_ALL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
    ]);

    // Initialize counts with fallback values
    let userCount = 1500; // Fallback to current static value
    let cityCount = 21;   // Fallback to current static value  
    let gameCount = 16;   // Fallback to current static value

    // Process users response
    if (usersResponse.ok) {
      try {
        const usersData = await usersResponse.json();
        if (Array.isArray(usersData)) {
          userCount = usersData.length;
        }
      } catch (error) {
        console.error("Homepage stats API: Error parsing users data:", error);
      }
    } else {
      console.warn("Homepage stats API: Users API failed, using fallback");
    }

    // Process cities response
    if (citiesResponse.ok) {
      try {
        const citiesData = await citiesResponse.json();
        if (Array.isArray(citiesData)) {
          // Count only active cities
          cityCount = citiesData.filter(city => city.is_active === true || city.is_active === 1).length;
        }
      } catch (error) {
        console.error("Homepage stats API: Error parsing cities data:", error);
      }
    } else {
      console.warn("Homepage stats API: Cities API failed, using fallback");
    }

    // Process games response
    if (gamesResponse.ok) {
      try {
        const gamesData = await gamesResponse.json();
        if (Array.isArray(gamesData)) {
          // Count only active games
          gameCount = gamesData.filter(game => game.is_active !== false).length;
        }
      } catch (error) {
        console.error("Homepage stats API: Error parsing games data:", error);
      }
    } else {
      console.warn("Homepage stats API: Games API failed, using fallback");
    }

    // Prepare stats object
    const stats = {
      userRegistrations: userCount,
      totalCities: cityCount,
      totalGames: gameCount,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json(stats, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'X-Timestamp': now.toString()
      }
    });

  } catch (error) {
    console.error("Homepage stats API: Error fetching stats:", error);

    // Return fallback stats in case of error
    const fallbackStats = {
      userRegistrations: 1500,
      totalCities: 21,
      totalGames: 16,
      lastUpdated: new Date().toISOString(),
      error: "Using fallback data due to API error"
    };

    return NextResponse.json(fallbackStats, { status: 200 });
  }
}
