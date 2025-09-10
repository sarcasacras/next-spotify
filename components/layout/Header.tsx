"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useUserProfile } from "@/hooks/useUserProfile";
import Spinner from "@/components/ui/Spinner";
import { useState, useRef, useEffect } from "react";
import { useSearch } from "@/contexts/SearchContext";
import SearchDropdown from "@/components/search/SearchDropdown";

export default function Header() {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(
    session?.accessToken
  );
  const { query, setQuery, isOpen, setIsOpen } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  // Auto-open dropdown when typing
  useEffect(() => {
    if (query.trim() && document.activeElement === inputRef.current) {
      setIsOpen(true);
    } else if (!query.trim()) {
      setIsOpen(false);
    }
  }, [query, setIsOpen]);
  
  // Don't render Header on landing page (when user is not authenticated)
  if (!session?.accessToken) {
    return null;
  }
  return (
    <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border h-16 z-50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo section */}
        <div className="relative flex items-center justify-center gap-2">
          <img src="/logo.png" alt="" height={48} width={100} />
        </div>

        {/* Center search bar */}
        <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for tracks..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim()) setIsOpen(true);
              }}
              className={`w-full bg-surface-hover font-bold border-2 pl-10 pr-4 py-2 rounded-full text-text-primary placeholder-text-secondary transition-all focus:outline-none ${
                isOpen && query.trim()
                  ? "border-pink-500 shadow-lg shadow-pink-500/20"
                  : "border-surface focus:border-green-500"
              }`}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <SearchDropdown
            isOpen={isOpen && query.trim() !== ""}
            onClose={() => setIsOpen(false)}
          />
        </div>

        {/* Right user section */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            {profileLoading ? (
              <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse" />
            ) : userProfile?.images?.[0]?.url ? (
              <Image
                src={userProfile.images[0].url}
                alt={userProfile.display_name || "User"}
                width={64}
                height={64}
                className="rounded-full w-10 h-10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface-hover flex items-center justify-center">
                <span className="text-text-secondary text-sm">
                  {userProfile?.display_name?.[0] || "U"}
                </span>
              </div>
            )}
            <button
              onClick={async () => {
                setIsSigningOut(true);
                try {
                  await signOut();
                } finally {
                  setIsSigningOut(false);
                }
              }}
              disabled={isSigningOut}
              className="relative inline-flex cursor-pointer items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 dark:text-white dark:hover:text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center justify-center w-[100px] h-[35px]">
                {isSigningOut ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  "Sign Out"
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
