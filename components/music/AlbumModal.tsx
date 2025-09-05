import type { SpotifyAlbum } from "@/types/spotify";
import Image from "next/image";

interface AlbumModalProps {
  album: SpotifyAlbum | null;
  onClose: () => void;
}

export default function AlbumModal({ album, onClose }: AlbumModalProps) {
  if (!album) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <Image
        src={album.images[0]?.url}
        alt={album.name}
        width={640}
        height={640}
        className="rounded-2xl"
      />
    </div>
  );
}
