"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  searchSpotifyTracks,
  searchUserLibrary,
  saveLikedTrack,
  removeLikedTrack,
  checkLikedTracks,
} from "@/lib/spotify";
import { useNotification } from "@/contexts/NotificationContext";
import {
  showErrorNotification,
  showSuccessNotification,
} from "@/lib/error-handling";
import type {
  SpotifyTrack,
  SearchMode,
  SpotifySavedTrack,
} from "@/types/spotify";
import { useDebounce } from "@/hooks/useDebounce";

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
  removeLikedTrackMutation: (trackId: string) => Promise<void>;
  toggleLikedTrackMutation: (
    trackId: string,
    currentlyLiked: boolean
  ) => Promise<void>;
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
  likedTracks = [],
}) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { addNotification } = useNotification();
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("spotify");
  const [isOpen, setIsOpen] = useState(false);
  const [likedTrackIds, setLikedTrackIds] = useState<Set<string>>(new Set());

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const ids = new Set(likedTracks.map(({ track }) => track.id));
    setLikedTrackIds(ids);
  }, [likedTracks]);

  const { data: spotifySearchResults, isLoading: isSpotifyLoading } = useQuery({
    queryKey: ["spotifySearch", debouncedQuery, searchMode],
    queryFn: () =>
      searchSpotifyTracks(debouncedQuery, session!.accessToken as string),
    enabled: !!(
      session?.accessToken &&
      debouncedQuery &&
      searchMode === "spotify"
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const librarySearchResults = React.useMemo(() => {
    if (searchMode === "library" && debouncedQuery) {
      return searchUserLibrary(debouncedQuery, likedTracks);
    }
    return [];
  }, [debouncedQuery, searchMode, likedTracks]);

  const searchResults = React.useMemo(() => {
    if (searchMode === "library") {
      return librarySearchResults;
    } else {
      return spotifySearchResults?.tracks.items || [];
    }
  }, [searchMode, librarySearchResults, spotifySearchResults]);

  const isLoading = searchMode === "spotify" ? isSpotifyLoading : false;

  const saveLikedTrackMutation = useCallback(
    async (trackId: string) => {
      if (!session?.accessToken) return;
      const queryKey = ["allLikedTracks", session.accessToken];
      const previousData = queryClient.getQueryData(queryKey);
      try {
        await saveLikedTrack(trackId, session.accessToken as string);

        setLikedTrackIds((prev) => new Set([...prev, trackId]));

        if (previousData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old?.items) return old;

            const trackToAdd = searchResults.find(
              (track) => track.id === trackId
            );

            if (trackToAdd) {
              const newItem = {
                track: trackToAdd,
                added_at: new Date().toISOString(),
              };

              return {
                ...old,
                items: [newItem, ...old.items],
                total: old.total + 1,
              };
            }
          });
        }

        showSuccessNotification(
          "Track Saved",
          "Track added to your liked songs!",
          addNotification
        );
      } catch (error) {
        setLikedTrackIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });
        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        showErrorNotification(error as any, addNotification);
      }
    },
    [session?.accessToken, queryClient, addNotification, searchResults]
  );

  const removeLikedTrackMutation = useCallback(
    async (trackId: string) => {
      if (!session?.accessToken) return;

      const queryKey = ["allLikedTracks", session.accessToken];
      const previousData = queryClient.getQueryData(queryKey);

      try {
        await removeLikedTrack(trackId, session.accessToken as string);
        setLikedTrackIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });

        if (previousData) {
          queryClient.setQueryData(queryKey, (old: any) => {
            if (!old?.items) return old;

            return {
              ...old,
              items: old.items.filter((item: any) => item.track.id !== trackId),
              total: Math.max(0, old.total - 1),
            };
          });
        }

        showSuccessNotification(
          "Track Removed",
          "Track removed from your liked songs!",
          addNotification
        );
      } catch (error) {
        setLikedTrackIds((prev) => new Set([...prev, trackId]));

        if (previousData) {
          queryClient.setQueryData(queryKey, previousData);
        }
        
        showErrorNotification(error as any, addNotification);
      }
    },
    [session?.accessToken, queryClient, addNotification]
  );

  const toggleLikedTrackMutation = useCallback(
    async (trackId: string, currentlyLiked: boolean) => {
      if (currentlyLiked) {
        await removeLikedTrackMutation(trackId);
      } else {
        await saveLikedTrackMutation(trackId);
      }
    },
    [saveLikedTrackMutation, removeLikedTrackMutation]
  );

  const isTrackLiked = useCallback(
    (trackId: string) => {
      return likedTrackIds.has(trackId);
    },
    [likedTrackIds]
  );

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
    removeLikedTrackMutation,
    toggleLikedTrackMutation,
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
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
