/**
 * Enhanced error handling utilities for Spotify API
 * 
 * This file contains our centralized error handling logic that mimics
 * the successful pattern used in the SpotifyPlayerContext
 */

import { getSession, signIn } from "next-auth/react";
import type { Session } from "next-auth";

// First, let's define the types of errors we might encounter
interface SpotifyApiError extends Error {
  status?: number;           // HTTP status code (401, 403, 500, etc.)
  response?: Response;       // The full fetch response object
}

/**
 * Check if an error is authentication-related (401 or 403)
 * These are the errors that should trigger a session refresh
 */
function isAuthError(error: SpotifyApiError): boolean {
  return error.status === 401 || error.status === 403;
}

/**
 * Check if an error is worth retrying
 * We'll retry auth errors, rate limits, and server errors
 */
function isRetryableError(error: SpotifyApiError): boolean {
  return (
    error.status === 401 ||  // Unauthorized - try refresh
    error.status === 429 ||  // Rate limited - wait and retry
    error.status === 500 ||  // Server error - might be temporary
    error.status === 502 ||  // Bad gateway - might be temporary
    error.status === 503 ||  // Service unavailable - might be temporary
    error.status === 504 ||  // Gateway timeout - might be temporary
    !error.status           // Network error - no status means connection failed
  );
}

/**
 * Refresh the user's session to get a fresh access token
 * This mimics the successful pattern from SpotifyPlayerContext
 */
async function refreshSession(): Promise<Session | null> {
  try {
    console.log("🔄 [ERROR HANDLER] Attempting to refresh session...");
    
    // getSession() will automatically refresh the token if needed
    // This is the same approach that works in the player context
    const session = await getSession();
    
    if (session?.accessToken) {
      console.log("🔑 [ERROR HANDLER] Session refreshed successfully");
      return session;
    } else {
      console.log("❌ [ERROR HANDLER] No valid session after refresh");
      return null;
    }
  } catch (error) {
    console.error("❌ [ERROR HANDLER] Failed to refresh session:", error);
    return null;
  }
}

/**
 * Handle auth errors by refreshing the session or redirecting to login
 * Returns true if we should retry the request, false if we should give up
 */
async function handleAuthError(): Promise<boolean> {
  console.log("🔑 [ERROR HANDLER] Auth error detected, refreshing session...");
  
  const refreshedSession = await refreshSession();
  
  if (!refreshedSession?.accessToken) {
    console.error("❌ [ERROR HANDLER] Session refresh failed, redirecting to login");
    // Redirect to login if session refresh fails
    signIn("spotify");
    return false; // Don't retry, user needs to log in
  }
  
  return true; // Retry with the fresh session
}

/**
 * Simple delay function for retry backoff
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Options for retry behavior
 */
interface RetryOptions {
  maxRetries?: number;        // How many times to retry (default: 3)
  baseDelay?: number;         // Base delay in ms (default: 1000ms = 1s)
  onRetry?: (error: SpotifyApiError, attempt: number) => void;  // Called before each retry
}

/**
 * Execute a function with automatic retry logic
 * This is the core of our error handling - similar to how the player reconnects
 */
async function withRetry<T>(
  fn: (session: Session) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    onRetry
  } = options;

  let lastError: SpotifyApiError | null = null;
  
  // Try up to maxRetries + 1 times (initial attempt + retries)
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // Get current session (this might be refreshed from previous retry)
      const session = await getSession();
      
      if (!session?.accessToken) {
        throw new Error("No valid session available");
      }

      // Execute the function
      return await fn(session);
      
    } catch (error) {
      lastError = error as SpotifyApiError;
      
      console.error(`🚨 [RETRY] Attempt ${attempt} failed:`, {
        message: lastError.message,
        status: lastError.status,
        attempt,
        maxRetries: maxRetries + 1
      });

      // If this was our last attempt, don't try to retry
      if (attempt > maxRetries) {
        break;
      }

      // Handle auth errors by refreshing session
      if (isAuthError(lastError)) {
        const shouldRetry = await handleAuthError();
        if (!shouldRetry) {
          break; // User needs to log in, stop retrying
        }
      }
      // For non-auth errors, check if it's retryable
      else if (!isRetryableError(lastError)) {
        break; // This error won't be fixed by retrying
      }

      // Call the retry callback if provided
      onRetry?.(lastError, attempt);
      
      // Calculate delay with exponential backoff for rate limits
      // Rate limits get longer delays, other errors get standard backoff
      const delayMs = lastError.status === 429 
        ? baseDelay * Math.pow(2, attempt - 1)  // 1s, 2s, 4s, 8s...
        : baseDelay;                            // 1s, 1s, 1s, 1s...
      
      console.log(`⏳ [RETRY] Waiting ${delayMs}ms before retry ${attempt + 1}...`);
      await delay(delayMs);
    }
  }

  // If we get here, all retries have been exhausted
  if (lastError) {
    console.error("💥 [RETRY] All attempts failed", {
      finalError: lastError.message,
      status: lastError.status,
      totalAttempts: maxRetries + 1
    });
    throw lastError;
  } else {
    // This shouldn't happen, but just in case
    throw new Error("All retry attempts failed with unknown error");
  }
}

