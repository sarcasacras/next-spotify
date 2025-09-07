"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useUserProfile } from "@/hooks/useUserProfile";
import Spinner from "@/components/ui/Spinner";
import { useState } from "react";

export default function Header() {
  const { data: session, status } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: userProfile, isLoading: profileLoading } = useUserProfile(
    session?.accessToken
  );
  return (
    <header className="bg-surface border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo section */}
        <div className="relative flex items-center justify-center gap-2">
          <img src="/logo.png" alt="" height={48} width={100} />
        </div>

        {/* Center search bar */}
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-hover font-bold border-2 border-surface focus:border-green-500 focus:outline-none rounded-full py-2 px-4 text-text-primary placeholder-text-secondar transition-all"
          />
        </div>

        {/* Right user section */}
        <div className="flex items-center">
          {status === "loading" ? (
            <div className="px-4 py-2 text-gray-400">Loading...</div>
          ) : session ? (
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
                <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center justify-center w-[100px] h-[44px]">
                  {isSigningOut ? (
                    <Spinner size="sm" className="text-white" />
                  ) : (
                    "Sign Out"
                  )}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                setIsSigningIn(true);
                try {
                  await signIn("spotify");
                } finally {
                  setIsSigningIn(false);
                }
              }}
              disabled={isSigningIn}
              className="relative inline-flex cursor-pointer items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center justify-center w-[100px] h-[44px]">
                {isSigningIn ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  "Sign In"
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
