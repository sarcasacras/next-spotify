import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { spotifyFetchJson, spotifyFetchVoid } from "@/lib/error-handling";
import type { 
  SpotifyLikedTracksResponse, 
  SpotifySearchResponse,
  SpotifyTrack,
  SpotifySavedTrack,
  SpotifyUserProfile
} from "@/types/spotify";

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export async function getSpotifyAccessToken() {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  return session.accessToken as string;
}

// Note: We're keeping this function for backwards compatibility,
// but now it uses our enhanced error handling system
export async function spotifyFetch(endpoint: string, accessToken: string) {
  // For backwards compatibility, we'll simulate the old interface
  // but internally use our new system that doesn't need an accessToken parameter
  return spotifyFetchJson(endpoint);
}

export async function getUserLikedTracks(
  _accessToken: string,
  limit: number = 50,
  offset: number = 0
): Promise<SpotifyLikedTracksResponse> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically
  return spotifyFetchJson(`/me/tracks?limit=${limit}&offset=${offset}`);
}

export async function getAllUserLikedTracks(
  _accessToken: string
): Promise<SpotifyLikedTracksResponse> {
  const allTracks: any[] = [];
  let hasMore = true;
  let offset = 0;
  const limit = 50; // Spotify's maximum limit per request
  
  while (hasMore) {
    const response: SpotifyLikedTracksResponse = await getUserLikedTracks(
      _accessToken,
      limit,
      offset
    );
    
    allTracks.push(...response.items);
    
    // Check if there are more tracks to fetch
    hasMore = response.items.length === limit && response.next !== null;
    offset += limit;
  }
  
  // Return the same structure as a single response but with all items
  const firstResponse = await getUserLikedTracks(_accessToken, limit, 0);
  return {
    ...firstResponse,
    items: allTracks,
    total: allTracks.length,
    next: null, // No more pages since we fetched everything
    offset: 0,
    limit: allTracks.length
  };
}

export async function getUserProfile(_accessToken: string): Promise<SpotifyUserProfile> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically  
  return spotifyFetchJson("/me");
}

export async function searchSpotifyTracks(
  query: string,
  _accessToken: string,
  limit: number = 20
): Promise<SpotifySearchResponse> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically
  const encodedQuery = encodeURIComponent(query);
  return spotifyFetchJson(`/search?q=${encodedQuery}&type=track&limit=${limit}`);
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
  _accessToken: string
): Promise<void> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically
  await spotifyFetchVoid(`/me/tracks?ids=${trackId}`, {
    method: "PUT",
  });
}

export async function removeLikedTrack(
  trackId: string,
  _accessToken: string
): Promise<void> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically
  await spotifyFetchVoid(`/me/tracks?ids=${trackId}`, {
    method: "DELETE",
  });
}

export async function checkLikedTracks(
  trackIds: string[],
  _accessToken: string
): Promise<boolean[]> {
  // The accessToken parameter is now ignored as our enhanced system handles tokens automatically
  const ids = trackIds.join(',');
  return spotifyFetchJson(`/me/tracks/contains?ids=${ids}`);
}
