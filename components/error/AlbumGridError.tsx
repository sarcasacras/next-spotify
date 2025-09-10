"use client";

export default function AlbumGridError() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="text-center p-8">
      <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-md mx-auto">
        <h3 className="text-red-100 font-medium mb-2">Album Grid Unavailable</h3>
        <p className="text-red-200 text-sm mb-4">
          The album display encountered an error. Your music is safe.
        </p>
        <button 
          onClick={handleRefresh}
          className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-sm transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}