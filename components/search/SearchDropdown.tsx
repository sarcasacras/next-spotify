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
              <div className="relative flex bg-surface-hover rounded-lg p-1">
                {/* Animated sliding indicator */}
                <motion.div
                  className="absolute inset-y-1 bg-gradient-to-r from-pink-500 to-orange-400 rounded-md shadow-sm"
                  layoutId="search-mode-indicator"
                  style={{
                    left: searchMode === 'library' ? '0%' : '50%',
                    width: '50%',
                  }}
                  initial={false}
                  animate={{
                    left: searchMode === 'library' ? '0%' : '50%',
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                />
                
                <motion.button
                  onClick={() => setSearchMode('library')}
                  className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    searchMode === 'library'
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  Your Library
                </motion.button>
                
                <motion.button
                  onClick={() => setSearchMode('spotify')}
                  className={`relative z-10 flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    searchMode === 'spotify'
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                >
                  Spotify
                </motion.button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto no-scrollbar">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center py-8"
                  >
                    <Spinner size="sm" className="text-pink-500" />
                    <span className="ml-3 text-text-secondary">Searching...</span>
                  </motion.div>
                ) : searchResults.length > 0 ? (
                  <motion.div
                    key={`results-${searchMode}`}
                    initial={{ 
                      opacity: 0, 
                      x: searchMode === 'spotify' ? 20 : -20,
                      scale: 0.98
                    }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      scale: 1
                    }}
                    exit={{ 
                      opacity: 0, 
                      x: searchMode === 'spotify' ? -20 : 20,
                      scale: 0.98
                    }}
                    transition={{ 
                      duration: 0.25,
                      ease: "easeOut"
                    }}
                    className="py-2"
                  >
                    {searchResults.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.03,
                          ease: "easeOut",
                        }}
                      >
                        <SearchTrackItem
                          track={track}
                          isFromLibrary={searchMode === 'library'}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`empty-${searchMode}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center py-8 text-center"
                  >
                    <motion.svg
                      className="w-12 h-12 text-text-secondary mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, duration: 0.3, ease: "backOut" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </motion.svg>
                    <p className="text-text-secondary font-medium">
                      No tracks found
                    </p>
                    <p className="text-text-secondary text-sm mt-1">
                      {searchMode === 'library' 
                        ? "Try searching in Spotify instead"
                        : "Try a different search term"
                      }
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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