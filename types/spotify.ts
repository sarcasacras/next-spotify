export interface SpotifyPaginatedResponse<T> {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: T[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  uri: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  release_date: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
}

export interface SpotifySavedTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface SpotifyLikedTracksResponse
  extends SpotifyPaginatedResponse<SpotifySavedTrack> {}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
  country?: string;
}

export interface SpotifySearchResponse {
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
}

export type SearchMode = 'library' | 'spotify';
