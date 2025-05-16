"use client";

import React, { useState, useEffect } from "react";

type Props = {
  remainingSeconds: number;
  isRunning: boolean;
  onPauseToggle: () => void;
  onExit: () => void;
  duration: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
};

export default function FocusTimerOverlay({
  remainingSeconds,
  isRunning,
  onPauseToggle,
  onExit,
  duration,
  soundEnabled,
  onToggleSound,
}: Props) {
  // Calculate progress (0 to 1)
  const progress = 1 - remainingSeconds / (duration * 60);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setShow(true);
    return () => setShow(false);
  }, []);

return (
    <div className="fixed inset-0 flex items-center justify-center">
      {/* X button */}
      <button
        className="absolute top-6 right-8 text-3xl text-white opacity-50 transition hover:opacity-100"
        onClick={onExit}
        aria-label="Exit focus mode"
      >
        ×
      </button>

      {/* Animated content */}
            <div
        className={`
          relative z-10 flex flex-col items-center
          transition-all duration-500 ease-out
          opacity-70 translate-y-0
        `}
      >
        <div className="relative flex h-[220px] w-[220px] items-center justify-center">
          <svg width={220} height={220}>
            <circle
              cx={110}
              cy={110}
              r={100}
              stroke="#fff"
              strokeWidth={10}
              fill="none"
              opacity={0.2}
            />
            <circle
              cx={110}
              cy={110}
              r={100}
              stroke="#fff"
              strokeWidth={10}
              fill="none"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * progress}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
              transform="rotate(-90 110 110)"
            />
          </svg>
          {/* Time remaining */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-light text-white">
            {`${Math.floor(remainingSeconds / 60)
              .toString()
              .padStart(2, "0")}:${(remainingSeconds % 60)
              .toString()
              .padStart(2, "0")}`}
          </div>
        </div>
        {/* Pause/Start button */}
        <button
          className="mt-10 rounded-full bg-white/80 px-8 py-3 text-xl font-medium text-stone-800 shadow hover:bg-white"
          onClick={onPauseToggle}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>
      {/* Sound toggle button and photo credit remain unchanged */}
      <button
        className="absolute top-6 left-8 text-2xl text-white opacity-60 transition hover:opacity-100"
        onClick={onToggleSound}
        aria-label="Toggle sound"
      >
        {soundEnabled ? (
          // Sound ON icon
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        ) : (
          // Sound OFF icon
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        )}
      </button>
      
      <div className="absolute right-0 bottom-2 left-0 z-50 text-center text-xs text-white/70">
        Photo by{" "}
        <a
          href="https://unsplash.com/@sotti?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Shifaaz shamoon
        </a>{" "}
        on{" "}
        <a
          href="https://unsplash.com/photos/aerial-photo-of-seashore-sLAk1guBG90?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Unsplash
        </a>
      </div>
    </div>
  );
}
