import type { SpotifyAlbum } from "@/types/spotify";

interface AlbumModalProps {
  album: SpotifyAlbum | null;
  onClose: () => void;
}

export default function AlbumModal({ album, onClose }: AlbumModalProps) {
  if (!album) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">{album.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <p className="text-gray-400">Basic modal structure created!</p>
      </div>
    </div>
  );
}