"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Timer() {
  // State variables
  const [duration, setDuration] = useState(10); // Minutes
  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientPlaying, setAmbientPlaying] = useState(false);

  // Sound references
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sounds
  useEffect(() => {
    endSoundRef.current = new Audio("/sounds/sound-bowl.mp3");
    ambientSoundRef.current = new Audio("/sounds/waves-loop.mp3");

    // Set volumes (0 to 1)
    if (endSoundRef.current) {
      endSoundRef.current.volume = 0.7; // 70% volume for end sound
      endSoundRef.current.preload = "auto"; // Preload this sound
    }

    if (ambientSoundRef.current) {
      ambientSoundRef.current.volume = 0.3; // 30% volume for ambient (quieter)
      ambientSoundRef.current.loop = true;
      ambientSoundRef.current.preload = "auto"; // Preload this sound
    }

    // Cleanup on unmount
    return () => {
      ambientSoundRef.current?.pause();
      endSoundRef.current?.pause();
    };
  }, []);

  const prepareAudio = () => {
    if (endSoundRef.current) {
      endSoundRef.current.pause();
      endSoundRef.current.currentTime = 0;
    }

    if (ambientSoundRef.current) {
      ambientSoundRef.current.pause();
      ambientSoundRef.current.currentTime = 0;
    }
  };

  const fadeOut = (audio: HTMLAudioElement, duration = 2000) => {
    const startVolume = audio.volume;
    const interval = 50; // 50ms intervals
    const steps = duration / interval;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      const newVolume = Math.max(0, startVolume - currentStep * volumeStep);
      audio.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.pause();
        audio.currentTime = 0;
      }
    }, interval);

    return fadeInterval;
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let fadeInterval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
      // Play ambient sound when timer starts
      if (soundEnabled && !ambientPlaying && ambientSoundRef.current) {
        ambientSoundRef.current
          .play()
          .catch((error) => console.log("Audio play failed:", error));
        setAmbientPlaying(true);
      }

      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasCompleted(true);

            // Play ending sound regardless of soundEnabled state
            if (endSoundRef.current) {
              // Reset sound to ensure it plays from beginning
              endSoundRef.current.currentTime = 0;
              endSoundRef.current
                .play()
                .catch((error) => console.log("Audio play failed:", error));
            }

            // Fade out ambient sound if playing
            if (ambientSoundRef.current && ambientPlaying) {
              fadeInterval = fadeOut(ambientSoundRef.current, 1500);
              setAmbientPlaying(false);
            }

            if (interval) clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      // Fade out ambient sound when timer is paused
      if (ambientSoundRef.current && ambientPlaying) {
        fadeInterval = fadeOut(ambientSoundRef.current, 1500); // 1.5 second fade
        setAmbientPlaying(false);
      }

      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (fadeInterval) clearInterval(fadeInterval);
    };
  }, [isRunning, remainingSeconds, soundEnabled, ambientPlaying]);

  // Change duration
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    setRemainingSeconds(minutes * 60);
    setIsRunning(false);
    setHasCompleted(false);
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(duration * 60);
    setHasCompleted(false);

    // Fade out ambient sound if playing
    if (ambientSoundRef.current && ambientPlaying) {
      fadeOut(ambientSoundRef.current, 1000);
      setAmbientPlaying(false);
    }

    // Reset end sound so it can play again
    if (endSoundRef.current) {
      endSoundRef.current.pause();
      endSoundRef.current.currentTime = 0;
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);

    if (!soundEnabled && isRunning && ambientSoundRef.current) {
      // Turn sound on while running
      ambientSoundRef.current.play().catch((e) => console.log(e));
      setAmbientPlaying(true);
    } else if (soundEnabled && ambientSoundRef.current) {
      // Turn sound off
      ambientSoundRef.current.pause();
      ambientSoundRef.current.currentTime = 0;
      setAmbientPlaying(false);
    }
  };

  return (
    // Matching gradient background from homepage
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-amber-50 text-stone-800">
      <div className="container flex max-w-3xl flex-col items-center justify-center gap-12 px-4 py-16">
        {/* Matching homepage header styling */}
        <h1 className="text-center text-4xl font-light tracking-wide">
          <span className="text-stone-500">Sanu</span>Timer
        </h1>

        {/* Timer card with matching styles */}
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            {/* Sound toggle */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={toggleSound}
                className="text-stone-500 transition hover:text-stone-500"
              >
                {soundEnabled ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 5L6 9H2v6h4l5 4V5z"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
            </div>

            {/* Large timer display */}
            <div className="mb-8 text-8xl font-light tracking-widest text-stone-800">
              {formatTime(remainingSeconds)}
            </div>

            {/* Control buttons */}
            <div className="mb-12 flex justify-center gap-4">
              <button
                onClick={() => {
                  if (hasCompleted) {
                    // If we're restarting after completion, make sure audio is ready
                    prepareAudio();
                    setHasCompleted(false);
                  }
                  setIsRunning(!isRunning);
                }}
                disabled={false} // Remove the disabled={hasCompleted} to allow restarting
                className="rounded-full bg-stone-600 px-10 py-3 font-normal text-white no-underline shadow-sm transition hover:bg-stone-500 disabled:opacity-50"
              >
                {isRunning ? "Pause" : "Start"}
              </button>

              <button
                onClick={resetTimer}
                className="rounded-full border border-stone-200 bg-stone-100 px-10 py-3 font-normal text-stone-800 no-underline transition hover:bg-stone-200"
              >
                Reset
              </button>
            </div>

            {/* Completion message */}
            {hasCompleted && (
              <div className="mb-12 rounded-lg border border-amber-100 bg-amber-50 px-6 py-4 text-stone-700">
                <p className="text-xl font-normal">Session Complete</p>
                <p className="mt-1 text-sm">
                  Great job maintaining your practice!
                </p>
              </div>
            )}

            {/* Duration selection */}
            <div className="mb-6">
              <h3 className="mb-3 font-normal text-stone-600">
                Duration (minutes)
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {[5, 10, 15, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => handleDurationChange(min)}
                    className={`rounded-full px-4 py-2 transition ${
                      duration === min
                        ? "bg-stone-500 text-white"
                        : "border border-stone-200 bg-stone-100 text-stone-800 hover:bg-stone-200"
                    }`}
                  >
                    {min}
                  </button>
                ))}
              </div>

              {/* Custom duration input */}
              <div className="mt-4 flex items-center justify-center">
                <label
                  htmlFor="custom-duration"
                  className="mr-3 text-sm text-stone-600"
                >
                  Custom:
                </label>
                <input
                  id="custom-duration"
                  type="number"
                  min="1"
                  max="180"
                  className="w-16 rounded-md border border-stone-200 px-2 py-1 text-center text-stone-800 focus:border-stone-400 focus:outline-none"
                  value={duration}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 0) {
                      handleDurationChange(value);
                    }
                  }}
                />
                <span className="ml-2 text-sm text-stone-600">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quote - matching the style from homepage */}
        <div className="mt-8 text-center text-stone-500">
          <p className="font-light italic">
            &ldquo;Breathe in peace, breathe out tension.&rdquo;
          </p>
        </div>

        {/* Back link */}
        <Link
          href="/"
          className="mt-2 flex items-center text-stone-700 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
