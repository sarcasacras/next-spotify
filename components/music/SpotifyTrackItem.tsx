import type { SpotifyTrack } from "@/types/spotify";
import { motion } from "motion/react";
import convertToMinutes from "@/lib/milliseconds-converter";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";

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
  const { playTrack, playTracks, current_track, is_paused } =
    useSpotifyPlayer();

  const isCurrentTrack = current_track?.id === track.id;

  const handlePlay = async () => {
    if (albumTracks && trackIndex !== undefined) {
      const trackUris = albumTracks.map((t) => t.uri);
      await playTracks(trackUris, trackIndex);
    } else {
      await playTrack(track.uri);
    }
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
        {isCurrentTrack && (
          <div className="mr-4 flex items-center justify-center">
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
      </div>
    </motion.div>
  );
}
