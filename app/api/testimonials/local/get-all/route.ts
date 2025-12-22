import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Local testimonials storage
const TESTIMONIALS_FILE = path.join(process.cwd(), 'data', 'local-testimonials.json');

// Read testimonials from local storage
function readTestimonials() {
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

export async function GET() {
  try {


    // Read local testimonials
    const localTestimonials = readTestimonials();

    // Also get testimonials from backend for comparison/backup
    let externalTestimonials = [];
    try {
      const base = (process.env.BACKEND_URL || 'http://localhost:3004').replace(/\/$/, '');
      const externalResponse = await fetch(`${base}/api/testimonials?limit=1000&offset=0`, { cache: 'no-store' });
      if (externalResponse.ok) {
        externalTestimonials = await externalResponse.json();
        // Normalize backend response to array if it uses { data: [...] }
        externalTestimonials = externalTestimonials.data || externalTestimonials || [];
        externalTestimonials = externalTestimonials.map((t: any) => ({
          ...t,
          source: 'backend'
        }));
      }
    } catch (error) {

    }

    // Combine local and external testimonials
    // Local testimonials take priority (they have city names)
    const allTestimonials = [...localTestimonials, ...externalTestimonials];

    // Remove duplicates (prefer local over external)
    const uniqueTestimonials = allTestimonials.reduce((acc: any[], current: any) => {
      const existing = acc.find((t: any) => t.name === current.name && t.testimonial === current.testimonial);
      if (!existing) {
        acc.push(current);
      } else if (current.source === 'local' && existing.source === 'external') {
        // Replace external with local version
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    }, [] as any[]);



    return NextResponse.json(uniqueTestimonials, { status: 200 });

  } catch (error: any) {
    console.error("Local API: Error getting testimonials:", error);

    return NextResponse.json(
      { error: error.message || "Failed to get testimonials" },
      { status: 500 }
    );
  }
}
