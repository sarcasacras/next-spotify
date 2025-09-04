"use client";

import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Header() {
  const { data: session, status } = useSession();
  const {
    data: userProfile,
    isLoading: profileLoading,
  } = useUserProfile(session?.accessToken);

  return (
    <header className="bg-surface border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo section */}
        <div className="flex items-center justify-center gap-2">
          <Image src="/logo.png" alt="" height={48} width={100} />
        </div>

        {/* Center search bar */}
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-hover rounded-full py-2 px-4 text-text-primary placeholder-text-secondary border border-border focus:border-primary focus:outline-none transition-colors"
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
                onClick={() => signOut()}
                className="px-4 py-2 cursor-pointer bg-surface-hover text-text-primary rounded-full font-medium hover:bg-secondary transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("spotify")}
              className="px-4 py-2 cursor-pointer bg-primary text-text-primary rounded-full font-medium hover:bg-primary-hover transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
