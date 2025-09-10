"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/spotify";
import type { SpotifyUserProfile } from "@/types/spotify";

export function useUserProfile() {
  return useQuery<SpotifyUserProfile>({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfile(''), // Pass empty string for backwards compatibility
    enabled: true, // Always enabled since our error handler checks for valid session
    staleTime: 5 * 60 * 1000, // 5 minutes - profile doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    // Remove custom retry logic - our error handling system handles this automatically
  });
}