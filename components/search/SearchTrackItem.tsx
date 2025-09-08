import type { SpotifyTrack } from "@/types/spotify";
import { motion } from "motion/react";
import convertToMinutes from "@/lib/milliseconds-converter";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";
import { useSearch } from "@/contexts/SearchContext";
import { useState } from "react";

interface SearchTrackItemProps {
  track: SpotifyTrack;
  isFromLibrary?: boolean;
}

export default function SearchTrackItem({
  track,
  isFromLibrary = false,
}: SearchTrackItemProps) {
  const { playTrack, current_track, is_paused } = useSpotifyPlayer();
  const { saveLikedTrackMutation, isTrackLiked } = useSearch();
  const [justLiked, setJustLiked] = useState(false);

  const isCurrentTrack = current_track?.id === track.id;
  const isLiked = isTrackLiked(track.id);

  const handlePlay = async () => {
    await playTrack(track.uri);
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      setJustLiked(true);
      await saveLikedTrackMutation(track.id);
      
      // Reset the visual state after animation completes
      setTimeout(() => setJustLiked(false), 1500);
    }
  };

  return (
    <motion.div
      className={`relative flex justify-center items-center mx-2 my-2 rounded-xl cursor-pointer border-2 transition-colors ${
        isCurrentTrack
          ? "bg-gradient-to-r from-pink-900/20 to-orange-900/20 border-pink-500"
          : justLiked
          ? "bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500"
          : "bg-black/80 border-transparent hover:bg-gray-900 hover:border-pink-500"
      }`}
      animate={justLiked ? {
        scale: [1, 1.03, 1],
        borderColor: ["transparent", "#10b981", "#10b981", "transparent"],
      } : {}}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 0 15px rgba(236, 72, 153, 0.2)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handlePlay}
    >
      {/* Success pulse effect */}
      {justLiked && (
        <motion.div
          className="absolute inset-0 bg-green-500/10 rounded-xl"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      )}
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
          <motion.button
            onClick={handleLikeToggle}
            className={`relative p-2 rounded-full transition-colors ${
              isLiked || justLiked
                ? "text-pink-500 hover:text-pink-400"
                : "text-text-secondary hover:text-pink-500"
            }`}
            animate={justLiked ? {
              scale: [1, 1.3, 1],
              rotate: [0, 15, 0],
            } : {}}
            whileHover={{ scale: isLiked ? 1.1 : 1.2 }}
            whileTap={{ scale: 0.8 }}
            transition={{ duration: 0.3, ease: "backOut" }}
            disabled={isLiked}
          >
            {/* Sparkle effect for successful like */}
            {justLiked && (
              <>
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-pink-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                    }}
                    initial={{ 
                      opacity: 0,
                      x: 0,
                      y: 0,
                      scale: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      x: [0, (i % 2 ? 1 : -1) * 15],
                      y: [0, (i < 2 ? -1 : 1) * 15],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </>
            )}
            
            <svg
              className="w-5 h-5"
              fill={isLiked || justLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}