import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local testimonials storage
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


    // Parse the request body
    const { id } = await request.json();


    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return NextResponse.json(
        { error: "Invalid testimonial ID. ID must be a positive number." },
        { status: 400 }
      );
    }

    const testimonialId = Number(id);

    // Read existing testimonials
    const testimonials = readTestimonials();


    // Find the testimonial to delete
    const testimonialIndex = testimonials.findIndex((t: any) => t.id === testimonialId);

    if (testimonialIndex === -1) {

      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const testimonialToDelete = testimonials[testimonialIndex];


    // Remove the testimonial from the array
    testimonials.splice(testimonialIndex, 1);

    // Save updated testimonials back to file
    writeTestimonials(testimonials);



    // Return success response in the same format as external API
    return NextResponse.json([{ success: true }], { status: 200 });

  } catch (error: any) {
    console.error("Local Delete API: Error deleting testimonial:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete testimonial from local storage" },
      { status: 500 }
    );
  }
}

// Also support DELETE method for consistency
export async function DELETE(request: Request) {
  return POST(request);
}
