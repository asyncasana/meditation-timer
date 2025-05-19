"use client";

import { useState, useEffect, useRef } from "react";
import FocusTimerOverlay from "./_components/focus_mode/FocusTimerOverlay";

export default function Home() {
  const [duration, setDuration] = useState(5);
  const [remainingSeconds, setRemainingSeconds] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [inputValue, setInputValue] = useState<string>(duration.toString());
  const [focusMode, setFocusMode] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [minLoaderDone, setMinLoaderDone] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [endSoundUnlocked, setEndSoundUnlocked] = useState(false);

  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const ambientSoundRef = useRef<HTMLAudioElement | null>(null);
  const isAmbientPlayingRef = useRef(false);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef(duration * 60);

  // 1. Load background image
  useEffect(() => {
    const img = new window.Image();
    img.src = "/images/waves.jpg";
    img.onload = () => setBgLoaded(true);
  }, []);

  // 2. Enforce minimum loader time
  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderDone(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // 3. Loader logic
  useEffect(() => {
    if (bgLoaded && minLoaderDone) {
      const timeout = setTimeout(() => setShowLoader(false), 700);
      return () => clearTimeout(timeout);
    } else {
      setShowLoader(true);
    }
  }, [bgLoaded, minLoaderDone]);

  // 4. Initialise ambient sound
  useEffect(() => {
    try {
      ambientSoundRef.current = new Audio("/sounds/waves-loop.mp3");
      ambientSoundRef.current.loop = true;
      ambientSoundRef.current.volume = 0.5;
      ambientSoundRef.current.preload = "auto";
    } catch (error) {
      console.error("Error initializing ambient sound:", error);
    }

    return () => {
      ambientSoundRef.current?.pause();
      ambientSoundRef.current!.src = "";
      if (keepAliveIntervalRef.current) clearInterval(keepAliveIntervalRef.current);
    };
  }, []);

  // 5. Initialise end sound WITHOUT triggering it on iPhone
  useEffect(() => {
    try {
      const sound = new Audio("/sounds/sound-bowl.mp3");
      sound.volume = 0.7;
      sound.preload = "auto";
      endSoundRef.current = sound;
    } catch (error) {
      console.error("Error setting up end sound:", error);
    }

    return () => {
      endSoundRef.current?.pause();
      endSoundRef.current!.src = "";
    };
  }, []);

  // 6. Unlock end sound - user interaction must happen first
  const unlockEndSound = () => {
    if (!endSoundUnlocked && endSoundRef.current) {
      setEndSoundUnlocked(true);
    }
  };

  // 7. Play ambient sound
  const playAmbientSound = () => {
    if (!soundEnabled || !ambientSoundRef.current) return;

    if (ambientSoundRef.current.paused) {
      ambientSoundRef.current.currentTime = 0;
    }

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
      .catch((err) => console.error("Failed to play ambient sound:", err));
  };

  // 8. Stop ambient sound
  const stopAmbientSound = () => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }

    if (ambientSoundRef.current) {
      ambientSoundRef.current.pause();
      ambientSoundRef.current.currentTime = 0;
      isAmbientPlayingRef.current = false;
    }
  };

  // 9. Timer logic
  useEffect(() => {
    setInputValue(duration.toString());

    if (!isRunning && hasCompleted) {
      secondsRef.current = duration * 60;
      setRemainingSeconds(secondsRef.current);
    }

    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (secondsRef.current <= 1) {
          setIsRunning(false);
          setHasCompleted(true);
          setRemainingSeconds(0);
          stopAmbientSound();

          if (endSoundRef.current && endSoundUnlocked) {
            endSoundRef.current.currentTime = 0;
            endSoundRef.current.play().catch((err) => {
              console.error("Failed to play end sound:", err);
            });
          }
        } else {
          secondsRef.current -= 1;
          setRemainingSeconds(secondsRef.current);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, duration, endSoundUnlocked]);

  // 12. Change duration of the timer
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

  // 13. Reset timer
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

  // 14. Toggle sound
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

  // 15. Handle pause/resume
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

  // 16. UI component
  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans">
      {/* Background image and dark overlay */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 z-50 bg-cover bg-center opacity-40"
          style={{
            backgroundImage: "url('images/waves.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      {/* Page content */}
      <main
        className={`relative z-10 flex min-h-screen flex-col items-center justify-center text-stone-100 transition-all duration-500 ease-in-out ${focusMode ? "pointer-events-none translate-y-20 opacity-0" : "translate-y-0 opacity-80"} `}
      >
        {/* Loader overlay while background image loads */}
        {showLoader && (
          <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ${
              bgLoaded && minLoaderDone
                ? "pointer-events-none opacity-0"
                : "opacity-100"
            }`}
          >
            <img
              src="/apple-touch-icon.png"
              alt="MindfulMinutes Logo"
              className="h-24 w-24"
            />
          </div>
        )}
        <div className="container flex max-w-3xl flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-center text-4xl font-bold tracking-wide drop-shadow-lg">
            <span className="text-black/90">Mindful</span>
            <span className="text-white/90">Minutes</span>
          </h1>
          <div className="shadow-smbackdrop-blur-md w-full max-w-md rounded-2xl bg-white/70 p-8 shadow-xl">
            <div className="space-y-6 text-center">
              {/* Duration selection */}
              <div className="mt-5 mb-10">
                <h2 className="mb-6 text-lg font-normal text-black/90">
                  Select duration in minutes
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {[5, 15, 30].map((min) => (
                    <button
                      aria-label={`Set duration to ${min} minutes`}
                      title={`Set duration to ${min} minutes`}
                      type="button"
                      key={min}
                      onClick={() => handleDurationChange(min)}
                      className={`h-11 w-17 rounded-full px-5 py-2 transition ${
                        duration === min
                          ? "bg-stone-700 text-white"
                          : "border border-stone-200 bg-white text-stone-800 hover:bg-stone-200"
                      }`}
                    >
                      {min}
                    </button>
                  ))}
                </div>

                {/* Custom duration input */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-md text-black/90">Custom:</span>
                  <label htmlFor="custom-duration" className="sr-only">
                    Custom duration in minutes
                  </label>
                  <input
                    aria-label="Custom duration in minutes"
                    title="Custom duration in minutes"
                    id="custom-duration"
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="1"
                    max="180"
                    className="h-8 w-12 rounded border bg-white/70 text-center text-black/90 shadow-sm focus:border-stone-500 focus:ring focus:ring-stone-200 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                    style={{ MozAppearance: "textfield" }}
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
                  <span className="text-md text-black/90">mins</span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="mb-6 flex items-center justify-center gap-4">
                {/* Start/Pause button */}
                <button
                  onClick={() => {
                    unlockEndSound(); // <-- Unlock bell sound on first click

                    if (secondsRef.current <= 0) {
                      secondsRef.current = duration * 60;
                      setRemainingSeconds(duration * 60);
                    }
                    const newRunningState = !isRunning;
                    setIsRunning(newRunningState);
                    if (newRunningState && soundEnabled) {
                      playAmbientSound();
                    }
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
                  className="flex w-25 items-center justify-center rounded-full bg-stone-800 px-8 py-3 font-medium text-white shadow-sm transition hover:bg-stone-600 disabled:opacity-50"
                  aria-label="Start timer"
                  title="Start timer"
                  type="button"
                >
                  Start
                </button>

                {/* Sound toggle button */}
                <button
                  onClick={toggleSound}
                  aria-label={soundEnabled ? "Mute sound" : "Unmute sound"}
                  className="flex w-25 items-center justify-center rounded-full bg-stone-800 px-8 py-3 text-lg font-medium text-white shadow-sm transition hover:bg-stone-600 disabled:opacity-50"
                  title={soundEnabled ? "Mute sound" : "Unmute sound"}
                  type="button"
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
            </div>
          </div>
          {/* Quote */}
          <div className="mt-8 text-center text-white">
            <p className="font-light italic">
              &ldquo;Breathe in peace, breathe out tension.&rdquo;
            </p>
          </div>
        </div>
      </main>

      {/* Focus overlay content */}
      <div
        className={`fixed inset-0 z-20 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${focusMode ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"} `}
      >
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
      </div>
    </div>
  );
}