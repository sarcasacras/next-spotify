"use client";

import { useSession } from "next-auth/react";
import { getUserLikedTracks } from "@/lib/spotify";
import { useState } from "react";
import { SpotifyLikedTracksResponse } from "@/types/spotify";
import { extractUniqueAlbums } from "@/lib/album-utils";

export default function Home() {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<SpotifyLikedTracksResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTracks = async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    try {
      const data = await getUserLikedTracks(session.accessToken);
      setTracks(data);
      const uniqueAlbums = extractUniqueAlbums(data);
    } catch (error) {
      console.error("Error deleting tracks", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Welcome to Next-Spotify</h1>
        <p className="text-gray-400">
          Your music streaming experience starts here
        </p>
      </main>
      <div className="p-8">
        <button
          onClick={fetchTracks}
          disabled={!session?.accessToken || loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 px-4 py-2 rounded text-white"
        >
          {loading ? "Loading..." : "Fetch my tracks"}
        </button>
        {tracks && (
          <div className="mt-8 p-4 bg-gray-900 rounded">
            <h2 className="text-lg font-semibold mb-2">
              My tracks ({tracks.total}):
            </h2>
            <pre className="text-sm text-green-400 overflow-x-auto">
              {JSON.stringify(tracks, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
