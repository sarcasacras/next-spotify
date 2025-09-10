"use client";

import MainContent from "@/components/layout/MainContent";

export default function AppError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <MainContent>
      <div className="min-h-screen bg-black text-white pb-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8">
            <h2 className="text-red-100 text-xl font-medium mb-4">Something went wrong</h2>
            <p className="text-red-200 mb-6">
              The app encountered an unexpected error. Don't worry, your music and preferences are safe.
            </p>
            <button 
              onClick={handleRefresh}
              className="bg-gradient-to-br from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 px-6 py-3 rounded-full font-medium transition-colors"
            >
              Refresh App
            </button>
          </div>
        </div>
      </div>
    </MainContent>
  );
}