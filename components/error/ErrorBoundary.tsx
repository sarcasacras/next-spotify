"use client";

import React, { Component, ReactNode } from 'react';
import { useNotification } from '@/contexts/NotificationContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string; // For logging which component failed
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Lightweight error boundary for catching component crashes
 * Works alongside our API error handling system
 */
class ErrorBoundaryClass extends Component<Props & { onError?: (error: Error, context: string) => void }, State> {
  constructor(props: Props & { onError?: (error: Error, context: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const context = this.props.context || 'Unknown Component';
    
    // Log the error for debugging
    console.error(`🚨 [ERROR BOUNDARY] ${context} crashed:`, error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Call the error callback if provided
    this.props.onError?.(error, context);
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback
      return (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-100">
          <h3 className="font-medium text-sm mb-2">Something went wrong</h3>
          <p className="text-xs opacity-75">
            This component crashed unexpectedly. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper to integrate with our notification system
 */
export function ErrorBoundary({ children, fallback, context }: Props) {
  const { addNotification } = useNotification();
  
  const handleError = (error: Error, errorContext: string) => {
    // Show a user-friendly notification
    addNotification({
      type: 'error',
      title: 'Component Error',
      message: `${errorContext} encountered an unexpected error. Please try refreshing the page.`,
      duration: 8000, // Longer for serious errors
    });
  };

  return (
    <ErrorBoundaryClass onError={handleError} fallback={fallback} context={context}>
      {children}
    </ErrorBoundaryClass>
  );
}

export default ErrorBoundary;