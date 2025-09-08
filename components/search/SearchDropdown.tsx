"use client";

import { motion, AnimatePresence } from "motion/react";
import { useSearch } from "@/contexts/SearchContext";
import SearchTrackItem from "./SearchTrackItem";
import Spinner from "@/components/ui/Spinner";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchDropdown({ isOpen, onClose }: SearchDropdownProps) {
  const {
    query,
    searchMode,
    setSearchMode,
    searchResults,
    isLoading,
  } = useSearch();

  if (!isOpen || !query.trim()) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-transparent z-40"
            onClick={onClose}
          />

          {/* Dropdown */}
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {/* Search Mode Toggle */}
            <div className="border-b border-border p-3">
              <div className="flex bg-surface-hover rounded-lg p-1">
                <button
                  onClick={() => setSearchMode('library')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    searchMode === 'library'
                      ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Your Library
                </button>
                <button
                  onClick={() => setSearchMode('spotify')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    searchMode === 'spotify'
                      ? 'bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Spotify
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" className="text-pink-500" />
                  <span className="ml-3 text-text-secondary">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.05,
                        ease: "easeOut",
                      }}
                    >
                      <SearchTrackItem
                        track={track}
                        isFromLibrary={searchMode === 'library'}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <svg
                    className="w-12 h-12 text-text-secondary mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <p className="text-text-secondary font-medium">
                    No tracks found
                  </p>
                  <p className="text-text-secondary text-sm mt-1">
                    {searchMode === 'library' 
                      ? "Try searching in Spotify instead"
                      : "Try a different search term"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="border-t border-border px-3 py-2 bg-surface-hover">
              <p className="text-xs text-text-secondary text-center">
                {searchMode === 'library' 
                  ? `Searching in your ${searchResults.length} liked tracks` 
                  : `${searchResults.length} results from Spotify`
                }
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}