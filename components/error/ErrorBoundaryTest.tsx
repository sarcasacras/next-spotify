"use client";

import { useState } from 'react';

/**
 * Test component to verify error boundaries work correctly
 * ONLY USE IN DEVELOPMENT - Remove from production builds
 */
export function ErrorBoundaryTest() {
  const [shouldCrash, setShouldCrash] = useState(false);

  if (shouldCrash) {
    // This will throw an error and trigger the error boundary
    throw new Error("Test error - Error boundary working correctly!");
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
        <p className="text-yellow-100 text-xs mb-2">Error Boundary Test</p>
        <button
          onClick={() => setShouldCrash(true)}
          className="bg-yellow-700 hover:bg-yellow-600 px-2 py-1 rounded text-xs transition-colors"
        >
          Test Crash
        </button>
      </div>
    </div>
  );
}