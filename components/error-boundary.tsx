'use client';

import { Component, ErrorInfo, ReactNode, ComponentType } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetErrorBoundary: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A reusable error boundary component that catches JavaScript errors in its child component tree.
 * It can be used to display a fallback UI when an error occurs.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Check if the error is an authentication error
      if (this.state.error?.message === 'Authentication required') {
        return (
          <AuthErrorHandler 
            error={this.state.error} 
            onRetry={this.resetErrorBoundary} 
          />
        );
      }

      // Use the provided fallback or the default one
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          // We know this.state.error is not null here because hasError is true
          return this.props.fallback(this.state.error as Error, this.resetErrorBoundary);
        }
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-4 bg-red-50 rounded-md">
          <h2 className="text-lg font-medium text-red-800">Something went wrong</h2>
          <p className="mt-1 text-sm text-red-700">{this.state.error?.message}</p>
          <button
            onClick={this.resetErrorBoundary}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A component that handles authentication errors specifically
 */
function AuthErrorHandler({ 
  error, 
  onRetry 
}: { 
  error: Error; 
  onRetry: () => void;
}) {
  const router = useRouter();
  
  const handleLogin = () => {
    // Redirect to login with the current path as the callback URL
    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/login?callbackUrl=${redirectUrl}`);
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900">Session Expired</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your session has expired. Please log in again to continue.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogin}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Login
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * A higher-order component that wraps a component with an ErrorBoundary
 * @param WrappedComponent The component to wrap
 * @param fallback An optional fallback UI to show when an error occurs
 * @returns A new component wrapped with ErrorBoundary
 */
export function withErrorBoundary<P extends Record<string, unknown>>(
  WrappedComponent: ComponentType<P>,
  fallback?: ReactNode | ((error: Error, resetErrorBoundary: () => void) => ReactNode)
) {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  // Format the display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

// Default export for backward compatibility
export default ErrorBoundary;
