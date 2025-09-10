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

const shuffleArray = (array: SpotifyTrack[]): SpotifyTrack[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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
  next_tracks: Spotify.Track[];
  previous_tracks: Spotify.Track[];
  position: number;
  duration: number;
  volume: number;
  allLikedTracks: SpotifyTrack[];
}

interface SpotifyPlayerContextType extends SpotifyPlayerState {
  initializePlayer: () => void;
  playTrack: (uri: string) => Promise<void>;
  playTracks: (uris: string[], startIndex?: number) => Promise<void>;
  shuffleLibrary: () => Promise<void>;
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
    next_tracks: [],
    previous_tracks: [],
    position: 0,
    duration: 0,
    volume: 0.5,
    allLikedTracks: [],
  });

  const initializePlayer = () => {
    if (!session?.accessToken) {
      return;
    }

    if (!window.Spotify) {
      return;
    }
    const player = new window.Spotify.Player({
      name: "Next Spotify Player",
      getOAuthToken: (callback: (token: string) => void) => {
        import("next-auth/react").then(({ getSession }) => {
          getSession().then((currentSession) => {
            if (currentSession?.accessToken) {
              callback(currentSession.accessToken as string);
            }
          });
        });
      },
      volume: 0.5,
    });

    player.addListener("ready", ({ device_id }: { device_id: string }) => {
      setState((prev) => ({ ...prev, device_id, player }));
    });

    player.addListener("not_ready", () => {
      setState((prev) => ({ ...prev, device_id: null, is_active: false }));
    });

    player.addListener(
      "player_state_changed",
      (state: Spotify.PlaybackState | null) => {
        if (!state) return;

        setState((prev) => {
          // Check if track actually changed (not just a pause/resume/position update)
          const trackChanged =
            prev.current_track?.id !== state.track_window.current_track?.id;

          if (trackChanged && state.track_window.current_track) {
            if (
              state.track_window.next_tracks.length === 0 &&
              state.track_window.previous_tracks.length !== 0
            ) {
              // Pass the correct values directly to shuffleLibrary
              setTimeout(() => {
                shuffleLibrary(prev.device_id as string, prev.allLikedTracks);
              }, 100);
            }
          }

          return {
            ...prev,
            current_track: state.track_window.current_track,
            next_tracks: state.track_window.next_tracks,
            previous_tracks: state.track_window.previous_tracks,
            is_paused: state.paused,
            position: state.position,
            duration: state.duration,
          };
        });
      }
    );

    player.addListener("authentication_error", () => {
      player.disconnect();
      setTimeout(() => {
        initializePlayer();
      }, 1000);
    });

    player.addListener("initialization_error", () => {});

    player.addListener("account_error", () => {});

    player.addListener("playback_error", ({ message }: { message: string }) => {
      if (message.includes("no list was loaded")) {
        setState((prev) => ({
          ...prev,
          current_track: null,
          is_paused: true,
          position: 0,
          duration: 0,
        }));

        player.disconnect();
        setTimeout(() => {
          initializePlayer();
        }, 1500);
      }
    });

    player.connect();
  };

  const playTrack = async (uri: string) => {
    if (!state.device_id) return;

    try {
      await spotifyFetchVoid(`/me/player/play?device_id=${state.device_id}`, {
        method: "PUT",
        body: JSON.stringify({
          uris: [uri],
        }),
      });
    } catch (error) {
      showErrorNotification(error as any, addNotification);
    }
  };

  const playTracks = async (uris: string[], startIndex: number = 0) => {
    if (!state.device_id) return;

    try {
      await spotifyFetchVoid(`/me/player/play?device_id=${state.device_id}`, {
        method: "PUT",
        body: JSON.stringify({
          uris: uris,
          offset: { position: startIndex },
        }),
      });
    } catch (error) {
      showErrorNotification(error as any, addNotification);
    }
  };

  const shuffleLibrary = async (
    deviceId?: string,
    likedTracks?: SpotifyTrack[]
  ) => {
    // Use provided values or fall back to state
    const finalDeviceId = deviceId || state.device_id;
    const finalLikedTracks = likedTracks || state.allLikedTracks;

    if (!finalDeviceId || !finalLikedTracks.length) {
      console.log("❌ shuffleLibrary failed - no device or tracks:", {
        deviceId: finalDeviceId,
        tracksCount: finalLikedTracks.length,
      });
      return;
    }

    const shuffledTracks = shuffleArray(finalLikedTracks);
    const shuffledUris = shuffledTracks.map((track) => track.uri);

    try {
      await spotifyFetchVoid(`/me/player/play?device_id=${finalDeviceId}`, {
        method: "PUT",
        body: JSON.stringify({
          uris: shuffledUris,
        }),
      });
    } catch (error) {
      showErrorNotification(error as any, addNotification);
    }
  };

  const togglePlayPause = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      return;
    }
    state.player.togglePlay();
  };

  const nextTrack = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      return;
    }
    state.player.nextTrack();
  };

  const previousTrack = () => {
    if (!state.player || !state.device_id || !state.current_track) {
      return;
    }
    state.player.previousTrack();
  };

  const seek = (position: number) => {
    if (!state.player || !state.device_id || !state.current_track) {
      return;
    }
    state.player.seek(position);
  };

  const setVolume = (volume: number) => {
    if (!state.player || !state.device_id) {
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
      const tracks = initialLikedTracks.map((item) => item.track);
      setAllLikedTracks(tracks);
    }
  }, [initialLikedTracks]);

  useEffect(() => {
    if (session?.accessToken && window.Spotify) {
      initializePlayer();
    } else if (session?.accessToken) {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (state.player) {
        state.player.disconnect();
        setState((prev) => ({
          ...prev,
          player: null,
          device_id: null,
          is_active: false,
        }));
      }
    };
  }, [session?.accessToken]);

  const contextValue: SpotifyPlayerContextType = {
    ...state,
    initializePlayer,
    playTrack,
    playTracks,
    shuffleLibrary,
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
