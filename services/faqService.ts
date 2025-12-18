/**
 * FAQ Service for NIBOG Platform
 * Handles all FAQ-related API interactions
 */

import { FAQ_API } from '@/config/api';

export interface FAQ {
  id?: number;
  question: string;
  answer: string;
  category: string;
  display_priority?: number;
  display_order?: number;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FAQsByCategory {
  [category: string]: FAQ[];
}

/**
 * Fetch all active FAQs from the API
 */
export async function getAllActiveFAQs(): Promise<FAQ[]> {
  try {
    console.log('📋 Fetching all active FAQs from API...');
    
    const response = await fetch(FAQ_API.GET_ALL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('📋 FAQ API response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch FAQs: ${response.status}`);
    }

    const data = await response.json();
    console.log('📋 FAQ API response:', data);

    // Handle different response formats
    let faqs: FAQ[] = [];
    
    if (Array.isArray(data)) {
      faqs = data;
    } else if (data.data && Array.isArray(data.data)) {
      faqs = data.data;
    } else if (data.faqs && Array.isArray(data.faqs)) {
      faqs = data.faqs;
    } else {
      console.warn('📋 Unexpected API response format:', data);
      faqs = [];
    }

    // Filter only active FAQs and sort by display_order
    const activeFAQs = faqs
      .filter(faq => faq.is_active !== false) // Include if is_active is true or undefined
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    console.log(`✅ Fetched ${activeFAQs.length} active FAQs`);
    
    return activeFAQs;
  } catch (error) {
    console.error('❌ Error fetching FAQs:', error);
    throw error;
  }
}

/**
 * Fetch all FAQs (including inactive) - for admin use
 */
export async function getAllFAQs(): Promise<FAQ[]> {
  try {
    console.log('📋 Fetching all FAQs from internal API route...');
    const response = await fetch('/api/faq/faqs', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    console.log('📋 Internal FAQ GET response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch FAQs: ${response.status}`);
    }

    const data = await response.json();
    console.log('📋 Internal FAQ GET response:', data);

    // Normalize array response
    const faqsArray: FAQ[] = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : (data.faqs && Array.isArray(data.faqs) ? data.faqs : []));

    const sortedFaqs = faqsArray.sort((a: FAQ, b: FAQ) => (a.display_priority || a.display_order || 0) - (b.display_priority || b.display_order || 0));
    console.log(`✅ Fetched ${sortedFaqs.length} FAQs (admin)`);
    return sortedFaqs;
  } catch (error) {
    console.error('❌ Error fetching FAQs:', error);
    throw error;
  }
}

/**
 * Group FAQs by category
 */
export function groupFAQsByCategory(faqs: FAQ[]): FAQsByCategory {
  const grouped: FAQsByCategory = {};

  faqs.forEach(faq => {
    const category = faq.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(faq);
  });

  // Sort FAQs within each category by display_order
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  });

  return grouped;
}

/**
 * Get FAQs by specific category
 */
export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  try {
    const allFAQs = await getAllActiveFAQs();
    return allFAQs.filter(faq => 
      faq.category.toLowerCase() === category.toLowerCase()
    );
  } catch (error) {
    console.error(`Error fetching FAQs for category ${category}:`, error);
    throw error;
  }
}

/**
 * Create a new FAQ
 */
export async function createFAQ(faqData: {
  question: string;
  answer: string;
  category: string;
  display_priority: number;
  status: string;
}): Promise<FAQ> {
  try {
    console.log('📝 Creating FAQ via internal API with data:', faqData);

    // Get auth token
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
        if (cookie) token = cookie.split('=')[1];
      }
    }

    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('/api/faq/faqs', {
      method: 'POST',
      headers,
      body: JSON.stringify(faqData)
    });

    console.log('📝 Internal FAQ Create response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Internal FAQ Create error:', errorText);
      throw new Error(`Failed to create FAQ: ${response.status}`);
    }

    const data = await response.json();
    console.log('📝 Internal FAQ Create response:', data);

    // Expect the backend to return created FAQ object
    return data.faq || data.data || data;
  } catch (error) {
    console.error('❌ Error creating FAQ:', error);
    throw error;
  }
}

/**
 * Get a single FAQ by ID
 */
export async function getSingleFAQ(id: number): Promise<FAQ> {
  try {
    console.log(`📖 Fetching FAQ with ID: ${id} via internal API`);
    const response = await fetch(`/api/faq/faqs/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    console.log('📖 Internal FAQ GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Internal FAQ GET error:', errorText);
      throw new Error(`Failed to fetch FAQ: ${response.status}`);
    }

    const data = await response.json();
    console.log('📖 Internal FAQ GET response:', data);

    const faq = data.faq || data.data || data;
    if (!faq) throw new Error('FAQ not found');

    console.log(`✅ FAQ ${id} fetched successfully`);
    return faq;
  } catch (error) {
    console.error('❌ Error fetching FAQ:', error);
    throw error;
  }
}

/**
 * Update a FAQ
 */
export async function updateFAQ(faqData: FAQ): Promise<FAQ> {
  try {
    if (!faqData.id) throw new Error('FAQ id is required for update');
    console.log('📝 Updating FAQ via internal API:', faqData);

    // Get auth token
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
        if (cookie) token = cookie.split('=')[1];
      }
    }

    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/faq/faqs/${faqData.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(faqData)
    });

    console.log('📝 Internal FAQ Update response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Internal FAQ Update error:', errorText);
      throw new Error(`Failed to update FAQ: ${response.status}`);
    }

    const data = await response.json();
    console.log('📝 Internal FAQ Update response:', data);

    return data.faq || data.data || data;
  } catch (error) {
    console.error('❌ Error updating FAQ:', error);
    throw error;
  }
}

/**
 * Delete a FAQ
 */
export async function deleteFAQ(id: number): Promise<{ success: boolean }> {
  try {
    console.log(`🗑️ Deleting FAQ with ID: ${id} via internal API`);

    // Get auth token
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      if (!token) {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token='));
        if (cookie) token = cookie.split('=')[1];
      }
    }

    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`/api/faq/faqs/${id}`, {
      method: 'DELETE',
      headers
    });

    console.log('🗑️ Internal FAQ Delete response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Internal FAQ Delete error:', errorText);
      throw new Error(`Failed to delete FAQ: ${response.status}`);
    }

    const data = await response.json();
    console.log('🗑️ Internal FAQ Delete response:', data);

    // Expect { message: 'FAQ deleted successfully' } or similar
    if (data && (data.success === true || data.message?.toLowerCase().includes('deleted'))) {
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error('❌ Error deleting FAQ:', error);
    throw error;
  }
}
