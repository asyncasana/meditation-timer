import Link from "next/link";
import { auth } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-stone-100 to-amber-50 text-stone-800">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-light tracking-wide sm:text-[5rem] text-center">
            <span className="text-stone-500">Sanu</span>Timer
          </h1>
          
          <p className="text-xl text-center max-w-md font-light text-stone-600">
            A mindful meditation timer to help you establish and maintain a consistent practice
          </p>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 max-w-3xl mt-4">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-stone-200 hover:shadow-lg transition">
              <h3 className="text-2xl font-normal text-stone-500">Track Your Practice</h3>
              <div className="text-lg text-stone-600">
                Set goals and monitor your meditation journey with insightful statistics
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-8 shadow-sm border border-stone-200 hover:shadow-lg transition">
              <h3 className="text-2xl font-normal text-stone-500">Focus Your Mind</h3>
              <div className="text-lg text-stone-600">
                Customize sounds, durations, and backgrounds to enhance your meditation experience
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/timer"
                className="rounded-full bg-stone-400 px-10 py-4 font-normal text-white no-underline transition hover:bg-stone-500 shadow-sm"
              >
                Begin Meditation
              </Link>
              {session ? (
                <Link
                  href="/stats"
                  className="rounded-full bg-stone-100 px-10 py-4 font-normal text-stone-800 no-underline transition hover:bg-stone-200 border border-stone-200"
                >
                  View Stats
                </Link>
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="rounded-full bg-stone-100 px-10 py-4 font-normal text-stone-800 no-underline transition hover:bg-stone-200 border border-stone-200"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {session && (
              <p className="text-sm text-stone-700 mt-4">
                Logged in as {session.user?.name}
              </p>
            )}
          </div>

          <div className="text-center text-stone-500 mt-16">
          <p className="italic font-light text-lg">&ldquo;Set aside time for mindfulness every day.&rdquo;</p>            
          <p className="mt-1 text-sm">Your mind will thank you.</p>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}