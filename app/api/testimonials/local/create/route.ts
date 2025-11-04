import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local testimonials storage (using JSON file for simplicity)
// In production, this would use a proper database like PostgreSQL
const TESTIMONIALS_FILE = path.join(process.cwd(), 'data', 'local-testimonials.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(TESTIMONIALS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read testimonials from local storage
function readTestimonials() {
  ensureDataDirectory();
  
  if (!fs.existsSync(TESTIMONIALS_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(TESTIMONIALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading testimonials file:', error);
    return [];
  }
}

// Write testimonials to local storage
function writeTestimonials(testimonials: any[]) {
  ensureDataDirectory();
  
  try {
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(testimonials, null, 2));
  } catch (error) {
    console.error('Error writing testimonials file:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    console.log("Local API: Creating testimonial with city name");

    // Parse the request body
    const testimonialData = await request.json();
    console.log("Local API: Received data:", testimonialData);

    // Validate required fields
    if (!testimonialData.name || !testimonialData.city || !testimonialData.event_id || 
        !testimonialData.rating || !testimonialData.testimonial) {
      return NextResponse.json(
        { error: "Missing required testimonial data" },
        { status: 400 }
      );
    }

    // Read existing testimonials
    const testimonials = readTestimonials();
    
    // Generate new ID
    const newId = testimonials.length > 0 ? Math.max(...testimonials.map((t: any) => t.id)) + 1 : 1;
    
    // Create new testimonial with city NAME (not ID)
    const newTestimonial = {
      id: newId,
      name: testimonialData.name,
      city: testimonialData.city, // Store actual city NAME
      event_id: testimonialData.event_id,
      rating: testimonialData.rating,
      testimonial: testimonialData.testimonial,
      submitted_at: new Date().toISOString().split('T')[0],
      status: testimonialData.status || 'Published',
      created_at: new Date().toISOString(),
      source: 'local' // Mark as locally stored
    };

    // Add to testimonials array
    testimonials.push(newTestimonial);
    
    // Save to file
    writeTestimonials(testimonials);

    console.log("Local API: Testimonial created successfully:", newTestimonial);

    // Return the created testimonial in the same format as external API
    return NextResponse.json([newTestimonial], { status: 200 });

  } catch (error: any) {
    console.error("Local API: Error creating testimonial:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to create testimonial locally" },
      { status: 500 }
    );
  }
}
