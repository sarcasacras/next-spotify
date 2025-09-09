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