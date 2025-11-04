import { getSession } from '@/lib/auth/session';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiResponse<T = any> {
  data: T | null;
  error: {
    message: string;
    status?: number;
    details?: any;
  } | null;
  status: number;
}

// Base URL configuration
const getBaseUrl = () => {
  // In browser, use relative URL. In server, use full URL
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }
  return ''; // Browser will use relative URL
};

export async function apiClient<T = any>(
  endpoint: string,
  options: {
    method?: RequestMethod;
    body?: any;
    headers?: Record<string, string>;
    noAuth?: boolean;
    isExternal?: boolean; // For external API calls
  } = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers: customHeaders = {},
    noAuth = false,
  } = options;

  // Get the auth token if needed
  let authToken: string | null = null;
  if (!options.noAuth) {
    try {
      authToken = await getSession();
      if (!authToken && !options.isExternal) {
        throw new Error('No authentication token found');
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Authentication error:', error);
      }
      // Don't fail for external API calls
      if (!options.isExternal) {
        return {
          data: null,
          error: {
            message: 'Authentication required',
            status: 401,
          },
          status: 401,
        };
      }
    }
  }

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // Prepare request config
  const config: RequestInit = {
    method,
    headers,
    credentials: 'include', // Important for cookies
  };

  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    config.body = JSON.stringify(body);
  }

  const url = getBaseUrl() + `/api${endpoint}`;

  try {
    const response = await fetch(url, config);
    let data: any = null;

    try {
      // Try to parse JSON, but don't fail if the response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else if (contentType && contentType.startsWith('text/')) {
        data = await response.text();
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      // Continue with null data if parsing fails
    }

    if (!response.ok) {
      const errorMessage = data?.message || 
                         (data?.error && typeof data.error === 'string' ? data.error : 'An error occurred') ||
                         response.statusText ||
                         'Request failed';
      
      return {
        data: null,
        error: {
          message: errorMessage,
          status: response.status,
          details: data,
        },
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error(`API request to ${url} failed:`, error);
    
    return {
      data: null,
      error: {
        message: errorMessage,
        status: 0,
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      status: 0,
    };
  }
}

// Helper methods for common HTTP methods
export const api = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiClient<T>(endpoint, { method: 'GET', headers }),
  
  post: <T = any>(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ) => apiClient<T>(endpoint, { method: 'POST', body, headers }),
  
  put: <T = any>(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ) => apiClient<T>(endpoint, { method: 'PUT', body, headers }),
  
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) =>
    apiClient<T>(endpoint, { method: 'DELETE', headers }),
  
  patch: <T = any>(
    endpoint: string,
    body: any,
    headers?: Record<string, string>
  ) => apiClient<T>(endpoint, { method: 'PATCH', body, headers }),
};
