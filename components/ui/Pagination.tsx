"use client";

import { motion } from "motion/react";

// Simple SVG icons for navigation
const ChevronLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (e.key === "ArrowRight" && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center justify-center mt-8 px-4"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center gap-4">
        {/* Previous button */}
        <motion.button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex cursor-pointer items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 dark:text-white dark:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={currentPage > 1 ? { scale: 1.05 } : {}}
          whileTap={currentPage > 1 ? { scale: 0.95 } : {}}
        >
          <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center gap-2">
            <ChevronLeftIcon className="w-4 h-4" />
            Previous
          </span>
        </motion.button>

        {/* Page indicator */}
        <div className="flex items-center px-4 py-2 text-sm font-medium text-text-primary bg-surface-hover rounded-full">
          Page {currentPage} of {totalPages}
        </div>

        {/* Next button */}
        <motion.button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex cursor-pointer items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 dark:text-white dark:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={currentPage < totalPages ? { scale: 1.05 } : {}}
          whileTap={currentPage < totalPages ? { scale: 0.95 } : {}}
        >
          <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-surface rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent font-bold focus:outline-none flex items-center gap-2">
            Next
            <ChevronRightIcon className="w-4 h-4" />
          </span>
        </motion.button>
      </div>
    </div>
  );
}