import type { SpotifyAlbum, SpotifyTrack } from "@/types/spotify";
import Image from "next/image";
import { motion } from "motion/react";
import SpotifyTrackItem from "./SpotifyTrackItem";

interface AlbumModalProps {
  album: SpotifyAlbum | null;
  onClose: () => void;
  likedTracks: SpotifyTrack[];
}

export default function AlbumModal({
  album,
  likedTracks,
  onClose,
}: AlbumModalProps) {
  if (!album) return null;
  console.log(likedTracks);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        layoutId={`album-${album.id}`}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col min-h-[200px] max-h-[70vh] w-[400px]"
      >
        <motion.div className="h-[240px] flex-shrink-0 relative group cursor-pointer">
          <Image
            src={album.images[0]?.url}
            alt={album.name}
            width={400}
            height={400}
            className="rounded-t-2xl object-cover w-full h-full transition-all duration-300 group-hover:brightness-50"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-t-2xl"></div>
          <div className="flex w-3/4 flex-col justify-center items-center gap-1 mb-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <h1
              className="font-bold text-2xl mt-4 px-8 text-center"
              key={album.id}
            >
              {album.name}
            </h1>
            <h2>{album.artists[0].name}</h2>
            <h3 className="text-xs text-gray-400">
              {album.release_date.slice(0, 4)}
            </h3>
          </div>
        </motion.div>
        <motion.div
          className="w-full bg-gradient-to-r from-zinc-900 to-slate-900 h-[60%] rounded-b-2xl overflow-y-scroll no-scrollbar"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        >
          {likedTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.2,
                delay: 0.2 + index * 0.08,
                ease: "easeOut",
              }}
            >
              <SpotifyTrackItem
                track={track}
                albumTracks={likedTracks}
                trackIndex={index}
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
