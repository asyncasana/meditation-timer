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
  const [inputValue, setInputValue] = useState<string>(duration.toString());

  // Sound references
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize sounds
  useEffect(() => {
    console.log("Initializing sounds");

    try {
      endSoundRef.current = new Audio("/sounds/sound-bowl.mp3");
      console.log("End sound created");

      // Check if the ambient sound file exists by adding an event listener
      ambientSoundRef.current = new Audio("/sounds/waves-loop.mp3");
      ambientSoundRef.current.addEventListener("error", (e) => {
        console.error("Error loading ambient sound:", e);
      });
      console.log("Ambient sound created");

      // Set volumes (0 to 1)
      if (endSoundRef.current) {
        endSoundRef.current.volume = 0.7;
        endSoundRef.current.preload = "auto";
        console.log("End sound volume:", endSoundRef.current.volume);
      }

      if (ambientSoundRef.current) {
        ambientSoundRef.current.volume = 0.5; // Increase from 0.3 to 0.5 for better audibility
        ambientSoundRef.current.loop = true;
        ambientSoundRef.current.preload = "auto";
        console.log("Ambient sound volume:", ambientSoundRef.current.volume);
      }
    } catch (error) {
      console.error("Error initializing sounds:", error);
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
    if (!audio) return null;

    // Clone the current volume before changes
    const startVolume = audio.volume;

    // Only try fading if audio is actually playing
    if (!audio.paused && audio.volume > 0) {
      console.log("Starting fade out, current volume:", startVolume);

      const interval = 50;
      const steps = duration / interval;
      const volumeStep = startVolume / steps;

      let currentStep = 0;
      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = Math.max(0, startVolume - currentStep * volumeStep);

        // Check if audio is still valid
        if (audio) {
          audio.volume = newVolume;
          console.log(`Fade step ${currentStep}: volume = ${newVolume}`);
        }

        if (currentStep >= steps || newVolume <= 0) {
          clearInterval(fadeInterval);

          if (audio) {
            console.log("Fade complete, pausing audio");
            audio.pause();
            audio.currentTime = 0;
            audio.volume = startVolume; // Reset volume for next time
          }
        }
      }, interval);

      return fadeInterval;
    } else {
      // Already paused or volume is 0
      console.log("Audio already paused or volume is 0, no fade needed");
      audio.pause();
      audio.currentTime = 0;
      return null;
    }
  };

  const initializeAndPlaySound = () => {
    if (!soundEnabled) return;

    // Wait a tick for any pending cleanup to finish
    setTimeout(() => {
      // Create a fresh audio instance
      ambientSoundRef.current = new Audio("/sounds/waves-loop.mp3");

      if (ambientSoundRef.current) {
        ambientSoundRef.current.volume = 0.5;
        ambientSoundRef.current.loop = true;

        console.log("Playing fresh ambient sound");
        // Add a small delay before playing to avoid race conditions
        ambientSoundRef.current
          .play()
          .then(() => {
            console.log("Ambient sound playing");
            setAmbientPlaying(true);
          })
          .catch((e) => {
            console.error("Play failed", e);

            // If autoplay fails, we can try again with user interaction
            if ((e as Error).name === "NotAllowedError") {
              console.log("Autoplay not allowed - will need user interaction");
            }
          });
      }
    }, 50); // Small delay to avoid race conditions
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Timer logic
  useEffect(() => {
    setInputValue(duration.toString());

    let interval: NodeJS.Timeout | null = null;
    let fadeInterval: NodeJS.Timeout | null = null;

    if (isRunning && remainingSeconds > 0) {
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
              console.log("Timer completed, fading ambient sound");

              // Don't pause - just let the fadeOut function handle it
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
      // Fade out ambient sound if playing
      if (ambientSoundRef.current && ambientPlaying) {
        console.log("Timer paused, fading ambient sound");

        // Don't pause immediately, let the fade handle it
        fadeInterval = fadeOut(ambientSoundRef.current, 1500);
        setAmbientPlaying(false);
      }

      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (fadeInterval) clearInterval(fadeInterval);

      // Only stop sound if timer is not running (prevents race condition)
      if (ambientSoundRef.current && !isRunning) {
        ambientSoundRef.current.pause();
        ambientSoundRef.current.volume = 0.5; // Reset volume back to normal
      }
    };
  }, [isRunning, remainingSeconds, soundEnabled, ambientPlaying, duration]);

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
      // Just fade out, don't pause first
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
                  // If timer completed (at 0:00), reset to default duration first
                  if (remainingSeconds <= 0) {
                    setRemainingSeconds(duration * 60);
                  }

                  if (!isRunning) {
                    // If starting the timer, initialize and play sound
                    initializeAndPlaySound();
                  }

                  if (hasCompleted) {
                    prepareAudio();
                    setHasCompleted(false);
                  }

                  setIsRunning(!isRunning);
                }}
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

              {/* Custom duration input - Mobile friendly version */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <label
                  htmlFor="custom-duration"
                  className="text-sm text-stone-600"
                >
                  Custom:
                </label>
                <input
                  id="custom-duration"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="1"
                  max="180"
                  className="w-16 rounded border border-stone-200 px-2 py-1 text-center text-stone-800 focus:border-stone-400 focus:outline-none"
                  value={inputValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setInputValue(val);

                    if (val !== "") {
                      const value = parseInt(val);
                      if (!isNaN(value) && value > 0) {
                        handleDurationChange(value);
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (isNaN(value) || value < 1) {
                      handleDurationChange(1);
                      setInputValue("1");
                    } else if (value > 180) {
                      handleDurationChange(180);
                      setInputValue("180");
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
