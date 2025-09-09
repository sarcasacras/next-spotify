import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { 
  SpotifyLikedTracksResponse, 
  SpotifySearchResponse,
  SpotifyTrack,
  SpotifySavedTrack
} from "@/types/spotify";

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
  accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<SpotifyLikedTracksResponse> {
  return spotifyFetch(`/me/tracks?limit=${limit}&offset=${offset}`, accessToken);
}

export async function getAllUserLikedTracks(
  accessToken: string
): Promise<SpotifyLikedTracksResponse> {
  const allTracks: any[] = [];
  let hasMore = true;
  let offset = 0;
  const limit = 50; // Spotify's maximum limit per request
  
  while (hasMore) {
    const response: SpotifyLikedTracksResponse = await getUserLikedTracks(
      accessToken,
      limit,
      offset
    );
    
    allTracks.push(...response.items);
    
    // Check if there are more tracks to fetch
    hasMore = response.items.length === limit && response.next !== null;
    offset += limit;
  }
  
  // Return the same structure as a single response but with all items
  const firstResponse = await getUserLikedTracks(accessToken, limit, 0);
  return {
    ...firstResponse,
    items: allTracks,
    total: allTracks.length,
    next: null, // No more pages since we fetched everything
    offset: 0,
    limit: allTracks.length
  };
}

export async function getUserProfile(accessToken: string) {
  return spotifyFetch("/me", accessToken);
}

export async function searchSpotifyTracks(
  query: string,
  accessToken: string,
  limit: number = 20
): Promise<SpotifySearchResponse> {
  const encodedQuery = encodeURIComponent(query);
  return spotifyFetch(`/search?q=${encodedQuery}&type=track&limit=${limit}`, accessToken);
}

export function searchUserLibrary(
  query: string,
  likedTracks: SpotifySavedTrack[]
): SpotifyTrack[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  
  return likedTracks
    .filter(({ track }) => 
      track.name.toLowerCase().includes(searchTerm) ||
      track.artists.some(artist => artist.name.toLowerCase().includes(searchTerm)) ||
      track.album.name.toLowerCase().includes(searchTerm)
    )
    .map(({ track }) => track);
}

export async function saveLikedTrack(
  trackId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${SPOTIFY_BASE_URL}/me/tracks?ids=${trackId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to save track: ${response.status} ${response.statusText}. ${errorText}`);
  }
}

export async function removeLikedTrack(
  trackId: string,
  accessToken: string
): Promise<void> {
  const response = await fetch(`${SPOTIFY_BASE_URL}/me/tracks?ids=${trackId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove track: ${response.status} ${response.statusText}. ${errorText}`);
  }
}

export async function checkLikedTracks(
  trackIds: string[],
  accessToken: string
): Promise<boolean[]> {
  const ids = trackIds.join(',');
  return spotifyFetch(`/me/tracks/contains?ids=${ids}`, accessToken);
}
