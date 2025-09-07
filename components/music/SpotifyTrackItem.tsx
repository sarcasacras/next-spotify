import type { SpotifyTrack } from "@/types/spotify";
import { motion } from "motion/react";
import convertToMinutes from "@/lib/milliseconds-converter";

interface SpotifyTrackItemProps {
  track: SpotifyTrack;
}

export default function SpotifyTrackItem({ track }: SpotifyTrackItemProps) {
  return (
    <motion.div
      className="flex justify-center items-center bg-black mx-4 my-4 rounded-2xl cursor-pointer border-2 border-transparent"
      whileHover={{
        scale: 1.02,
        backgroundColor: "#1f2937",
        borderColor: "#1db954",
        boxShadow: "0 0 20px rgba(29, 185, 84, 0.3)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <span className="px-8 py-4 w-full flex-1">{track.name}</span>
      <span className="px-8 py-4">
        {convertToMinutes(track.duration_ms)}
      </span>
    </motion.div>
  );
}