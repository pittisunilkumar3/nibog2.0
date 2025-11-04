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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get user by ID
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const users = await getAllUsers();
    return users.find(user => user.user_id === userId) || null;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw error;
  }
}

// Toggle user active status
export async function toggleUserActiveStatus(userId: number, isActive: boolean): Promise<boolean> {
  // This is a placeholder for the actual API call
  // In a real implementation, you would call the API to update the user's status
  console.log(`Toggling user ${userId} active status to ${isActive}`);
  return true;
}

// Toggle user locked status
export async function toggleUserLockedStatus(userId: number, isLocked: boolean): Promise<boolean> {
  // This is a placeholder for the actual API call
  // In a real implementation, you would call the API to update the user's locked status
  console.log(`Toggling user ${userId} locked status to ${isLocked}`);
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
  console.log(`Attempting to create a new user`);

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
    console.log(`Sending POST request to /api/users/create with user data`);
    console.log(`Request body: ${JSON.stringify(userData)}`);

    const response = await fetch('/api/users/create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log(`Create user response status: ${response.status}`);

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
    console.log(`Create user response data:`, data);

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
  full_name: string;
  email: string;
  phone: string;
  password?: string;
  city_id?: number | null;
  accept_terms?: boolean;
  is_active?: boolean;
  is_locked?: boolean;
}

export async function updateUser(userData: UpdateUserData): Promise<User> {
  console.log(`Attempting to update user with ID: ${userData.user_id}`);

  // Validate required fields
  if (!userData.user_id || isNaN(Number(userData.user_id)) || Number(userData.user_id) <= 0) {
    throw new Error("Invalid user ID. ID must be a positive number.");
  }

  if (!userData.full_name || userData.full_name.trim() === '') {
    throw new Error("Full name is required");
  }

  if (!userData.email || userData.email.trim() === '') {
    throw new Error("Email is required");
  }

  if (!userData.phone || userData.phone.trim() === '') {
    throw new Error("Phone is required");
  }

  // Make city_id validation optional
  if (userData.city_id !== undefined && userData.city_id !== null && isNaN(Number(userData.city_id))) {
    throw new Error("City ID must be a number if provided");
  }

  try {
    // Prepare the data to send, explicitly handling null values
    const requestData = {
      ...userData,
      // Ensure city_id is included as null if explicitly set to null
      ...(userData.city_id === null && { city_id: null })
    };

    console.log('Sending POST request to /api/users/edit with user data');
    console.log('Request body:', JSON.stringify(requestData, null, 2));

    const response = await fetch('/api/users/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log(`Update user response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);

      try {
        // Try to parse the error response as JSON
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `API returned error status: ${response.status}`);
      } catch (parseError) {
        // If parsing fails, throw a generic error
        throw new Error(`Failed to update user. API returned status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log(`Update user response data:`, data);

    // Return the first item if it's an array, otherwise return the data
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    } else if (data && typeof data === 'object') {
      return data;
    }

    // If we get here, the response format was unexpected
    console.error(`Unexpected response format:`, data);
    throw new Error("Failed to update user: Unexpected response format");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

// Delete user
export async function deleteUser(userId: number): Promise<boolean> {
  console.log(`Attempting to delete user with ID: ${userId}`);

  // Ensure userId is a number
  const numericUserId = Number(userId);

  if (!numericUserId || isNaN(numericUserId) || numericUserId <= 0) {
    console.error(`Invalid user ID: ${userId}, converted to: ${numericUserId}`);
    throw new Error("Invalid user ID. ID must be a positive number.");
  }

  try {
    // Use our internal API route to avoid CORS issues
    console.log(`Sending POST request to /api/users/delete with user_id: ${numericUserId}`);
    const requestBody = { user_id: numericUserId };
    console.log(`Request body: ${JSON.stringify(requestBody)}`);

    const response = await fetch('/api/users/delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      cache: "no-store", // Ensure we don't get a cached response
    });

    console.log(`Delete user response status: ${response.status}`);

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
    console.log(`Delete user raw response:`, responseText);

    // Try to parse the response as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`Delete user parsed response data:`, data);
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      // If the response is empty or not valid JSON but the status is OK, consider it a success
      if (response.status >= 200 && response.status < 300) {
        console.log("Response is not valid JSON but status is OK, considering it a success");
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
      console.log("Response format doesn't match expected but status is OK, considering it a success");
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
