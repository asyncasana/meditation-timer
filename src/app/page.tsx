"use client";

import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
import FocusTimerOverlay from "./_components/focus_mode/FocusTimerOverlay";

export default function Home() {
  // 1. State variables
  const [duration, setDuration] = useState(5); // Stores the meditation duration in minutes (default: 5)
  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60); // Tracks the countdown in seconds based on duration
  const [isRunning, setIsRunning] = useState(false); // Boolean flag for whether the timer is active
  const [hasCompleted, setHasCompleted] = useState(false); // Boolean to track if the session finished
  const [soundEnabled, setSoundEnabled] = useState(true); // Controls whether ambient sounds should play during timer session
  const [inputValue, setInputValue] = useState<string>(duration.toString()); // Handles the custom duration input field
  const [focusMode, setFocusMode] = useState(false); // Boolean to track if focus mode is active

  // 2. Sound references
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);
  const isAmbientPlayingRef = useRef(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef(duration * 60);

  // 3. Initialize end sound
  // This effect runs once when the component mounts
  useEffect(() => {
    try {
      endSoundRef.current = new Audio("/sounds/sound-bowl.mp3");

      if (endSoundRef.current) {
        endSoundRef.current.volume = 0.7;
        endSoundRef.current.preload = "auto";
        console.log("End sound initialized");
      }
    } catch (error) {
      console.error("Error initializing end sound:", error);
    }

    return () => {
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current.src = "";
      }
    };
  }, []);

  // 4. Initialize ambient sound
  // This effect runs once when the component mounts
  useEffect(() => {
    try {
      ambientSoundRef.current = new Audio("/sounds/waves-loop.mp3");

      if (ambientSoundRef.current) {
        ambientSoundRef.current.loop = true;
        ambientSoundRef.current.volume = 0.5;
        ambientSoundRef.current.preload = "auto";
        console.log("Ambient sound initialized");
      }
    } catch (error) {
      console.error("Error initializing ambient sound:", error);
    }

    return () => {
      if (ambientSoundRef.current) {
        ambientSoundRef.current.pause();
        ambientSoundRef.current.src = "";
      }

      if (keepAliveIntervalRef.current) {
        clearInterval(keepAliveIntervalRef.current);
      }
    };
  }, []);

  // 5. Play ambient sound
  // This function is called when the timer starts
  const playAmbientSound = () => {
    if (!soundEnabled || !ambientSoundRef.current) return;

    if (ambientSoundRef.current.paused) {
      ambientSoundRef.current.currentTime = 0;
    }

    ambientSoundRef.current.loop = true;

    ambientSoundRef.current
      .play()
      .then(() => {
        isAmbientPlayingRef.current = true;
        keepAliveIntervalRef.current = setInterval(() => {
          if (ambientSoundRef.current && !ambientSoundRef.current.loop) {
            ambientSoundRef.current.loop = true;
          }
        }, 10000);
      })
      .catch((error) => {
        console.error("Failed to play ambient sound:", error);
      });
  };

  // 6. Stop ambient sound
  // This function is called when the timer is stopped or completed
  const stopAmbientSound = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (ambientSoundRef.current) {
      console.log("Stopping ambient sound");
      try {
        ambientSoundRef.current.pause();
        ambientSoundRef.current.currentTime = 0;
        isAmbientPlayingRef.current = false;
      } catch (error) {
        console.error("Error stopping ambient sound:", error);
      }
    }
  };

  // 7. Timer logic
  // This effect runs when the timer is running or when the duration changes
  useEffect(() => {
    // Only update input value when duration changes
    setInputValue(duration.toString());

    // Only reset timer when explicitly needed, NOT when just pausing
    // This is the key change - we only reset if seconds is 0 (completed)
    // OR if the duration has changed while timer was stopped
    if (!isRunning && hasCompleted) {
      secondsRef.current = duration * 60;
      setRemainingSeconds(secondsRef.current); // Update display
    }

    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        // Use ref value to track seconds
        if (secondsRef.current <= 1) {
          setIsRunning(false);
          setHasCompleted(true);

          // Always play ending sound (notification is important regardless of sound state)
          if (endSoundRef.current) {
            endSoundRef.current.currentTime = 0;
            endSoundRef.current
              .play()
              .catch((error) => console.log("End sound play failed:", error));
          }

          // Stop ambient sound
          if (isAmbientPlayingRef.current) {
            stopAmbientSound();
          }

          secondsRef.current = 0;
          setRemainingSeconds(0); // Update display
          if (interval) {
            clearInterval(interval);
          } // Only clear if interval is set to avoid errors
        } else {
          // Decrement the ref
          secondsRef.current -= 1;
          // Update the state for display purposes only
          setRemainingSeconds(secondsRef.current);
        }
      }, 1000);
    } else if (!isRunning) {
      // Stop ambient sound if timer is paused
      if (isAmbientPlayingRef.current) {
        stopAmbientSound();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, duration, soundEnabled]);

  // 8. Change duration of the timer
  // This function is called when the user selects a new duration
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    secondsRef.current = minutes * 60; // Update the ref
    setRemainingSeconds(minutes * 60); // Update display
    setIsRunning(false);
    setHasCompleted(false);

    // Stop ambient sound if playing
    if (isAmbientPlayingRef.current) {
      stopAmbientSound();
    }
  };

  // 9. Reset timer
  // This function is called when the user clicks the reset button
  const resetTimer = () => {
    setIsRunning(false);
    secondsRef.current = duration * 60; // Reset the ref
    setRemainingSeconds(duration * 60); // Update display
    setHasCompleted(false);

    // Stop ambient sound if playing
    if (isAmbientPlayingRef.current) {
      stopAmbientSound();
    }

    // Reset end sound
    if (endSoundRef.current) {
      endSoundRef.current.pause();
      endSoundRef.current.currentTime = 0;
    }
  };

  // 10. Toggle sound
  // This function is called when the user clicks the sound toggle button
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);

    if (!newSoundState) {
      // Turn sound off
      stopAmbientSound();
    } else if (newSoundState && isRunning && ambientSoundRef.current) {
      // Turn sound on while timer is running
      ambientSoundRef.current.play().catch((e) => {
        console.error("Failed to resume ambient sound:", e);
      });
      isAmbientPlayingRef.current = true;
    }
  };

  // 11. Handle pause/resume
  // This function is called when the user clicks the pause button
  const handlePauseToggle = () => {
    setIsRunning((prev) => {
      const newRunning = !prev;
      // If resuming and sound is enabled, play ambient sound
      if (newRunning && soundEnabled) {
        playAmbientSound();
      }
      // If pausing, stop ambient sound
      if (!newRunning && isAmbientPlayingRef.current) {
        stopAmbientSound();
      }
      return newRunning;
    });
  };

  // 12. UI component
  return (
    <>
      {focusMode && (
        <FocusTimerOverlay
          remainingSeconds={remainingSeconds}
          isRunning={isRunning}
          onPauseToggle={handlePauseToggle}
          onExit={() => {
            setFocusMode(false);
            resetTimer();
          }}
          duration={duration}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}
      {!focusMode && (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-amber-50 text-stone-800">
          <div className="container flex max-w-3xl flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-center text-4xl font-light tracking-wide">
              <span className="text-stone-500">Mindful</span>Minutes
            </h1>

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

                {/* Control buttons */}
                <div className="mb-12 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      if (secondsRef.current <= 0) {
                        secondsRef.current = duration * 60;
                        setRemainingSeconds(duration * 60);
                      }

                      const newRunningState = !isRunning;
                      setIsRunning(newRunningState);

                      // Always play ambient sound when resuming
                      if (newRunningState && soundEnabled) {
                        playAmbientSound();
                      }

                      // Show overlay when starting (only if not already in focus mode)
                      if (newRunningState && !focusMode) {
                        setFocusMode(true);
                      }

                      if (hasCompleted) {
                        if (endSoundRef.current) {
                          endSoundRef.current.pause();
                          endSoundRef.current.currentTime = 0;
                        }
                        setHasCompleted(false);
                      }
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
                    Select duration in minutes
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
                  <div className="mt-4 flex items-center justify-center gap-2">
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
                    <span className="ml-2 text-sm text-stone-600">
                      minute meditation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-8 text-center text-stone-500">
              <p className="font-light italic">
                &ldquo;Breathe in peace, breathe out tension.&rdquo;
              </p>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
