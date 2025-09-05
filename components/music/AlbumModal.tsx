import type { SpotifyAlbum } from "@/types/spotify";
import Image from "next/image";
import { motion } from "motion/react";

interface AlbumModalProps {
  album: SpotifyAlbum | null;
  onClose: () => void;
}

export default function AlbumModal({ album, onClose }: AlbumModalProps) {
  if (!album) return null;

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
      >
        <Image
          src={album.images[0]?.url}
          alt={album.name}
          width={640}
          height={640}
          className="rounded-2xl"
        />
      </motion.div>
    </motion.div>
  );
}
