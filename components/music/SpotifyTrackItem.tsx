import React from "react";
import type { SpotifyTrack } from "@/types/spotify";
import { motion } from "motion/react";
import convertToMinutes from "@/lib/milliseconds-converter";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";
import { useSearch } from "@/contexts/SearchContext";
import LikeButton from "@/components/ui/LikeButton";

// Utility function to shuffle an array
const shuffleArray = (array: SpotifyTrack[]): SpotifyTrack[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface SpotifyTrackItemProps {
  track: SpotifyTrack;
  albumTracks?: SpotifyTrack[];
  trackIndex?: number;
}

export default function SpotifyTrackItem({
  track,
  albumTracks,
  trackIndex,
}: SpotifyTrackItemProps) {
  const { playTrack, playTracks, current_track, is_paused, allLikedTracks } =
    useSpotifyPlayer();
    
  const { toggleLikedTrackMutation, isTrackLiked } = useSearch();

  const isCurrentTrack = current_track?.id === track.id;
  
  // Console log to verify access to all liked tracks from context
  React.useEffect(() => {
    if (allLikedTracks?.length > 0) {
      console.log(`🎵 SpotifyTrackItem "${track.name}" has access to ${allLikedTracks.length} liked tracks from context:`, 
        allLikedTracks.slice(0, 3).map(t => t.name).join(', ') + (allLikedTracks.length > 3 ? '...' : '')
      );
    }
  }, [allLikedTracks, track.name]);

  const handlePlay = async () => {
    if (albumTracks && trackIndex !== undefined) {
      // Start with album tracks
      const albumUris = albumTracks.map((t) => t.uri);
      
      // Add shuffled library tracks for continuation (excluding current album tracks)
      let finalTrackUris = albumUris;
      
      if (allLikedTracks && allLikedTracks.length > 0) {
        // Get album track IDs for filtering
        const albumTrackIds = new Set(albumTracks.map(t => t.id));
        
        // Filter out album tracks from library and shuffle the remaining
        const libraryTracksWithoutAlbum = allLikedTracks.filter(t => !albumTrackIds.has(t.id));
        const shuffledLibrary = shuffleArray(libraryTracksWithoutAlbum);
        
        // Combine: album tracks first, then shuffled library
        finalTrackUris = [
          ...albumUris,
          ...shuffledLibrary.map(t => t.uri)
        ];
        
        console.log(`🎯 Created queue: ${albumTracks.length} album tracks + ${shuffledLibrary.length} shuffled library tracks = ${finalTrackUris.length} total`);
      }
      
      await playTracks(finalTrackUris, trackIndex);
    } else {
      await playTrack(track.uri);
    }
  };

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    await toggleLikedTrackMutation(trackId, currentlyLiked);
  };

  return (
    <motion.div
      className={`flex justify-center items-center mx-4 my-4 rounded-2xl cursor-pointer border-2 transition-colors ${
        isCurrentTrack
          ? "bg-gradient-to-r from-pink-900/20 to-orange-900/20 border-pink-500"
          : "bg-black border-transparent hover:bg-gray-900 hover:border-pink-500"
      }`}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 20px rgba(236, 72, 153, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handlePlay}
    >
      <div className="flex items-center px-4 py-4 w-full">
        <span
          className={`flex-1 ${
            isCurrentTrack ? "text-pink-400 font-medium" : ""
          }`}
        >
          {track.name}
        </span>
        <span className={`px-4 ${isCurrentTrack ? "text-pink-400" : ""}`}>
          {convertToMinutes(track.duration_ms)}
        </span>
        
        {/* Like button for tracks in album modal */}
        <LikeButton
          trackId={track.id}
          isLiked={isTrackLiked(track.id)}
          onToggle={handleLikeToggle}
          variant="compact"
        />
      </div>
    </motion.div>
  );
}
