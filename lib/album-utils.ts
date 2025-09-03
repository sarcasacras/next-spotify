import type { SpotifyLikedTracksResponse } from "@/types/spotify";

export function extractUniqueAlbums(tracksData: SpotifyLikedTracksResponse) {
    const albumsMap = new Map();

    for (const item of tracksData.items) {
        const album = item.track.album;

        if (!albumsMap.has(album.id)) {
            albumsMap.set(album.id, album);
        }
    }

    return Array.from(albumsMap.values());
}