import type { SpotifyAlbum, SpotifyLikedTracksResponse } from "@/types/spotify";
import { getTracksForAlbum } from "@/lib/album-utils";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import AlbumModal from "./AlbumModal";
import Pagination from "@/components/ui/Pagination";
import { motion, AnimatePresence } from "motion/react";


interface AlbumGridProps {
  albums: SpotifyAlbum[];
  likedTracks: SpotifyLikedTracksResponse | undefined
}

export default function AlbumGrid({ albums, likedTracks }: AlbumGridProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifyAlbum | null>(null);
  const [closingAlbum, setClosingAlbum] = useState<SpotifyAlbum | null>(null);
  const [newAlbumIds, setNewAlbumIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const previousAlbumsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  const ALBUMS_PER_PAGE = 18;

  // Calculate pagination values
  const totalPages = Math.ceil(albums.length / ALBUMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ALBUMS_PER_PAGE;
  const endIndex = startIndex + ALBUMS_PER_PAGE;
  const currentPageAlbums = albums.slice(startIndex, endIndex);

  // Reset to page 1 when albums change (new data loaded)
  useEffect(() => {
    if (albums.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [albums.length, currentPage, totalPages]);

  // Track newly added albums for special animation treatment
  useEffect(() => {
    const currentAlbumIds = new Set(albums.map(album => album.id));
    const previousAlbumIds = previousAlbumsRef.current;
    
    // Skip "new album" detection on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousAlbumsRef.current = currentAlbumIds;
      return;
    }
    
    // Find newly added albums (only after initial load)
    const newIds = new Set<string>();
    for (const id of currentAlbumIds) {
      if (!previousAlbumIds.has(id)) {
        newIds.add(id);
      }
    }
    
    if (newIds.size > 0) {
      setNewAlbumIds(newIds);
      // Clear the "new" status after the highlight animation
      setTimeout(() => setNewAlbumIds(new Set()), 3000);
    }
    
    previousAlbumsRef.current = currentAlbumIds;
  }, [albums]);

  const handleCloseModal = () => {
    setClosingAlbum(selectedAlbum);
    setSelectedAlbum(null);
    // Clear the closing album after the exit animation completes
    setTimeout(() => setClosingAlbum(null), 300);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {currentPageAlbums.map((album, index) => {
        const isNew = newAlbumIds.has(album.id);
        
        return (
          <motion.div
            key={album.id}
            layout
            className="cursor-pointer relative"
            style={{
              zIndex: (selectedAlbum?.id === album.id || closingAlbum?.id === album.id) ? 1000 : index
            }}
            onClick={() => setSelectedAlbum(album)}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.8), // Staggered animation with max delay
                ease: "easeOut",
                layout: { duration: 0.3 }
              }
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            whileTap={{ scale: 0.98 }}
          >
              {/* Glow effect for new albums */}
              {isNew && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-orange-400/20 rounded-lg blur-md -z-10"
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ 
                    opacity: [0, 1, 0.7, 0],
                    scale: [1.2, 1.1, 1.05, 1],
                    transition: { 
                      duration: 3,
                      times: [0, 0.2, 0.8, 1],
                      ease: "easeInOut"
                    }
                  }}
                />
              )}
              
              <motion.div 
                className={`relative mb-2 rounded-lg overflow-hidden ${
                  isNew ? 'ring-2 ring-pink-500/50' : ''
                }`}
                layoutId={`album-${album.id}`}
                transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              >
                <Image
                  src={album.images[0]?.url}
                  alt={album.name}
                  className="w-full object-cover aspect-square"
                  width={300}
                  height={300}
                />
                
                {/* New album badge */}
                {isNew && (
                  <motion.div
                    className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg"
                    initial={{ opacity: 0, scale: 0, rotate: -10 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1, 
                      rotate: 0,
                      transition: { delay: 0.3, duration: 0.3, ease: "backOut" }
                    }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0, 
                      rotate: 10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    New!
                  </motion.div>
                )}
              </motion.div>
          </motion.div>
        );
        })}
      </div>

      {/* Pagination Component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      
      <AnimatePresence>
        {selectedAlbum && (
          <AlbumModal
            album={selectedAlbum}
            onClose={handleCloseModal}
            likedTracks={likedTracks ? getTracksForAlbum(likedTracks, selectedAlbum.id) : []}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
