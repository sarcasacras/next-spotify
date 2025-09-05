import type { SpotifyAlbum } from "@/types/spotify";
import Image from "next/image";
import { useState } from "react";
import AlbumModal from "./AlbumModal";
import { motion, AnimatePresence } from "motion/react";

interface AlbumGridProps {
  albums: SpotifyAlbum[];
}

export default function AlbumGrid({ albums }: AlbumGridProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {albums.map((album) => (
        <motion.div
          key={album.id}
          className="cursor-pointer"
          onClick={() => setSelectedAlbum(album)}
          whileHover={{scale: 1.05}}
        >
          <motion.div 
            className="mb-2"
            layoutId={`album-${album.id}`}
          >
            <Image
              src={album.images[0]?.url}
              alt={album.name}
              className="w-full object-cover rounded-lg aspect-square"
              width={300}
              height={300}
            />
          </motion.div>
        </motion.div>
      ))}
      
      <AnimatePresence>
        {selectedAlbum && (
          <AlbumModal
            album={selectedAlbum}
            onClose={() => setSelectedAlbum(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
