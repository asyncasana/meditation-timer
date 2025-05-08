"use client";

import { useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [defaultDuration, setDefaultDuration] = useState(10);
  const [preparationTime, setPreparationTime] = useState(10);
  const [enableSounds, setEnableSounds] = useState(true);
  
  const saveSettings = () => {
    // We'll add actual saving functionality later
    alert("Settings saved! (This will connect to the database later)");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-slate-900 text-white">
      <div className="container max-w-2xl flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-bold">Settings</h1>
        
        <div className="w-full bg-white/10 p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-6">Timer Settings</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Default Duration (minutes)</label>
            <input 
              type="number" 
              value={defaultDuration} 
              onChange={(e) => setDefaultDuration(parseInt(e.target.value))}
              className="bg-white/5 border border-white/20 rounded px-4 py-2 w-full text-white"
              min="1"
              max="120"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Preparation Time (seconds)</label>
            <input 
              type="number" 
              value={preparationTime} 
              onChange={(e) => setPreparationTime(parseInt(e.target.value))}
              className="bg-white/5 border border-white/20 rounded px-4 py-2 w-full text-white"
              min="0"
              max="60"
            />
          </div>
          
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableSounds} 
                onChange={() => setEnableSounds(!enableSounds)} 
                className="mr-2"
              />
              Enable meditation sounds
            </label>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={saveSettings}
              className="rounded-full bg-amber-600 px-6 py-2 font-semibold text-white transition hover:bg-amber-500"
            >
              Save Settings
            </button>
          </div>
        </div>
        
        <Link 
          href="/"
          className="mt-8 text-amber-200 hover:text-amber-300"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}