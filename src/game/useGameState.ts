import { useState, useEffect } from "react";
import { GameState, CharacterSkin } from "./types";
import { CHARACTER_SKINS } from "./constants";

const SAVE_KEY = "chronara_game_data";

const defaultState: GameState = {
  shards: 0,
  distance: 0,
  highScore: 0,
  currentEra: "Cyber",
  selectedSkinId: "default",
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(["default"]);
  const [loaded, setLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGameState((prev) => ({
          ...prev,
          shards: parsed.shards || 0,
          highScore: parsed.highScore || 0,
          selectedSkinId: parsed.selectedSkinId || "default",
        }));
        setUnlockedSkins(parsed.unlockedSkins || ["default"]);
      } catch (e) {
        console.error("Failed to parse save", e);
      }
    }
    setLoaded(true);
  }, []);

  // Save to local storage
  const saveState = (newState: GameState, newUnlocked: string[]) => {
    const dataToSave = {
      shards: newState.shards,
      highScore: newState.highScore,
      selectedSkinId: newState.selectedSkinId,
      unlockedSkins: newUnlocked,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
  };

  const addShards = (amount: number) => {
    setGameState((prev) => {
      const next = { ...prev, shards: prev.shards + amount };
      saveState(next, unlockedSkins);
      return next;
    });
  };

  const updateHighScore = (score: number) => {
    setGameState((prev) => {
      if (score > prev.highScore) {
        const next = { ...prev, highScore: score };
        saveState(next, unlockedSkins);
        return next;
      }
      return prev;
    });
  };

  const buySkin = (skin: CharacterSkin): boolean => {
    if (gameState.shards >= skin.cost && !unlockedSkins.includes(skin.id)) {
      setGameState((prev) => {
        const next = { ...prev, shards: prev.shards - skin.cost };
        const nextUnlocked = [...unlockedSkins, skin.id];
        setUnlockedSkins(nextUnlocked);
        saveState(next, nextUnlocked);
        return next;
      });
      return true;
    }
    return false;
  };

  const equipSkin = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      setGameState((prev) => {
        const next = { ...prev, selectedSkinId: skinId };
        saveState(next, unlockedSkins);
        return next;
      });
    }
  };

  return {
    gameState,
    unlockedSkins,
    loaded,
    addShards,
    updateHighScore,
    buySkin,
    equipSkin,
  };
};
