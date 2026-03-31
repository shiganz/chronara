"use client";

import sdk from "@farcaster/miniapp-sdk";
import { useEffect, useState, useRef } from "react";
import { useGameState } from "../game/useGameState";
import { GameEngine } from "../game/GameEngine";
import { CHARACTER_SKINS } from "../game/constants";
import { playBgm } from "../game/audio";

type MiniAppUser = Awaited<typeof sdk.context>["user"];
type ScreenState = "Start" | "Playing" | "GameOver" | "Store";

export default function Home() {
  const [isInMiniApp, setIsInMiniApp] = useState<boolean | null>(null);
  const [user, setUser] = useState<MiniAppUser | null>(null);
  const [error, setError] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);

  const [screen, setScreen] = useState<ScreenState>("Start");
  const [currentScore, setCurrentScore] = useState(0);
  const [sessionShards, setSessionShards] = useState(0);

  const { gameState, unlockedSkins, loaded, addShards, updateHighScore, buySkin, equipSkin } =
    useGameState();

  // Farcaster Init
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
    return () => { isMounted = false; };
  }, []);

  // Game Lifecycle
  useEffect(() => {
    if (screen === "Playing" && canvasRef.current && loaded) {
      playBgm();
      canvasRef.current.width  = window.innerWidth;
      canvasRef.current.height = window.innerHeight;

      gameRef.current = new GameEngine(
        canvasRef.current,
        gameState,
        (score, shards) => { setScreen("GameOver"); addShards(shards); updateHighScore(score); },
        (score)  => setCurrentScore(score),
        (shards) => setSessionShards(shards)
      );
      gameRef.current.start();
    }
    return () => { if (gameRef.current) gameRef.current.stop(); };
  }, [screen, loaded]);

  const handleStart = () => { setSessionShards(0); setCurrentScore(0); setScreen("Playing"); };

  const isDevMode = process.env.NODE_ENV === "development";

  if (isInMiniApp === null && !isDevMode)
    return <main className="min-h-screen grid place-items-center bg-black text-white"><p className="animate-pulse text-sm text-gray-500">Loading…</p></main>;

  if (!isInMiniApp && !isDevMode)
    return (
      <main className="min-h-screen grid place-items-center bg-black text-white">
        <div className="border border-white/10 bg-white/5 rounded-2xl p-8 text-center max-w-xs">
          <p className="text-xs uppercase tracking-widest text-cyan-400">Launch inside the Base app</p>
        </div>
      </main>
    );

  if (!loaded) return <div className="bg-black min-h-screen" />;

  return (
    <main className="fixed inset-0 bg-black overflow-hidden select-none" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>

      {/* ── Canvas ──────────────────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        style={{ display: screen === "Playing" ? "block" : "none" }}
        className="w-full h-full touch-none"
      />

      {/* ── MAIN MENU ───────────────────────────────────────────────────────── */}
      {screen === "Start" && (
        <div className="absolute inset-0 flex flex-col items-center justify-between pb-10 pt-16 z-10 text-white"
          style={{ background: "radial-gradient(ellipse at 50% 20%, #0d1a40 0%, #050510 60%, #000 100%)" }}>

          {/* Logo area */}
          <div className="flex flex-col items-center gap-2">
            {/* Decorative neon bar */}
            <div style={{ width: 48, height: 3, borderRadius: 2, background: "linear-gradient(90deg,#00ffff,#ff00ff)" }} />
            <h1
              className="text-6xl font-black tracking-tighter leading-none mt-2"
              style={{ background: "linear-gradient(135deg,#00e5ff 0%,#d500f9 60%,#ff6d00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              CHRONARA
            </h1>
            <p className="text-[10px] tracking-[0.45em] uppercase text-white/40 mt-1">Time Runner</p>

            {/* Stats row */}
            <div className="flex gap-3 mt-8">
              <Stat label="Best" value={`${gameState.highScore}m`} />
              <Stat label="Shards" value={`💎 ${gameState.shards}`} />
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full max-w-xs flex flex-col gap-3 px-6">
            <button
              id="btn-start"
              onClick={handleStart}
              className="relative w-full py-4 rounded-2xl font-bold text-base text-black overflow-hidden active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#00e5ff,#7b2ff7)", boxShadow: "0 0 24px rgba(0,229,255,0.35)" }}
            >
              ▶ &nbsp;RUN THROUGH TIME
            </button>
            <button
              id="btn-store"
              onClick={() => setScreen("Store")}
              className="w-full py-3 rounded-2xl text-sm font-semibold border border-white/15 bg-white/5 active:bg-white/10 transition-colors"
            >
              🎭 &nbsp;Skins &amp; Abilities
            </button>
          </div>

          {isDevMode && <p className="fixed bottom-3 text-[10px] text-white/20 tracking-widest uppercase">Dev Mode</p>}
        </div>
      )}

      {/* ── STORE ───────────────────────────────────────────────────────────── */}
      {screen === "Store" && (
        <div className="absolute inset-0 flex flex-col z-20 text-white overflow-y-auto"
          style={{ background: "linear-gradient(180deg,#080820 0%,#000 100%)" }}>

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
            style={{ background: "linear-gradient(180deg,#080820 80%,transparent 100%)" }}>
            <button onClick={() => setScreen("Start")} className="text-xs px-3 py-2 rounded-lg bg-white/10 active:bg-white/20">← Back</button>
            <span className="text-sm font-bold text-yellow-400">💎 {gameState.shards}</span>
          </div>

          <div className="px-5 pb-4">
            <h2 className="text-2xl font-black mb-1">TIME RELICS</h2>
            <p className="text-xs text-white/30 mb-6">Equip a skin to unlock its special ability.</p>

            <div className="flex flex-col gap-3">
              {CHARACTER_SKINS.map(skin => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isEquipped = gameState.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className="rounded-2xl p-4 border"
                    style={{
                      borderColor: isEquipped ? "#00e5ff55" : "rgba(255,255,255,0.08)",
                      background: isEquipped
                        ? "linear-gradient(135deg,rgba(0,229,255,0.07),rgba(123,47,247,0.07))"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {/* Colour swatch */}
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg"
                        style={{ background: skin.color, boxShadow: `0 0 12px ${skin.color}66` }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base leading-tight">{skin.name}</div>
                        <div className="text-[11px] text-white/40 mt-0.5">{skin.description}</div>
                      </div>
                      <AbilityBadge ability={skin.ability} />
                    </div>

                    {isEquipped ? (
                      <div className="text-center text-xs py-2 rounded-lg font-bold text-cyan-400 border border-cyan-400/30 bg-cyan-900/20">✓ EQUIPPED</div>
                    ) : isUnlocked ? (
                      <button onClick={() => equipSkin(skin.id)}
                        className="w-full py-2 rounded-lg bg-white text-black font-bold text-sm active:scale-95 transition-transform">
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => buySkin(skin)}
                        disabled={gameState.shards < skin.cost}
                        className="w-full py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform disabled:opacity-40"
                        style={{ background: gameState.shards >= skin.cost ? "linear-gradient(135deg,#ffd740,#ff6d00)" : undefined, color: gameState.shards >= skin.cost ? "#000" : undefined, border: gameState.shards < skin.cost ? "1px solid rgba(255,255,255,0.1)" : undefined }}
                      >
                        {gameState.shards >= skin.cost ? `Buy · ${skin.cost} 💎` : `${skin.cost} 💎 needed`}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── GAME OVER ───────────────────────────────────────────────────────── */}
      {screen === "GameOver" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20 text-white px-6"
          style={{ background: "radial-gradient(ellipse at center,rgba(30,0,0,0.97) 0%,rgba(0,0,0,0.98) 100%)" }}>

          <div>
            <p className="text-center text-[11px] uppercase tracking-[0.4em] text-red-400/70 mb-1">Timeline collapsed</p>
            <h2 className="text-5xl font-black text-center text-red-400">DEAD</h2>
          </div>

          <div className="w-full max-w-xs rounded-2xl p-5 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Distance</p>
            <p className="text-5xl font-black mb-4">{currentScore}<span className="text-xl text-white/30 ml-1">m</span></p>
            <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Shards collected</p>
            <p className="text-2xl font-bold text-yellow-400">+{sessionShards} 💎</p>
          </div>

          <div className="w-full max-w-xs flex flex-col gap-3">
            <button id="btn-retry" onClick={handleStart}
              className="w-full py-4 rounded-2xl font-bold text-base text-black active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#00e5ff,#7b2ff7)", boxShadow: "0 0 20px rgba(0,229,255,0.3)" }}>
              ↺ &nbsp;Run Again
            </button>
            <button onClick={() => setScreen("Start")}
              className="w-full py-3 rounded-2xl text-sm font-semibold border border-white/15 bg-white/5 active:bg-white/10 transition-colors">
              Main Menu
            </button>
          </div>
        </div>
      )}

      {/* ── HUD (while playing) ──────────────────────────────────────────────── */}
      {screen === "Playing" && (
        <div className="absolute top-0 inset-x-0 flex justify-between items-start p-4 pointer-events-none z-10 text-white">
          <HudPill label={`${currentScore}m`} />
          <HudPill label={`💎 ${sessionShards}`} />
          {currentScore < 50 && (
            <div className="absolute left-1/2 -translate-x-1/2 top-16 text-center text-xs text-white/30 animate-pulse px-3">
              Swipe ↔ lanes · ↑ jump · ↓ slide
            </div>
          )}
        </div>
      )}

    </main>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded-2xl"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="text-[10px] uppercase tracking-widest text-white/30 mb-0.5">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  );
}

function HudPill({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 rounded-full text-sm font-bold"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
      {label}
    </div>
  );
}

function AbilityBadge({ ability }: { ability: string }) {
  if (ability === "None") return null;
  const colorMap: Record<string, string> = {
    PhaseDash:  "#00ffff",
    TimeFreeze: "#aaddff",
    HyperSpeed: "#ff5555",
    Rewind:     "#cc44ff",
  };
  const c = colorMap[ability] ?? "#ffffff";
  return (
    <span className="text-[10px] px-2 py-1 rounded-md font-bold flex-shrink-0"
      style={{ color: c, background: c + "22", border: `1px solid ${c}44` }}>
      {ability}
    </span>
  );
}
