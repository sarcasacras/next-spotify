"use client";

import React, { 
  createContext, 
  useContext, 
  useState, 
  useCallback, 
  useEffect,
  ReactNode 
} from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { 
  searchSpotifyTracks, 
  searchUserLibrary, 
  saveLikedTrack, 
  checkLikedTracks 
} from '@/lib/spotify';
import type { 
  SpotifyTrack, 
  SearchMode, 
  SpotifySavedTrack 
} from '@/types/spotify';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchContextType {
  query: string;
  setQuery: (query: string) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  searchResults: SpotifyTrack[];
  isLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  saveLikedTrackMutation: (trackId: string) => Promise<void>;
  isTrackLiked: (trackId: string) => boolean;
  likedTrackIds: Set<string>;
}

const SearchContext = createContext<SearchContextType | null>(null);

interface SearchProviderProps {
  children: ReactNode;
  likedTracks?: SpotifySavedTrack[];
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ 
  children, 
  likedTracks = [] 
}) => {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('library');
  const [isOpen, setIsOpen] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 300);

  // Update liked track IDs when likedTracks changes
  useEffect(() => {
    const ids = new Set(likedTracks.map(({ track }) => track.id));
    setLikedTrackIds(ids);
  }, [likedTracks]);

  // Spotify search query
  const { 
    data: spotifySearchResults, 
    isLoading: isSpotifyLoading 
  } = useQuery({
    queryKey: ['spotifySearch', debouncedQuery, searchMode],
    queryFn: () => searchSpotifyTracks(debouncedQuery, session!.accessToken as string),
    enabled: !!(session?.accessToken && debouncedQuery && searchMode === 'spotify'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Library search (client-side filtering)
  const librarySearchResults = React.useMemo(() => {
    if (searchMode === 'library' && debouncedQuery) {
      return searchUserLibrary(debouncedQuery, likedTracks);
    }
    return [];
  }, [debouncedQuery, searchMode, likedTracks]);

  // Combine results based on search mode
  const searchResults = React.useMemo(() => {
    if (searchMode === 'library') {
      return librarySearchResults;
    } else {
      return spotifySearchResults?.tracks.items || [];
    }
  }, [searchMode, librarySearchResults, spotifySearchResults]);

  const isLoading = searchMode === 'spotify' ? isSpotifyLoading : false;

  // Save liked track function
  const saveLikedTrackMutation = useCallback(async (trackId: string) => {
    if (!session?.accessToken) return;
    
    try {
      await saveLikedTrack(trackId, session.accessToken as string);
      setLikedTrackIds(prev => new Set([...prev, trackId]));
    } catch (error) {
      console.error('Error saving track:', error);
    }
  }, [session?.accessToken]);

  // Check if track is liked
  const isTrackLiked = useCallback((trackId: string) => {
    return likedTrackIds.has(trackId);
  }, [likedTrackIds]);

  const contextValue: SearchContextType = {
    query,
    setQuery,
    searchMode,
    setSearchMode,
    searchResults,
    isLoading,
    isOpen,
    setIsOpen,
    saveLikedTrackMutation,
    isTrackLiked,
    likedTrackIds,
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};