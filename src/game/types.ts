export type EraType = "Cyber" | "Ancient" | "Medieval" | "Cosmic" | "Lava";

export interface EraTheme {
  type: EraType;
  skyColor: string;
  groundColor: string;
  gridColor: string;
  obstaclePrimary: string;
  obstacleSecondary: string;
  speedMultiplier: number;
}

export type SpecialAbility =
  | "None"
  | "PhaseDash" // Invincible, passes through obstacles
  | "HyperSpeed" // Runs incredibly fast
  | "TimeFreeze" // Obstacles pause and turn grey
  | "Rewind"; // Moves backwards in time (maybe too complex, maybe just extra life)

export interface CharacterSkin {
  id: string;
  name: string;
  description: string;
  cost: number;
  unlocked: boolean;
  color: string;
  ability: SpecialAbility;
}

export interface GameState {
  shards: number;
  distance: number;
  highScore: number;
  currentEra: EraType;
  selectedSkinId: string;
}

export interface Player3D {
  x: number; // Lane: -1 (left), 0 (center), 1 (right)
  y: number; // Height: 0 is ground
  z: number; // Distance down track (not really used for player since player stays at fixed screen Z, but for logic)
  targetX: number; // For smooth lane switching
  targetY: number; // For jumping
  vy: number; // Vertical velocity
  isSliding: boolean;
  slideTimer: number;
  isDead: boolean;
  activeAbility: SpecialAbility;
  abilityTimer: number; // How long left
  abilityCooldown: number; // When 0, can use again
}

export type EntityType = "Obstacle" | "Shard" | "TimeGlitch"; // TimeGlitch causes immediate Era shift 

export interface Entity3D {
  id: string;
  x: number; // Lane
  y: number; // Height
  z: number; // Distance
  type: EntityType;
  width: number;
  height: number;
  depth: number;
  collected?: boolean;
}
