"use client";

import { useSession } from "next-auth/react";

interface MainContentProps {
  children: React.ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { data: session } = useSession();

  // Apply header padding only when user is authenticated (Header is visible)
  const mainClasses = session?.accessToken ? "pt-16" : "";

  return (
    <main className={mainClasses}>
      {children}
    </main>
  );
}