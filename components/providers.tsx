"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { getAllUserLikedTracks } from "@/lib/spotify";
import type { SpotifySavedTrack } from "@/types/spotify";

function ContextWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  const { data: likedTracksData } = useQuery({
    queryKey: ["allLikedTracks", session?.accessToken],
    queryFn: () => getAllUserLikedTracks(session!.accessToken as string),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache longer since we're fetching all tracks
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });

  const tracks: SpotifySavedTrack[] = likedTracksData?.items || [];

  return (
    <SpotifyPlayerProvider initialLikedTracks={tracks}>
      <SearchProvider likedTracks={tracks}>
        {children}
      </SearchProvider>
    </SpotifyPlayerProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ContextWrapper>{children}</ContextWrapper>
      </QueryClientProvider>
    </SessionProvider>
  );
}
