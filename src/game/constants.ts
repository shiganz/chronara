import { CharacterSkin, EraTheme, EraType } from "./types";

export const ROAD_WIDTH = 400; // Total width of 3 lanes
export const LANE_WIDTH = ROAD_WIDTH / 3;
export const CAMERA_Z = -300;
export const HORIZON_Y = 150; // Y pixel of the horizon line
export const DRAW_DISTANCE = 3000;
export const FOG_START = 1500;
export const GAME_SPEED_START = 30; // units per frame

export const ERAS: Record<EraType, EraTheme> = {
  Ancient: {
    type: "Ancient",
    skyColor: "#8b7355", // Dusty sunset
    groundColor: "#deb887", // Sand
    gridColor: "#cd853f",
    obstaclePrimary: "#8b4513", // Wood/Stone
    obstacleSecondary: "#a0522d",
    speedMultiplier: 1.0,
  },
  Medieval: {
    type: "Medieval",
    skyColor: "#4682b4", // Steel blue
    groundColor: "#556b2f", // Dark olive green
    gridColor: "#8fbc8f",
    obstaclePrimary: "#708090", // Slate grey
    obstacleSecondary: "#2f4f4f",
    speedMultiplier: 1.1,
  },
  Cyber: {
    type: "Cyber",
    skyColor: "#050510", // Very dark blue
    groundColor: "#110022", // Deep purple
    gridColor: "#ff00ff", // Neon magenta
    obstaclePrimary: "#00ffff", // Cyan
    obstacleSecondary: "#ff00aa",
    speedMultiplier: 1.3,
  },
  Lava: {
    type: "Lava",
    skyColor: "#2b0000",
    groundColor: "#4a1c1c", // Dark red rock
    gridColor: "#ff4500", // Orange red lava cracks
    obstaclePrimary: "#333333", // Obsidian
    obstacleSecondary: "#ff0000",
    speedMultiplier: 1.2,
  },
  Cosmic: {
    type: "Cosmic",
    skyColor: "#00001a", // Deep space
    groundColor: "#1a0033", // Nebula purple
    gridColor: "#8a2be2", // Blue violet
    obstaclePrimary: "#e6e6fa", // Lavender stars
    obstacleSecondary: "#fffafa", // White
    speedMultiplier: 1.4,
  },
};

export const CHARACTER_SKINS: CharacterSkin[] = [
  {
    id: "default",
    name: "Base Runner",
    description: "The original time thief.",
    cost: 0,
    unlocked: true,
    color: "#ffaa00",
    ability: "None",
  },
  {
    id: "neo",
    name: "Neo Runner",
    description: "Future hacker. Masters Phase Dash.",
    cost: 500,
    unlocked: false,
    color: "#00ffcc",
    ability: "PhaseDash",
  },
  {
    id: "ancient",
    name: "Ancient Guardian",
    description: "Tough as stone. Time Freeze ability.",
    cost: 1000,
    unlocked: false,
    color: "#a0522d",
    ability: "TimeFreeze",
  },
  {
    id: "ninja",
    name: "Cyber Ninja",
    description: "Lighning fast reflexes. Hyper Speed.",
    cost: 1500,
    unlocked: false,
    color: "#ff0055",
    ability: "HyperSpeed",
  },
  {
    id: "witch",
    name: "Time Witch",
    description: "Manipulates time. Rewinds mistakes.",
    cost: 2000,
    unlocked: false,
    color: "#9933ff",
    ability: "Rewind", // Maybe implemented as a passive auto-revive once per run
  },
];
