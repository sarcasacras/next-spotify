"use client";

import { useSession } from "next-auth/react";
import { getUserLikedTracks } from "@/lib/spotify";
import { SpotifyAlbum } from "@/types/spotify";
import AlbumGrid from "@/components/music/AlbumGrid";
import { extractUniqueAlbums } from "@/lib/album-utils";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: session } = useSession();

  const {
    data: tracks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["likedTracks", session?.accessToken],
    queryFn: () => getUserLikedTracks(session!.accessToken as string),
    enabled: !!session?.accessToken,
  });

  const albums: SpotifyAlbum[] = tracks ? extractUniqueAlbums(tracks) : [];

  if (!session?.accessToken) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Please sign in to view your music library
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <main className="p-8">
        {isLoading && <p className="text-gray-400">Loading your music...</p>}

        {error && (
          <p className="text-red-400">
            Error loading your music: {error.message}
          </p>
        )}

        {albums.length > 0 && (
          <AlbumGrid albums={albums} likedTracks={tracks} />
        )}
      </main>
    </div>
  );
}
