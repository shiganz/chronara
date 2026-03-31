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
  
  const {
      gameState,
      unlockedSkins,
      loaded,
      addShards,
      updateHighScore,
      buySkin,
      equipSkin
  } = useGameState();

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
    return () => {
      isMounted = false;
    };
  }, []);

  // Game Lifecycle
  useEffect(() => {
      if (screen === "Playing" && canvasRef.current && loaded) {
          playBgm();
          // Resize canvas correctly
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;

          gameRef.current = new GameEngine(
              canvasRef.current,
              gameState,
              (score, shards) => {
                  setScreen("GameOver");
                  addShards(shards);
                  updateHighScore(score);
              },
              (score) => setCurrentScore(score),
              (shards) => setSessionShards(shards)
          );
          gameRef.current.start();
      }

      return () => {
          if (gameRef.current) {
              gameRef.current.stop();
          }
      };
  }, [screen, loaded]); // Intentionally omitting others to avoid restarts

  const handleStart = () => {
      setSessionShards(0);
      setCurrentScore(0);
      setScreen("Playing");
  }

  // Mini-App Validation Bypass Details:
  const isDevMode = process.env.NODE_ENV === "development";

  if (isInMiniApp === null && !isDevMode) {
    return (
      <main className="min-h-screen grid place-items-center p-5 bg-black text-white">
        <p>Loading validation...</p>
      </main>
    );
  }

  if (!isInMiniApp && !isDevMode) {
    return (
      <main className="min-h-screen grid place-items-center p-5 bg-black text-white">
        <div className="w-full max-w-[680px] border border-white/15 bg-[rgba(12,20,38,0.7)] backdrop-blur-sm rounded-[18px] p-6 text-center">
          <p className="inline-block m-0 text-xs tracking-[0.08em] uppercase text-[#9fc2ff] ">
            Please launch it on the base app
          </p>
        </div>
      </main>
    );
  }

  if (!loaded) return <div className="bg-black min-h-screen" />;

  return (
    <main className="fixed inset-0 bg-black overflow-hidden font-mono select-none">
        
       {/* Background Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ display: screen === "Playing" ? "block" : "none" }}
        className="w-full h-full touch-none"
      />

      {/* Main Menu UI */}
      {screen === "Start" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-900 via-indigo-950 to-black z-10 text-white">
              <h1 className="text-5xl font-black italic tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500" style={{WebkitTextStroke: "1px rgba(255,255,255,0.2)"}}>CHRONARA</h1>
              <p className="text-cyan-200 uppercase tracking-[0.3em] text-xs mb-12">Time Runner</p>

              <div className="flex gap-4 mb-12 text-center text-sm">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl min-w-24">
                      <div className="text-gray-400 text-xs uppercase mb-1">High Score</div>
                      <div className="text-xl text-fuchsia-400 font-bold">{gameState.highScore}</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl min-w-24">
                      <div className="text-gray-400 text-xs uppercase mb-1">Shards</div>
                      <div className="text-xl text-yellow-400 font-bold">💎 {gameState.shards}</div>
                  </div>
              </div>

              <button 
                onClick={handleStart}
                className="w-full max-w-xs py-4 mb-4 rounded-full font-bold text-lg bg-white text-black active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                  TAP TO RUN
              </button>
              <button 
                onClick={() => setScreen("Store")}
                className="w-full max-w-xs py-3 rounded-full font-bold text-sm border-2 border-white/20 active:bg-white/10 transition-colors"
              >
                  SKINS & ABILITIES
              </button>
              
              {isDevMode && <p className="fixed bottom-4 text-xs text-gray-600">DEV MODE BYPASS ACTIVE</p>}
          </div>
      )}

      {/* Store UI */}
      {screen === "Store" && (
         <div className="absolute inset-0 flex flex-col p-6 bg-gradient-to-b from-indigo-950 to-black z-20 text-white overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <button onClick={() => setScreen("Start")} className="text-sm p-2 bg-white/10 rounded-lg">← BACK</button>
                <div className="font-bold text-yellow-400">💎 {gameState.shards}</div>
             </div>

             <h2 className="text-2xl font-bold mb-6">TIME RELICS</h2>

             <div className="flex flex-col gap-4 pb-20">
                 {CHARACTER_SKINS.map(skin => {
                     const isUnlocked = unlockedSkins.includes(skin.id);
                     const isEquipped = gameState.selectedSkinId === skin.id;

                     return (
                         <div key={skin.id} className={`p-4 rounded-2xl border ${isEquipped ? 'border-cyan-400 bg-cyan-900/20' : 'border-white/10 bg-white/5'}`}>
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: skin.color }} />
                                    <h3 className="font-bold text-lg">{skin.name}</h3>
                                </div>
                                <div className="text-xs px-2 py-1 bg-white/10 rounded-md">
                                    Ability: <span className="text-fuchsia-400">{skin.ability}</span>
                                </div>
                             </div>
                             <p className="text-sm text-gray-400 mb-4">{skin.description}</p>
                             
                             {isEquipped ? (
                                 <button disabled className="w-full py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold text-sm">EQUIPPED</button>
                             ) : isUnlocked ? (
                                 <button onClick={() => equipSkin(skin.id)} className="w-full py-2 rounded-lg bg-white text-black font-bold text-sm">EQUIP</button>
                             ) : (
                                 <button 
                                    onClick={() => buySkin(skin)}
                                    disabled={gameState.shards < skin.cost} 
                                    className={`w-full py-2 rounded-lg font-bold text-sm ${gameState.shards >= skin.cost ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-500'}`}
                                 >
                                     BUY ({skin.cost} 💎)
                                 </button>
                             )}
                         </div>
                     );
                 })}
             </div>
         </div>
      )}

      {/* Game Over UI */}
      {screen === "GameOver" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm z-20 text-white animation-fadein">
              <h2 className="text-red-500 font-black text-4xl mb-2 tracking-widest">TIMELINE COLLAPSED</h2>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-xs text-center mb-8">
                  <div className="text-gray-400 mb-1">SCORE</div>
                  <div className="text-5xl font-bold mb-6">{currentScore}</div>
                  
                  <div className="text-gray-400 mb-1">SHARDS COLLECTED</div>
                  <div className="text-2xl text-yellow-400 font-bold mb-2">+ {sessionShards} 💎</div>
              </div>

              <button 
                onClick={handleStart}
                className="w-full max-w-xs py-4 mb-4 rounded-full font-bold text-lg bg-cyan-400 text-black active:scale-95 transition-transform"
              >
                  RUN AGAIN
              </button>
              <button 
                onClick={() => setScreen("Start")}
                className="w-full max-w-xs py-3 rounded-full font-bold text-sm border border-white/20"
              >
                  MAIN MENU
              </button>
          </div>
      )}

      {/* Playing HUD overlay */}
      {screen === "Playing" && (
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-start pointer-events-none z-10 text-white drop-shadow-md">
              <div className="text-xl font-black bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">{currentScore}M</div>
              <div className="text-lg font-bold text-yellow-400 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">💎 {sessionShards}</div>
              
              {/* Quick instructions toast could go here */}
              {currentScore < 50 && (
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center text-sm text-white/50 animate-pulse">
                      Swipe implicitly: ↔️ to switch lanes, ⬆️ to jump, ⬇️ to slide!
                  </div>
              )}
          </div>
      )}

    </main>
  );
}
