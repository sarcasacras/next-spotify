"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { SpotifyTrack, SpotifySavedTrack } from "@/types/spotify";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (callback: (token: string) => void) => void;
        volume?: number;
      }) => Spotify.Player;
    };
  }
}

interface SpotifyPlayerState {
  device_id: string | null;
  player: Spotify.Player | null;
  is_paused: boolean;
  is_active: boolean;
  current_track: Spotify.Track | null;
  position: number;
  duration: number;
  volume: number;
  allLikedTracks: SpotifyTrack[];
}

interface SpotifyPlayerContextType extends SpotifyPlayerState {
  initializePlayer: () => void;
  playTrack: (uri: string) => Promise<void>;
  playTracks: (uris: string[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  setAllLikedTracks: (tracks: SpotifyTrack[]) => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | null>(
  null
);

interface SpotifyPlayerProviderProps {
  children: ReactNode;
  initialLikedTracks?: SpotifySavedTrack[];
}

export const SpotifyPlayerProvider: React.FC<SpotifyPlayerProviderProps> = ({
  children,
  initialLikedTracks = [],
}) => {
  const { data: session } = useSession();
  const [state, setState] = useState<SpotifyPlayerState>({
    device_id: null,
    player: null,
    is_paused: true,
    is_active: false,
    current_track: null,
    position: 0,
    duration: 0,
    volume: 0.5,
    allLikedTracks: [],
  });

  const initializePlayer = () => {
    if (!session?.accessToken) {
      console.log("No access token available");
      return;
    }

    if (!window.Spotify) {
      console.log("Spotify SDK not loaded yet");
      return;
    }

    console.log("Initializing Spotify player...");
    const player = new window.Spotify.Player({
      name: "Next Spotify Player",
      getOAuthToken: (callback: (token: string) => void) => {
        callback(session.accessToken as string);
      },
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      console.log("Ready with Device ID", device_id);
      setState((prev) => ({ ...prev, device_id, player }));
    });

    player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
      console.log("Device ID has gone offline", device_id);
      setState((prev) => ({ ...prev, device_id: null, is_active: false }));
    });

    player.addListener("player_state_changed", (state: Spotify.PlaybackState | null) => {
      if (!state) return;

      setState((prev) => ({
        ...prev,
        current_track: state.track_window.current_track,
        is_paused: state.paused,
        position: state.position,
        duration: state.duration,
      }));
    });

    player.connect();
  };

  const playTrack = async (uri: string) => {
    if (!state.device_id || !session?.accessToken) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${state.device_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            uris: [uri],
          }),
        }
      );
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const playTracks = async (uris: string[], startIndex: number = 0) => {
    if (!state.device_id || !session?.accessToken) return;

    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${state.device_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            uris: uris,
            offset: { position: startIndex },
          }),
        }
      );
    } catch (error) {
      console.error("Error playing tracks:", error);
    }
  };

  const togglePlayPause = () => {
    if (!state.player) return;
    state.player.togglePlay();
  };

  const nextTrack = () => {
    if (!state.player) return;
    state.player.nextTrack();
  };

  const previousTrack = () => {
    if (!state.player) return;
    state.player.previousTrack();
  };

  const seek = (position: number) => {
    if (!state.player) return;
    state.player.seek(position);
  };

  const setVolume = (volume: number) => {
    if (!state.player) return;
    state.player.setVolume(volume);
    setState((prev) => ({ ...prev, volume }));
  };

  const setAllLikedTracks = (tracks: SpotifyTrack[]) => {
    setState((prev) => ({ ...prev, allLikedTracks: tracks }));
  };

  // Update allLikedTracks when initialLikedTracks changes
  useEffect(() => {
    if (initialLikedTracks.length > 0) {
      const tracks = initialLikedTracks.map(item => item.track);
      setAllLikedTracks(tracks);
    }
  }, [initialLikedTracks]);

  useEffect(() => {
    console.log(
      "Effect triggered. Session:",
      !!session?.accessToken,
      "Spotify SDK:",
      !!window.Spotify
    );

    if (session?.accessToken && window.Spotify) {
      initializePlayer();
    } else if (session?.accessToken) {
      console.log("Setting up SDK ready callback...");
      // Wait for SDK to load
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }
  }, [session?.accessToken]);

  const contextValue: SpotifyPlayerContextType = {
    ...state,
    initializePlayer,
    playTrack,
    playTracks,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    setAllLikedTracks,
  };

  return (
    <SpotifyPlayerContext.Provider value={contextValue}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = () => {
  const context = useContext(SpotifyPlayerContext);
  if (!context) {
    throw new Error(
      "useSpotifyPlayer must be used within a SpotifyPlayerProvider"
    );
  }
  return context;
};
