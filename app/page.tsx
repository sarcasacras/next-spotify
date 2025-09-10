"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { getAllUserLikedTracks } from "@/lib/spotify";
import { SpotifyAlbum } from "@/types/spotify";
import AlbumGrid from "@/components/music/AlbumGrid";
import { extractUniqueAlbums } from "@/lib/album-utils";
import { useQuery } from "@tanstack/react-query";
import Spinner from "@/components/ui/Spinner";
import LandingPage from "@/components/landing/LandingPage";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import AlbumGridError from "@/components/error/AlbumGridError";

export default function Home() {
  const { data: session } = useSession();

  const {
    data: tracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allLikedTracks", session?.accessToken],
    queryFn: () => getAllUserLikedTracks(session!.accessToken as string),
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - cache longer since we're fetching all tracks
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
  });

  const albums: SpotifyAlbum[] = React.useMemo(() => {
    return tracks ? extractUniqueAlbums(tracks) : [];
  }, [tracks]);

  if (!session?.accessToken) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-0 md:pb-24">
      <main className="p-8">
        {isLoading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Spinner size="lg" className="text-pink-500 w-12 h-12" />
          </div>
        )}

        {error && (
          <p className="text-red-400">
            Error loading your music: {error.message}
          </p>
        )}

        {albums.length > 0 && (
          <ErrorBoundary 
            context="Album Grid"
            fallback={<AlbumGridError />}
          >
            <AlbumGrid albums={albums} likedTracks={tracks} />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}
