"use client";

import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";

type MiniAppUser = Awaited<typeof sdk.context>["user"];

export default function Home() {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        sdk.actions.ready();
        const inMiniApp = await sdk.isInMiniApp();
        if (!isMounted) return;

        setIsInMiniApp(inMiniApp);
        if (inMiniApp) {
          const context = await sdk.context;
          if (!isMounted) return;
          setUser(context.user ?? null);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Mini-app init failed.");
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isInMiniApp === null) {
    return (
      <main className="min-h-screen grid place-items-center p-5">
        <div className="w-full max-w-[680px] border border-white/15 bg-[rgba(12,20,38,0.7)] backdrop-blur-sm rounded-[18px] p-6">
          <p className="inline-block m-0 text-xs tracking-[0.08em] uppercase text-[#9fc2ff]">
            Loading mini-app…..
          </p>
        </div>
      </main>
    );
  }

  if (!isInMiniApp) {
    return (
      <main className="min-h-screen grid place-items-center p-5">
        <div className="w-full max-w-[680px] border border-white/15 bg-[rgba(12,20,38,0.7)] backdrop-blur-sm rounded-[18px] p-6">
          <p className="inline-block m-0 text-xs tracking-[0.08em] uppercase text-[#9fc2ff] ">
            Please launch it on the base app
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center p-5">
      <div className="w-full max-w-[680px] border border-white/15 bg-[rgba(12,20,38,0.7)] backdrop-blur-sm rounded-[18px] p-6">
        <p className="inline-block m-0 text-xs tracking-[0.08em] uppercase text-[#9fc2ff]">
          Base Mini-App Template
        </p>
        <h1 className="mt-2.5 mb-2.5 text-[34px] font-bold">Start Building</h1>
        <p className="mt-0 mb-5 text-[#b7c6e6]">
          This is a clean starter for Base/Farcaster mini-apps. Replace this
          page with your app logic.
        </p>

        {error && <p className="mt-0 mb-3 text-[#ff9f9f]">{error}</p>}

        <div className="grid gap-2 font-mono text-sm">
          {!user ? (
            <p className="m-0 px-3 py-2.5 border border-white/[0.08] rounded-[10px] bg-[rgba(6,10,20,0.55)]">
              Loading user…
            </p>
          ) : (
            <>
              <p className="m-0 px-3 py-2.5 border border-white/[0.08] rounded-[10px] bg-[rgba(6,10,20,0.55)]">
                User FID: {user.fid}
              </p>
              <p className="m-0 px-3 py-2.5 border border-white/[0.08] rounded-[10px] bg-[rgba(6,10,20,0.55)]">
                Username: {user.username ?? "Not available"}
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
