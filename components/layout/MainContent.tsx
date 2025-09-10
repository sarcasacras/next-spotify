"use client";

import { useSession } from "next-auth/react";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { data: session } = useSession();

  // Apply header padding when user is authenticated (Header is visible)
  // Apply bottom padding on mobile only to prevent overlap with fixed Spotify player
  const mainClasses = session?.accessToken ? "pt-16 pb-32 md:pb-0" : "";

  return (
    <main className={mainClasses}>
      {children}
    </main>
  );
}