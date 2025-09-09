"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { getAllUserLikedTracks } from "@/lib/spotify";

function SearchWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  const { data: likedTracksData } = useQuery({
    queryKey: ["allLikedTracks", session?.accessToken],
    queryFn: () => getAllUserLikedTracks(session!.accessToken as string),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache longer since we're fetching all tracks
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });

  return (
    <SearchProvider likedTracks={likedTracksData?.items || []}>
      {children}
    </SearchProvider>
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
        <SpotifyPlayerProvider>
          <SearchWrapper>{children}</SearchWrapper>
        </SpotifyPlayerProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
