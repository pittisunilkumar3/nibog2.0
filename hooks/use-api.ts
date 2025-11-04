import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiResponse } from '@/lib/api/client';
import { useAuth } from '@/contexts/auth-context';

interface UseApiOptions {
  requireAuth?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: { message: string; status?: number; details?: any }) => void;
  onFinally?: () => void;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<{ message: string; status?: number; details?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const request = useCallback(
    async <T = any>(
      method: 'get' | 'post' | 'put' | 'delete' | 'patch',
      endpoint: string,
      body?: any,
      options: UseApiOptions = {}
    ): Promise<ApiResponse<T>> => {
      const { requireAuth = true, onSuccess, onError, onFinally } = options;

      setIsLoading(true);
      setError(null);

      try {
        let response: ApiResponse<T>;

        switch (method) {
          case 'get':
            response = await api.get<T>(endpoint);
            break;
          case 'post':
            response = await api.post<T>(endpoint, body);
            break;
          case 'put':
            response = await api.put<T>(endpoint, body);
            break;
          case 'delete':
            response = await api.delete<T>(endpoint);
            break;
          case 'patch':
            response = await api.patch<T>(endpoint, body);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        if (response.error) {
          // Handle authentication errors
          if (response.error.status === 401) {
            // Logout and redirect to login if token is invalid
            logout();
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            throw new Error('Your session has expired. Please log in again.');
          }

          throw new Error(response.error.message || 'An error occurred');
        }

        // Set data using a function to avoid type mismatches
        setData(() => response.data as any);
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        const errorObj = {
          message: errorMessage,
          status: (err as any)?.status,
          details: (err as any)?.details,
        };

        setError(errorObj);
        if (onError) {
          onError(errorObj);
        } else {
          // Default error handling
          console.error(`API ${method.toUpperCase()} ${endpoint} failed:`, errorMessage);
        }

        return {
          data: null,
          error: errorObj,
          status: errorObj.status || 500,
        };
      } finally {
        setIsLoading(false);
        if (onFinally) {
          onFinally();
        }
      }
    },
    [router, logout]
  );

  // Helper methods for each HTTP method
  const get = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) =>
      request<T>('get', endpoint, undefined, options),
    [request]
  );

  const post = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) =>
      request<T>('post', endpoint, body, options),
    [request]
  );

  const put = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) =>
      request<T>('put', endpoint, body, options),
    [request]
  );

  const del = useCallback(
    <T = any>(endpoint: string, options?: UseApiOptions) =>
      request<T>('delete', endpoint, undefined, options),
    [request]
  );

  const patch = useCallback(
    <T = any>(endpoint: string, body: any, options?: UseApiOptions) =>
      request<T>('patch', endpoint, body, options),
    [request]
  );

  return {
    // State
    data,
    error,
    isLoading,
    
    // Methods
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    
    // Helpers
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}

export default useApi;
