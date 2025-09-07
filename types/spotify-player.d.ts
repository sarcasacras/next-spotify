declare namespace Spotify {
  interface Player {
    new (options: {
      name: string;
      getOAuthToken: (callback: (token: string) => void) => void;
      volume?: number;
    }): Player;

    addListener(event: 'ready', listener: (data: { device_id: string }) => void): void;
    addListener(event: 'not_ready', listener: (data: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', listener: (state: PlaybackState | null) => void): void;
    addListener(event: 'initialization_error', listener: (data: { message: string }) => void): void;
    addListener(event: 'authentication_error', listener: (data: { message: string }) => void): void;
    addListener(event: 'account_error', listener: (data: { message: string }) => void): void;
    addListener(event: 'playback_error', listener: (data: { message: string }) => void): void;

    connect(): Promise<boolean>;
    disconnect(): void;
    togglePlay(): Promise<void>;
    nextTrack(): Promise<void>;
    previousTrack(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setVolume(volume: number): Promise<void>;
    getVolume(): Promise<number>;
    getCurrentState(): Promise<PlaybackState | null>;
  }

  interface PlaybackState {
    context: {
      uri: string;
      metadata: Record<string, any>;
    };
    disallows: {
      pausing: boolean;
      peeking_next: boolean;
      peeking_prev: boolean;
      resuming: boolean;
      seeking: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
    };
    paused: boolean;
    position: number;
    repeat_mode: number;
    shuffle: boolean;
    track_window: {
      current_track: Track;
      next_tracks: Track[];
      previous_tracks: Track[];
    };
    timestamp: number;
    duration: number;
  }

  interface Track {
    id: string;
    uri: string;
    name: string;
    duration_ms: number;
    artists: Array<{
      name: string;
      uri: string;
    }>;
    album: {
      name: string;
      uri: string;
      images: Array<{
        url: string;
        height: number;
        width: number;
      }>;
    };
    is_playable: boolean;
    media_type: string;
    type: string;
    track_type: string;
  }
}