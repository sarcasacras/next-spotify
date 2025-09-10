"use client";

import { useState } from "react";
import { motion } from "motion/react";

interface LikeButtonProps {
  trackId: string;
  isLiked: boolean;
  onToggle: (trackId: string, currentlyLiked: boolean) => Promise<void>;
  variant?: "default" | "compact";
  disabled?: boolean;
}

export default function LikeButton({
  trackId,
  isLiked,
  onToggle,
  variant = "default",
  disabled = false,
}: LikeButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [wasInitiallyLiked, setWasInitiallyLiked] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isAnimating) return;

    // Capture the initial state before animation starts
    setWasInitiallyLiked(isLiked);
    setIsAnimating(true);
    
    try {
      await onToggle(trackId, isLiked);
      // Keep animation state for visual feedback duration
      setTimeout(() => setIsAnimating(false), 1500);
    } catch (error) {
      setIsAnimating(false);
    }
  };

  const size = variant === "compact" ? "w-4 h-4" : "w-5 h-5";
  const buttonSize = variant === "compact" ? "p-1.5" : "p-2";

  return (
    <motion.button
      onClick={handleToggle}
      className={`relative ${buttonSize} rounded-full transition-colors ${
        isLiked || isAnimating
          ? "text-pink-500 hover:text-pink-400"
          : "text-text-secondary hover:text-pink-500"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      animate={
        isAnimating && !wasInitiallyLiked
          ? {
              scale: [1, 1.3, 1],
              rotate: [0, 15, 0],
            }
          : isAnimating && wasInitiallyLiked
          ? {
              scale: [1, 0.8, 1],
              opacity: [1, 0.6, 1],
            }
          : {}
      }
      whileHover={!disabled ? { scale: isLiked ? 1.1 : 1.2 } : {}}
      whileTap={!disabled ? { scale: 0.8 } : {}}
      transition={{ duration: 0.3, ease: "backOut" }}
      disabled={disabled || isAnimating}
    >
      {isAnimating && !wasInitiallyLiked && (
        <>
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-pink-400 rounded-full"
              style={{
                top: "50%",
                left: "50%",
              }}
              initial={{
                opacity: 0,
                x: 0,
                y: 0,
                scale: 0,
              }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, (i % 2 ? 1 : -1) * 15],
                y: [0, (i < 2 ? -1 : 1) * 15],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      {isAnimating && wasInitiallyLiked && (
        <motion.div
          className="absolute inset-0 bg-red-500/20 rounded-full"
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.5, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      <svg
        className={size}
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </motion.button>
  );
}