"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { getUserLikedTracks } from "@/lib/spotify";

function SearchWrapper({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  
  const { data: likedTracksData } = useQuery({
    queryKey: ["likedTracks", session?.accessToken],
    queryFn: () => getUserLikedTracks(session!.accessToken as string),
    enabled: !!session?.accessToken,
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
