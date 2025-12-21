// User service for handling user-related API calls
import { USER_API } from '@/config/api';

// Define the User type based on the API response
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  email_verified: boolean;
  phone: string;
  phone_verified: boolean;
  password_hash?: string;
  city_id: number;
  accepted_terms: boolean;
  terms_accepted_at: string | null;
  is_active: boolean;
  is_locked: boolean;
  locked_until: string | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  city_name: string;
  state: string;
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    // Use our internal API route to avoid CORS issues and enable caching
    const response = await fetch('/api/users/get-all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    // The API now returns an array directly
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: expected array');
    }
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: number): Promise<User | null> {
  try {


    // Get token from local/session storage - try superadmin token first, then admin token
    let token = '';
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('superadminToken') ||
        sessionStorage.getItem('superadminToken') ||
        localStorage.getItem('adminToken') ||
        sessionStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('token') || '';
    }



    const response = await fetch(`/api/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      cache: 'no-store',
    });



    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error(`[getUserById] Error response:`, data);
      throw new Error(data.message || `Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();


    return data || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
}

// Toggle user active status
export async function toggleUserActiveStatus(userId: number, isActive: boolean): Promise<boolean> {
  // This is a placeholder for the actual API call
  // In a real implementation, you would call the API to update the user's status

  return true;
}

// Toggle user locked status
export async function toggleUserLockedStatus(userId: number, isLocked: boolean): Promise<boolean> {
  // This is a placeholder for the actual API call
  // In a real implementation, you would call the API to update the user's locked status

  return true;
}

// Create user
export interface CreateUserData {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  city_id: number;
  accept_terms: boolean;
}

export async function createUser(userData: CreateUserData): Promise<User> {


  // Validate required fields
  if (!userData.full_name || userData.full_name.trim() === '') {
    throw new Error("Full name is required");
  }

  if (!userData.email || userData.email.trim() === '') {
    throw new Error("Email is required");
  }

  if (!userData.phone || userData.phone.trim() === '') {
    throw new Error("Phone is required");
  }

  if (!userData.password || userData.password.trim() === '') {
    throw new Error("Password is required");
  }

  if (!userData.city_id || isNaN(Number(userData.city_id))) {
    throw new Error("City ID is required and must be a number");
  }

  if (userData.accept_terms !== true) {
    throw new Error("You must accept the terms and conditions");
  }

  try {
    // Use our internal API route to avoid CORS issues


    const response = await fetch('/api/users/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to create user. API returned status: ${response.status}`);
      }
    }

    const data = await response.json();


    // Return the first item if it's an array, otherwise return the data
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object') {
      return data;
    }

    // If we get here, the response format was unexpected
    console.error(`Unexpected response format:`, data);
    throw new Error("Failed to create user: Unexpected response format");
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Update user
export interface UpdateUserData {
  user_id: number;
  full_name?: string;
  email?: string;
  phone?: string;
  password?: string;
  city_id?: number | null;
  accept_terms?: boolean;
  is_active?: boolean;
  is_locked?: boolean;
}

export async function updateUser(userData: UpdateUserData): Promise<any> {
  if (!userData.user_id || isNaN(Number(userData.user_id)) || Number(userData.user_id) <= 0) {
    throw new Error("Invalid user ID. ID must be a positive number.");
  }



  // Only send fields that are provided (partial update)
  const { user_id, accept_terms, ...fields } = userData;
  const payload: Record<string, any> = {};

  // Only include fields that are explicitly set and not undefined
  for (const key in fields) {
    const value = fields[key as keyof typeof fields];
    if (value !== undefined) {
      payload[key] = value;
    }
  }

  // Don't send accept_terms for updates - it's only for registration


  // Get token from local/session storage - try superadmin token first, then admin token
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('superadminToken') ||
      sessionStorage.getItem('superadminToken') ||
      localStorage.getItem('adminToken') ||
      sessionStorage.getItem('adminToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') || '';
  }



  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(`/api/users/${user_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });



  const data = await response.json();


  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to update user');
  }
  return data;
}

// Delete user
export async function deleteUser(userId: number): Promise<boolean> {


  // Ensure userId is a number
  const numericUserId = Number(userId);

  if (!numericUserId || isNaN(numericUserId) || numericUserId <= 0) {
    console.error(`Invalid user ID: ${userId}, converted to: ${numericUserId}`);
    throw new Error("Invalid user ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    const requestBody = { user_id: numericUserId };

    const response = await fetch('/api/users/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store", // Ensure we don't get a cached response
    });



    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to delete user. API returned status: ${response.status}`);
      }
    }

    // Get the response text first to log it
    const responseText = await response.text();


    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);

    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      // If the response is empty or not valid JSON but the status is OK, consider it a success
      if (response.status >= 200 && response.status < 300) {

        return true;
      }
      throw new Error("Failed to parse API response");
    }

    // Check if the response indicates success
    if (Array.isArray(data) && data.length > 0 && data[0].success === true) {
      return true;
    } else if (data && data.success === true) {
      return true;
    } else if (response.status >= 200 && response.status < 300) {
      // If the status is OK but the response doesn't match our expected format,
      // still consider it a success

      return true;
    }

    // If we get here, the response format was unexpected
    console.error(`Unexpected response format:`, data);
    throw new Error("Failed to delete user: Unexpected response format");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
