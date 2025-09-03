"use client";

import { useSession } from "next-auth/react";
import { getUserLikedTracks } from "@/lib/spotify";
import { useState, useEffect } from "react";
import { SpotifyAlbum, SpotifyLikedTracksResponse } from "@/types/spotify";
import AlbumGrid from "@/components/music/AlbumGrid";
import { extractUniqueAlbums } from "@/lib/album-utils";

export default function Home() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<SpotifyLikedTracksResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [albums, setAlbums] = useState<SpotifyAlbum[]>([]);

  const fetchTracks = async () => {
    if (!session?.accessToken) return;
    setLoading(true);

    try {
      const data = await getUserLikedTracks(session.accessToken);
      setTracks(data);
      const uniqueAlbums = extractUniqueAlbums(data);
      setAlbums(uniqueAlbums);
    } catch (error) {
      console.error("Error fetching tracks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchTracks();
    }
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="p-8">

        {loading && <p className="text-gray-400">Loading your music...</p>}

        {albums.length > 0 && <AlbumGrid albums={albums} />}
      </main>
    </div>
  );
}
