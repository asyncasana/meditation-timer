"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  initialDuration: number; // in seconds
  onComplete?: () => void;
}

export default function Timer({ initialDuration, onComplete }: TimerProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [remainingTime, setRemainingTime] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // This effect runs the timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime((prev) => {
          const newTime = prev - 1;
          if (newTime === 0 && onComplete) {
            onComplete();
            setIsRunning(false);
          }
          return newTime;
        });
      }, 1000);
    } else if (remainingTime === 0) {
      setIsRunning(false);
    }
    
    // Clean up the interval when component unmounts or dependencies change
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingTime, onComplete]);

  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
  };
  
  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };
  
  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(duration);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Timer circle display */}
      <div className="bg-white/10 p-10 rounded-full w-64 h-64 flex items-center justify-center mb-8">
        <p className="text-5xl font-mono">{formatTime(remainingTime)}</p>
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button 
            onClick={startTimer}
            className="rounded-full bg-amber-600 px-8 py-3 font-semibold text-white no-underline transition hover:bg-amber-500"
          >
            {isPaused ? 'Resume' : 'Start'}
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            className="rounded-full bg-amber-600 px-8 py-3 font-semibold text-white no-underline transition hover:bg-amber-500"
          >
            Pause
          </button>
        )}
        
        <button 
          onClick={resetTimer}
          className="rounded-full bg-white/10 px-8 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        >
          Reset
        </button>
      </div>
    </div>
  );
}