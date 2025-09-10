"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { spotifyFetchVoid } from "@/lib/error-handling";
import { useNotification } from "@/contexts/NotificationContext";
import { showErrorNotification } from "@/lib/error-handling";
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
  const { addNotification } = useNotification();
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
        // Always get the current session to avoid stale token issues
        import("next-auth/react").then(({ getSession }) => {
          getSession().then((currentSession) => {
            if (currentSession?.accessToken) {
              console.log("🔑 [TOKEN] Providing fresh token to Spotify SDK:", currentSession.accessToken.slice(0, 20) + "...");
              callback(currentSession.accessToken as string);
            } else {
              console.error("🔑 [TOKEN] No access token available in current session");
            }
          });
        });
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

    // Handle authentication errors and auto-reconnect
    player.addListener("authentication_error", ({ message }: { message: string }) => {
      console.error("🔒 [AUTH ERROR] Authentication failed:", message);
      console.log("🔄 [AUTH ERROR] Attempting to reconnect with fresh token...");
      
      // Disconnect current player and reinitialize
      player.disconnect();
      setTimeout(() => {
        initializePlayer();
      }, 1000); // Brief delay to ensure clean disconnection
    });

    // Handle initialization errors
    player.addListener("initialization_error", ({ message }: { message: string }) => {
      console.error("🚫 [INIT ERROR] Player initialization failed:", message);
    });

    // Handle account errors (like premium subscription issues)
    player.addListener("account_error", ({ message }: { message: string }) => {
      console.error("👤 [ACCOUNT ERROR] Account issue:", message);
    });

    // Handle playback errors
    player.addListener("playback_error", ({ message }: { message: string }) => {
      console.error("▶️ [PLAYBACK ERROR] Playback failed:", message);
      
      // Handle specific "no list was loaded" error with auto-reconnect
      if (message.includes("no list was loaded")) {
        console.log("🎵 [PLAYBACK ERROR] Player has no active queue. Attempting to reconnect...");
        // Clear current track state to prevent further operations
        setState((prev) => ({
          ...prev,
          current_track: null,
          is_paused: true,
          position: 0,
          duration: 0,
        }));
        
        // Auto-reconnect to restore player functionality
        console.log("🔄 [PLAYBACK ERROR] Disconnecting and reinitializing player...");
        player.disconnect();
        setTimeout(() => {
          initializePlayer();
        }, 1500); // Slightly longer delay than auth error to ensure clean disconnection
      }
    });

    player.connect();
  };

  const playTrack = async (uri: string) => {
    if (!state.device_id) return;

    try {
      await spotifyFetchVoid(
        `/me/player/play?device_id=${state.device_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            uris: [uri],
          }),
        }
      );
    } catch (error) {
      console.error("Error playing track:", error);
      showErrorNotification(error as any, addNotification);
    }
  };

  const playTracks = async (uris: string[], startIndex: number = 0) => {
    if (!state.device_id) return;

    try {
      await spotifyFetchVoid(
        `/me/player/play?device_id=${state.device_id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            uris: uris,
            offset: { position: startIndex },
          }),
        }
      );
    } catch (error) {
      console.error("Error playing tracks:", error);
      showErrorNotification(error as any, addNotification);
    }
  };

  const togglePlayPause = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      console.warn("🚫 [CONTROL] Cannot toggle play/pause - player not ready or no track loaded");
      return;
    }
    state.player.togglePlay();
  };

  const nextTrack = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      console.warn("🚫 [CONTROL] Cannot skip to next track - player not ready or no track loaded");
      return;
    }
    state.player.nextTrack();
  };

  const previousTrack = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      console.warn("🚫 [CONTROL] Cannot skip to previous track - player not ready or no track loaded");
      return;
    }
    state.player.previousTrack();
  };

  const seek = (position: number) => {
    if (!state.player || !state.device_id || !state.current_track) {
      console.warn("🚫 [CONTROL] Cannot seek - player not ready or no track loaded");
      return;
    }
    state.player.seek(position);
  };

  const setVolume = (volume: number) => {
    if (!state.player || !state.device_id) {
      console.warn("🚫 [CONTROL] Cannot set volume - player not ready");
      return;
    }
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
    console.log("🔄 [EFFECT] Session token changed:", session?.accessToken?.slice(0, 20) + "...");
    console.log(
      "🔄 [EFFECT] Session exists:",
      !!session?.accessToken,
      "Spotify SDK loaded:",
      !!window.Spotify
    );

    if (session?.accessToken && window.Spotify) {
      console.log("🎵 [EFFECT] Creating new player with fresh token");
      initializePlayer();
    } else if (session?.accessToken) {
      console.log("🎵 [EFFECT] Setting up SDK ready callback...");
      // Wait for SDK to load
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    // Cleanup function: Disconnect old player when token changes or component unmounts
    return () => {
      if (state.player) {
        console.log("🧹 [CLEANUP] Disconnecting old player");
        state.player.disconnect();
        setState((prev) => ({ 
          ...prev, 
          player: null, 
          device_id: null, 
          is_active: false 
        }));
      }
    };
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
