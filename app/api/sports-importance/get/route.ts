import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Sports importance API: Fetching data from external API...');
    
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    console.log('Sports importance API: Force refresh:', forceRefresh);
    console.log('Sports importance API: Timestamp:', timestamp);
    
    const response = await fetch(`https://ai.nibog.in/webhook/v1/nibog/sports-importance/get?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Sports importance API: External API error:', response.status, response.statusText);
      
      // Return default data if API fails
      const defaultData = {
        title: "WHY SPORTS ARE IMPORTANT TO CHILDREN",
        description: "The Child Olympic Games are a wonderful opportunity to get kids excited about sport, national pride and counting medals",
        items: [
          {
            id: "1",
            name: "Baby Crawling",
            age: "5-13 months",
            image: "/images/baby-crawling.jpg"
          },
          {
            id: "2", 
            name: "Walker",
            age: "8-18 months",
            image: "/images/walker.jpg"
          },
          {
            id: "3",
            name: "Running Race", 
            age: "13-84 months",
            image: "/images/running-race.jpg"
          }
        ]
      };
      
      return NextResponse.json(defaultData);
    }

    const data = await response.json();
    console.log('Sports importance API: Successfully fetched data');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sports importance API: Error fetching data:', error);
    
    // Return default data on error
    const defaultData = {
      title: "WHY SPORTS ARE IMPORTANT TO CHILDREN",
      description: "The Child Olympic Games are a wonderful opportunity to get kids excited about sport, national pride and counting medals",
      items: [
        {
          id: "1",
          name: "Baby Crawling",
          age: "5-13 months",
          image: "/images/baby-crawling.jpg"
        },
        {
          id: "2", 
          name: "Walker",
          age: "8-18 months",
          image: "/images/walker.jpg"
        },
        {
          id: "3",
          name: "Running Race", 
          age: "13-84 months",
          image: "/images/running-race.jpg"
        }
      ]
    };
    
    return NextResponse.json(defaultData);
  }
}
