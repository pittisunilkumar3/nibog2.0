import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Game importance API: Fetching data from external API...');
    
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const url = new URL(request.url);
    const forceRefresh = url.searchParams.get('refresh') === 'true';
    
    console.log('Game importance API: Force refresh:', forceRefresh);
    console.log('Game importance API: Timestamp:', timestamp);
    
    const response = await fetch(`https://ai.nibog.in/webhook/v1/nibog/game-importance/get?t=${timestamp}`, {
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
      console.error('Game importance API: External API error:', response.status, response.statusText);
      
      // Return default data if API fails
      const defaultData = {
        title: "WHY GAMES ARE IMPORTANT FOR CHILDREN",
        description: "Educational games and play activities are fundamental for children's cognitive, social, and emotional development",
        items: [
          {
            id: "1",
            name: "Cognitive Development",
            description: "Games enhance problem-solving skills, memory, and critical thinking abilities through engaging challenges and puzzles that stimulate brain development.",
            icon: "/images/baby-olympics/baby-crawling.jpg"
          },
          {
            id: "2",
            name: "Social Skills",
            description: "Playing games with others teaches cooperation, communication, sharing, and how to handle winning and losing gracefully in group settings.",
            icon: "/images/baby-olympics/ring-holding.jpg"
          },
          {
            id: "3",
            name: "Physical Development",
            description: "Active games improve hand-eye coordination, fine motor skills, balance, and overall physical fitness in growing children.",
            icon: "/images/baby-olympics/running-race.jpg"
          },
          {
            id: "4",
            name: "Creativity & Imagination",
            description: "Games encourage creative thinking, storytelling, and imaginative play that helps children express themselves and explore new ideas.",
            icon: "/images/baby-olympics/hurdle-toddle.jpg"
          },
          {
            id: "5",
            name: "Emotional Intelligence",
            description: "Games help children understand and manage emotions, develop empathy, build confidence, and learn emotional resilience.",
            icon: "/images/baby-olympics/cycle-race.jpg"
          },
          {
            id: "6",
            name: "Learning Through Fun",
            description: "Educational games make learning enjoyable and natural, helping children absorb knowledge while having fun and staying engaged.",
            icon: "/images/baby-walker.jpg"
          }
        ]
      };
      
      return NextResponse.json(defaultData);
    }

    const data = await response.json();
    console.log('Game importance API: Successfully fetched data');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Game importance API: Error fetching data:', error);
    
    // Return default data on error
    const defaultData = {
      title: "WHY GAMES ARE IMPORTANT FOR CHILDREN",
      description: "Educational games and play activities are fundamental for children's cognitive, social, and emotional development",
      items: [
        {
          id: "1",
          name: "Cognitive Development",
          description: "Games enhance problem-solving skills, memory, and critical thinking abilities through engaging challenges and puzzles that stimulate brain development.",
          icon: "/images/baby-olympics/baby-crawling.jpg"
        },
        {
          id: "2",
          name: "Social Skills",
          description: "Playing games with others teaches cooperation, communication, sharing, and how to handle winning and losing gracefully in group settings.",
          icon: "/images/baby-olympics/ring-holding.jpg"
        },
        {
          id: "3",
          name: "Physical Development",
          description: "Active games improve hand-eye coordination, fine motor skills, balance, and overall physical fitness in growing children.",
          icon: "/images/baby-olympics/running-race.jpg"
        },
        {
          id: "4",
          name: "Creativity & Imagination",
          description: "Games encourage creative thinking, storytelling, and imaginative play that helps children express themselves and explore new ideas.",
          icon: "/images/baby-olympics/hurdle-toddle.jpg"
        },
        {
          id: "5",
          name: "Emotional Intelligence",
          description: "Games help children understand and manage emotions, develop empathy, build confidence, and learn emotional resilience.",
          icon: "/images/baby-olympics/cycle-race.jpg"
        },
        {
          id: "6",
          name: "Learning Through Fun",
          description: "Educational games make learning enjoyable and natural, helping children absorb knowledge while having fun and staying engaged.",
          icon: "/images/baby-walker.jpg"
        }
      ]
    };
    
    return NextResponse.json(defaultData);
  }
}
