"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/spotify";
import type { SpotifyUserProfile } from "@/types/spotify";

export function useUserProfile(accessToken?: string) {
  return useQuery({
    queryKey: ['userProfile', accessToken],
    queryFn: () => getUserProfile(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}