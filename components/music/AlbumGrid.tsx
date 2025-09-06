import type { SpotifyAlbum, SpotifyLikedTracksResponse } from "@/types/spotify";
import { getTracksForAlbum } from "@/lib/album-utils";
import Image from "next/image";
import { useState } from "react";
import AlbumModal from "./AlbumModal";
import { motion, AnimatePresence } from "motion/react";


interface AlbumGridProps {
  albums: SpotifyAlbum[];
  likedTracks: SpotifyLikedTracksResponse | undefined
}

export default function AlbumGrid({ albums, likedTracks }: AlbumGridProps) {
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
            likedTracks={likedTracks ? getTracksForAlbum(likedTracks, selectedAlbum.id) : []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
