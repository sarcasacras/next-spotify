/**
 * Enhanced error handling utilities for Spotify API
 * 
 * This file contains our centralized error handling logic that mimics
 * the successful pattern used in the SpotifyPlayerContext
 */

import { getSession, signIn } from "next-auth/react";
import type { Session } from "next-auth";

interface SpotifyApiError extends Error {
  status?: number;
  response?: Response;
}

function isAuthError(error: SpotifyApiError): boolean {
  return error.status === 401 || error.status === 403;
}

function isRetryableError(error: SpotifyApiError): boolean {
  return (
    error.status === 401 ||
    error.status === 429 ||
    error.status === 500 ||
    error.status === 502 ||
    error.status === 503 ||
    error.status === 504 ||
    !error.status
  );
}

async function refreshSession(): Promise<Session | null> {
  try {
    const session = await getSession();
    
    if (session?.accessToken) {
      return session;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

async function handleAuthError(): Promise<boolean> {
  const refreshedSession = await refreshSession();
  
  if (!refreshedSession?.accessToken) {
    signIn("spotify");
    return false;
  }
  
  return true;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  onRetry?: (error: SpotifyApiError, attempt: number) => void;
}

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
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const session = await getSession();
      
      if (!session?.accessToken) {
        throw new Error("No valid session available");
      }

      return await fn(session);
      
    } catch (error) {
      lastError = error as SpotifyApiError;
      

      if (attempt > maxRetries) {
        break;
      }

      if (isAuthError(lastError)) {
        const shouldRetry = await handleAuthError();
        if (!shouldRetry) {
          break;
        }
      }
      else if (!isRetryableError(lastError)) {
        break;
      }

      onRetry?.(lastError, attempt);
      
      const delayMs = lastError.status === 429 
        ? baseDelay * Math.pow(2, attempt - 1)
        : baseDelay;
      
      await delay(delayMs);
    }
  }

  if (lastError) {
    throw lastError;
  } else {
    throw new Error("All retry attempts failed with unknown error");
  }
}

async function spotifyFetch(
  endpoint: string, 
  options: RequestInit = {}, 
  retryOptions: RetryOptions = {}
): Promise<Response> {
  return withRetry(async (session) => {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `https://api.spotify.com/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

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

async function spotifyFetchJson<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const response = await spotifyFetch(endpoint, options, retryOptions);
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    return (text || null) as T;
  }
  
  return response.json();
}

function getUserFriendlyErrorMessage(error: SpotifyApiError): string {
  if (!error.status) {
    return "Network connection failed. Please check your internet connection and try again.";
  }

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

function showErrorNotification(
  error: SpotifyApiError, 
  addNotification: (notification: any) => void
) {
  addNotification({
    type: 'error' as const,
    title: getErrorTitle(error),
    message: getUserFriendlyErrorMessage(error),
    duration: error.status === 401 ? 3000 : 5000,
  });
}

function showSuccessNotification(
  title: string,
  message: string,
  addNotification: (notification: any) => void
) {
  addNotification({
    type: 'success' as const,
    title,
    message,
    duration: 3000,
  });
}

async function spotifyFetchVoid(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<void> {
  await spotifyFetch(endpoint, options, retryOptions);
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