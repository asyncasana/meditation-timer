"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Timer() {
  // State variables
  const [duration, setDuration] = useState(10); // Minutes
  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, remainingSeconds]);
  
  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(duration * 60);
    setHasCompleted(false);
  };
  
  // Change duration
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    setRemainingSeconds(minutes * 60);
    setIsRunning(false);
    setHasCompleted(false);
  };

  return (
    
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-stone-50 text-stone-800">
      <div className="container max-w-3xl flex flex-col items-center justify-center gap-12 px-4 py-16">
        {/* Matching homepage header styling */}
        <h1 className="text-4xl font-light tracking-wide text-center">
          <span className="text-stone-500">Sanu</span>Timer
        </h1>
        
        {/* Timer card with matching styles */}
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border border-stone-200">
          <div className="text-center">
            {/* Large timer display */}
            <div className="text-8xl font-light text-stone-500 mb-8 tracking-widest">
              {formatTime(remainingSeconds)}
            </div>
            
            {/* Control buttons */}
            <div className="flex gap-4 mb-12 justify-center">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                disabled={hasCompleted}
                className="rounded-full bg-stone-400 px-10 py-3 font-normal text-white no-underline transition hover:bg-stone-500 disabled:opacity-50 shadow-sm"
              >
                {isRunning ? "Pause" : "Start"}
              </button>
              
              <button 
                onClick={resetTimer}
                className="rounded-full bg-stone-100 px-10 py-3 font-normal text-stone-800 no-underline transition hover:bg-stone-200 border border-stone-200"
              >
                Reset
              </button>
            </div>
            
            {/* Completion message */}
            {hasCompleted && (
              <div className="text-stone-700 mb-12 bg-amber-50 py-4 px-6 rounded-lg border border-amber-100">
                <p className="text-xl font-normal">Session Complete</p>
                <p className="text-sm mt-1">Great job maintaining your practice!</p>
              </div>
            )}
            
            {/* Duration selection */}
            <div className="mb-6">
              <h3 className="font-normal text-stone-600 mb-3">Duration (minutes)</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {[5, 10, 15, 20, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => handleDurationChange(min)}
                    className={`px-4 py-2 rounded-full transition ${
                      duration === min 
                        ? "bg-stone-600 text-white" 
                        : "bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200"
                    }`}
                  >
                    {min}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Quote - matching the style from homepage */}
        <div className="text-center text-stone-500 mt-8">
        <p className="italic font-light">&ldquo;Breathe in peace, breathe out tension.&rdquo;</p>
        </div>
        
        {/* Back link */}
        <Link
          href="/"
          className="text-stone-700 hover:underline mt-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}