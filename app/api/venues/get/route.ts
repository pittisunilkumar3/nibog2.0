import { NextResponse } from 'next/server';

// Support both POST and GET methods for flexibility
export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestData = await request.json();
    const id = requestData.id;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid venue ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    return await getVenueById(id);
  } catch (error: any) {
    console.error("Server API route: Error fetching venue:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venue" },
      { status: 500 }
    );
  }
}

// Helper function to get venue by ID
async function getVenueById(id: number) {
  try {
    console.log(`Server API route: Fetching venue with ID: ${id}`);

    // First try to get all venues with city details and filter by ID
    // This is more reliable since we know this endpoint works
    console.log("Server API route: Trying to find venue in all venues with city details...");

    const allVenuesResponse = await fetch("https://ai.nibog.in/webhook/v1/nibog/venues/getall-with-city", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (allVenuesResponse.ok) {
      const allVenues = await allVenuesResponse.json();
      console.log(`Server API route: Retrieved ${allVenues.length} venues with city details`);

      // Find the venue with the matching ID
      const venue = allVenues.find((v: any) => v.venue_id === id || v.id === id);

      if (venue) {
        console.log(`Server API route: Found venue with ID ${id} in all venues list`);
        return NextResponse.json(venue, { status: 200 });
      } else {
        console.log(`Server API route: Venue with ID ${id} not found in all venues list`);
      }
    }

    // If we couldn't find the venue in the all venues list, try the direct API
    console.log("Server API route: Trying direct API call...");

    // Forward the request to the external API with the correct URL
    const apiUrl = "https://ai.nibog.in/webhook/v1/nibog/venues/get";
    console.log("Server API route: Calling API URL:", apiUrl);

    // Try POST method first (most reliable for sending data)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
      cache: "no-store",
    });

    console.log(`Server API route: Get venue response status: ${response.status}`);

    if (response.ok) {
      // Get the response data
      const responseText = await response.text();
      console.log(`Server API route: Raw response: ${responseText}`);

      try {
        // Try to parse the response as JSON
        const venueData = JSON.parse(responseText);
        console.log(`Server API route: Retrieved venue data:`, venueData);

        // Handle different response formats
        if (Array.isArray(venueData) && venueData.length > 0) {
          // If the API returns an array with one venue, return the first item
          return NextResponse.json(venueData[0], { status: 200 });
        } else if (venueData && typeof venueData === 'object' && !Array.isArray(venueData)) {
          // If the API returns a single venue object, return it
          return NextResponse.json(venueData, { status: 200 });
        } else if (Array.isArray(venueData) && venueData.length === 0) {
          // If the API returns an empty array, the venue doesn't exist
          console.log(`Server API route: Venue with ID ${id} not found (empty array)`);
        } else {
          console.log(`Server API route: Unexpected response format from API`, venueData);
        }
      } catch (parseError) {
        console.error("Server API route: Error parsing response:", parseError);
      }
    } else {
      console.log(`Server API route: POST method failed with status ${response.status}`);
    }

    // If POST method failed or returned unexpected data, try GET method
    console.log("Server API route: Trying GET method...");

    try {
      // Try GET method as specified in the documentation
      const getResponse = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Note: Sending a body with GET is non-standard but specified in the docs
        // Some servers/frameworks might ignore this body
        body: JSON.stringify({ id }),
        cache: "no-store",
      });

      console.log(`Server API route: GET method response status: ${getResponse.status}`);

      if (getResponse.ok) {
        const getResponseText = await getResponse.text();
        console.log(`Server API route: GET method raw response: ${getResponseText}`);

        try {
          const getData = JSON.parse(getResponseText);

          if (Array.isArray(getData) && getData.length > 0) {
            return NextResponse.json(getData[0], { status: 200 });
          } else if (getData && typeof getData === 'object' && !Array.isArray(getData)) {
            return NextResponse.json(getData, { status: 200 });
          }
        } catch (parseError) {
          console.error("Server API route: Error parsing GET response:", parseError);
        }
      }
    } catch (getError) {
      console.error("Server API route: Error with GET method:", getError);
    }

    // If we get here, all approaches failed
    console.log(`Server API route: All approaches failed to find venue with ID ${id}`);

    // Return a 404 error
    return NextResponse.json(
      { error: `Venue with ID ${id} not found. Please check if the venue exists.` },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Server API route: Error in getVenueById function:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch venue" },
      { status: 500 }
    );
  }
}
