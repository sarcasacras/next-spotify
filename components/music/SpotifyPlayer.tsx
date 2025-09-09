"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";
import { useSearch } from "@/contexts/SearchContext";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import convertToMinutes from "@/lib/milliseconds-converter";
import LikeButton from "@/components/ui/LikeButton";

export default function SpotifyPlayer() {
  const {
    current_track,
    is_paused,
    position,
    duration,
    volume,
    device_id,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    allLikedTracks,
  } = useSpotifyPlayer();
  
  const { toggleLikedTrackMutation, isTrackLiked } = useSearch();

  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging] = useState(false);
  const volumeSliderRef = useRef<HTMLInputElement>(null);

  // Update local position when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalPosition(position);
    }
  }, [position, isDragging]);

  // Auto-increment position when playing
  useEffect(() => {
    if (!is_paused && !isDragging) {
      const interval = setInterval(() => {
        setLocalPosition((prev) => Math.min(prev + 1000, duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [is_paused, isDragging, duration]);


  // Initialize volume slider gradient on mount and volume changes
  useLayoutEffect(() => {
    if (volumeSliderRef.current) {
      volumeSliderRef.current.style.setProperty('--value', `${volume * 100}%`);
    }
  }, [volume]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPosition = (clickX / rect.width) * duration;
    seek(newPosition);
    setLocalPosition(newPosition);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    // Update CSS custom property for gradient fill
    e.target.style.setProperty('--value', `${newVolume * 100}%`);
  };

  const handleLikeToggle = async (trackId: string, currentlyLiked: boolean) => {
    await toggleLikedTrackMutation(trackId, currentlyLiked);
  };

  const progressPercentage =
    duration > 0 ? (localPosition / duration) * 100 : 0;

  // Show placeholder player when device is ready but no track is playing
  if (!device_id) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-50"
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="relative w-14 h-14 flex-shrink-0">
            {current_track ? (
              <Image
                src={
                  current_track.album.images[0]?.url || "/placeholder-album.png"
                }
                alt={current_track.album.name}
                fill
                className="object-cover rounded-lg"
              />
            ) : (
              <div className="w-14 h-14 bg-surface-hover rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-secondary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-text-primary font-medium truncate">
              {current_track?.name || "No track selected"}
            </h4>
            <p className="text-text-secondary text-sm truncate">
              {current_track
                ? current_track.artists.map((artist) => artist.name).join(", ")
                : "Choose a track to play"}
            </p>
          </div>
          
          {/* Like button for current track */}
          {current_track && (
            <div className="ml-2">
              <LikeButton
                trackId={current_track.id}
                isLiked={isTrackLiked(current_track.id)}
                onToggle={handleLikeToggle}
                variant="compact"
              />
            </div>
          )}
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={previousTrack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!current_track}
              className={`transition-colors ${
                current_track
                  ? "text-text-secondary hover:text-text-primary"
                  : "text-secondary cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            <motion.button
              onClick={togglePlayPause}
              disabled={!current_track}
              className={`relative inline-flex cursor-pointer items-center justify-center p-0.5 overflow-hidden rounded-full group transition-all ${
                current_track
                  ? "bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400"
                  : "bg-surface-hover cursor-not-allowed"
              }`}
            >
              <span className={`relative p-2 transition-all ease-in duration-75 rounded-full font-bold focus:outline-none ${
                current_track 
                  ? "bg-surface group-hover:bg-transparent text-text-primary" 
                  : "bg-surface text-secondary"
              }`}>
                <AnimatePresence mode="wait">
                  {is_paused ? (
                    <motion.svg
                      key="play"
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: [0.23, 1, 0.320, 1]
                      }}
                    >
                      <path d="M8 5v14l11-7z" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="pause"
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      initial={{ scale: 0.6, rotate: -90, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      exit={{ scale: 0.6, rotate: 90, opacity: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: [0.23, 1, 0.320, 1]
                      }}
                    >
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </span>
            </motion.button>

            <motion.button
              onClick={nextTrack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!current_track}
              className={`transition-colors ${
                current_track
                  ? "text-text-secondary hover:text-text-primary"
                  : "text-secondary cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414zm6 0a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L14.586 10l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-2 w-full">
            <span className="text-xs text-text-secondary w-12 text-right">
              {convertToMinutes(localPosition)}
            </span>
            <div
              className="flex-1 bg-surface-hover h-1 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <motion.div
                className="bg-gradient-to-r from-pink-500 to-orange-400 h-full rounded-full relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <span className="text-xs text-text-secondary w-12">
              {convertToMinutes(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <svg
            className="w-5 h-5 text-text-secondary"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>

          <div className="flex items-center w-24">
            <input
              ref={volumeSliderRef}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{ '--value': `${volume * 100}%` } as React.CSSProperties}
              className="w-full h-1 bg-surface-hover rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
