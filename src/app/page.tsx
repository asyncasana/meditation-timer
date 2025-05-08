import Link from "next/link";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const hello = await api.meditation.hello({ text: "meditator" });
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-slate-900 text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-amber-200">Zen</span>Timer
          </h1>
          
          <p className="text-xl text-center max-w-md">
            A mindful meditation timer to help you establish and maintain a consistent practice
          </p>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8 max-w-3xl">
            <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 hover:bg-white/20 transition">
              <h3 className="text-2xl font-bold">Track Your Practice</h3>
              <div className="text-lg">
                Set goals and monitor your meditation journey with insightful statistics
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 hover:bg-white/20 transition">
              <h3 className="text-2xl font-bold">Focus Your Mind</h3>
              <div className="text-lg">
                Customize sounds, durations, and backgrounds to enhance your meditation experience
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <Link
                href="/timer"
                className="rounded-full bg-amber-600 px-10 py-3 font-semibold text-white no-underline transition hover:bg-amber-500"
              >
                Begin Meditation
              </Link>
              {session ? (
                <Link
                  href="/stats"
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                >
                  View Stats
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {session && (
              <p className="text-sm text-amber-200 mt-4">
                Logged in as {session.user?.name}
              </p>
            )}
          </div>

          <div className="text-center text-sm text-gray-300 mt-8">
            <p>Set aside time for mindfulness every day.</p>
            <p>Your mind will thank you.</p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}