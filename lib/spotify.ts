import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { SpotifyLikedTracksResponse } from "@/types/spotify";

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export async function getSpotifyAccessToken() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  return session.accessToken as string;
}

export async function spotifyFetch(endpoint: string, accessToken: string) {
  const url = `${SPOTIFY_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return response.json();
}

export async function getUserLikedTracks(
  accessToken: string
): Promise<SpotifyLikedTracksResponse> {
  return spotifyFetch("/me/tracks", accessToken);
}
