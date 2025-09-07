"use client";

import React, { useState, useEffect } from "react";
import { useSpotifyPlayer } from "@/contexts/SpotifyPlayerContext";
import { motion } from "motion/react";
import Image from "next/image";
import convertToMinutes from "@/lib/milliseconds-converter";

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
  } = useSpotifyPlayer();

  const [localPosition, setLocalPosition] = useState(position);
  const [isDragging] = useState(false);

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
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-zinc-900 to-slate-900 border-t border-gray-800 p-4 z-50"
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
              <div className="w-14 h-14 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-500"
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
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-medium truncate">
              {current_track?.name || "No track selected"}
            </h4>
            <p className="text-gray-400 text-sm truncate">
              {current_track
                ? current_track.artists.map((artist) => artist.name).join(", ")
                : "Choose a track to play"}
            </p>
          </div>
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
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 cursor-not-allowed"
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
              whileHover={{ scale: current_track ? 1.1 : 1 }}
              whileTap={{ scale: current_track ? 0.9 : 1 }}
              disabled={!current_track}
              className={`rounded-full p-2 transition-colors ${
                current_track
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {is_paused ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </motion.button>

            <motion.button
              onClick={nextTrack}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={!current_track}
              className={`transition-colors ${
                current_track
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 cursor-not-allowed"
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
            <span className="text-xs text-gray-400 w-12 text-right">
              {convertToMinutes(localPosition)}
            </span>
            <div
              className="flex-1 bg-gray-600 h-1 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <motion.div
                className="bg-white h-full rounded-full relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
            <span className="text-xs text-gray-400 w-12">
              {convertToMinutes(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 flex-1 justify-end">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>

          <div className="flex items-center w-24">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
