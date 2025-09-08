import type { SpotifyTrack } from "@/types/spotify";
import { motion } from "motion/react";
import convertToMinutes from "@/lib/milliseconds-converter";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";
import { useSearch } from "@/contexts/SearchContext";
import LikeButton from "@/components/ui/LikeButton";

interface SearchTrackItemProps {
  track: SpotifyTrack;
  isFromLibrary?: boolean;
}

export default function SearchTrackItem({
  track,
  isFromLibrary = false,
}: SearchTrackItemProps) {
  const { playTrack, current_track, is_paused } = useSpotifyPlayer();
  const { toggleLikedTrackMutation, isTrackLiked } = useSearch();

  const isCurrentTrack = current_track?.id === track.id;
  const isLiked = isTrackLiked(track.id);

  const handlePlay = async () => {
    await playTrack(track.uri);
  };

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    await toggleLikedTrackMutation(trackId, currentlyLiked);
  };

  return (
    <motion.div
      className={`relative flex justify-center items-center mx-2 my-2 rounded-xl cursor-pointer border-2 transition-colors ${
        isCurrentTrack
          ? "bg-gradient-to-r from-pink-900/20 to-orange-900/20 border-pink-500"
          : "bg-black/80 border-transparent hover:bg-gray-900 hover:border-pink-500"
      }`}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handlePlay}
    >
      <div className="flex items-center px-3 py-3 w-full">
        {/* Play/Playing indicator */}
        {isCurrentTrack && (
          <div className="mr-3 flex items-center justify-center">
            {is_paused ? (
              <svg
                className="w-4 h-4 text-pink-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <div className="flex space-x-1">
                <div
                  className="w-1 h-4 bg-pink-500 animate-pulse"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1 h-4 bg-pink-500 animate-pulse"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1 h-4 bg-pink-500 animate-pulse"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}
          </div>
        )}

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <span
            className={`block font-medium truncate ${
              isCurrentTrack ? "text-pink-400" : "text-text-primary"
            }`}
          >
            {track.name}
          </span>
          <span
            className={`block text-sm truncate ${
              isCurrentTrack ? "text-pink-300" : "text-text-secondary"
            }`}
          >
            {track.artists.map((artist) => artist.name).join(", ")} • {track.album.name}
          </span>
        </div>

        {/* Duration */}
        <span 
          className={`px-3 text-sm ${
            isCurrentTrack ? "text-pink-400" : "text-text-secondary"
          }`}
        >
          {convertToMinutes(track.duration_ms)}
        </span>

        {/* Like button (only for Spotify search results) */}
        {!isFromLibrary && (
          <LikeButton
            trackId={track.id}
            isLiked={isLiked}
            onToggle={handleLikeToggle}
          />
        )}
      </div>
    </motion.div>
  );
}