/**
 * Enhanced Spotify API wrapper that uses our retry logic
 * This replaces the basic spotifyFetch with intelligent error handling
 */
async function spotifyFetch(
  endpoint: string, 
  options: RequestInit = {}, 
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async (session) => {
    // Build the full URL
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `https://api.spotify.com/v1${endpoint}`;
    
    console.log(`🌐 [API] ${options.method || 'GET'} ${endpoint}`);
    
    // Make the fetch request with the session token
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers, // Allow overriding default headers
      },
    });

    // If the response is not OK, create an error with status info
    if (!response.ok) {
      const error = new Error(
        `Spotify API error: ${response.status} ${response.statusText}`
      ) as SpotifyApiError;
      error.status = response.status;
      error.response = response;
      throw error;
    }

    return response;
  }, retryOptions);
}

/**
 * Enhanced JSON fetch wrapper - most common use case
 * Returns the parsed JSON response, or null for empty responses
 */
async function spotifyFetchJson<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await spotifyFetch(endpoint, options, retryOptions);
  
  // Handle empty responses (like 204 No Content from PUT/DELETE operations)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  // Check if response has content before trying to parse JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // For non-JSON responses, return the text content or null
    const text = await response.text();
    return (text || null) as T;
  }
  
  return response.json();
}

/**
 * Convert technical errors into user-friendly messages
 * This helps users understand what went wrong without technical jargon
 */
function getUserFriendlyErrorMessage(error: SpotifyApiError): string {
  // Network errors (no status code)
  if (!error.status) {
    return "Network connection failed. Please check your internet connection and try again.";
  }

  // Map specific HTTP status codes to user-friendly messages
  switch (error.status) {
    case 401:
      return "Your session has expired. The page will refresh automatically.";
    case 403:
      return "Access denied. Some features require a Spotify Premium subscription.";
    case 404:
      return "The requested content was not found. It may have been removed or moved.";
    case 429:
      return "Too many requests. Please wait a moment before trying again.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Spotify is experiencing technical difficulties. Please try again in a few minutes.";
    default:
      return "Something went wrong. Please try again, and contact support if the problem persists.";
  }
}

/**
 * Get a short title for the error (for notifications)
 */
function getErrorTitle(error: SpotifyApiError): string {
  if (!error.status) return "Connection Error";
  
  switch (error.status) {
    case 401: return "Session Expired";
    case 403: return "Access Denied";
    case 404: return "Not Found";
    case 429: return "Rate Limited";
    case 500:
    case 502:
    case 503:
    case 504: return "Server Error";
    default: return "Error";
  }
}

/**
 * Show an error notification to the user
 * This is a helper that combines error parsing with notification display
 */
function showErrorNotification(
  error: SpotifyApiError, 
  addNotification: (notification: any) => void
) {
  addNotification({
    type: 'error' as const,
    title: getErrorTitle(error),
    message: getUserFriendlyErrorMessage(error),
    duration: error.status === 401 ? 3000 : 5000, // Auth errors dismiss faster
  });
}

/**
 * Show a success notification
 */
function showSuccessNotification(
  title: string,
  message: string,
  addNotification: (notification: any) => void
) {
  addNotification({
    type: 'success' as const,
    title,
    message,
    duration: 3000, // Success messages are shorter
  });
}

/**
 * Enhanced fetch wrapper for operations that don't return data (like PUT/DELETE)
 * Just ensures the request succeeds without trying to parse response
 */
async function spotifyFetchVoid(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<void> {
  await spotifyFetch(endpoint, options, retryOptions);
  // Don't try to parse the response, just ensure it succeeded
}

export { 
  isAuthError, 
  isRetryableError, 
  refreshSession, 
  handleAuthError, 
  withRetry,
  delay,
  spotifyFetch,
  spotifyFetchJson,
  spotifyFetchVoid,
  getUserFriendlyErrorMessage,
  getErrorTitle,
  showErrorNotification,
  showSuccessNotification,
  type SpotifyApiError,
  type RetryOptions 
};