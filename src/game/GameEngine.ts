import { InputManager } from "./InputManager";
import { Renderer } from "./Renderer";
import {
  CHARACTER_SKINS,
  ERAS,
  GAME_SPEED_START,
  LANE_WIDTH,
} from "./constants";
import { EraType, GameState, Player3D, Entity3D, EntityType } from "./types";
import { playSound } from "./audio";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private input: InputManager;
  private renderer: Renderer;
  private animationId: number = 0;

  // Game Data
  private player: Player3D;
  private entities: Entity3D[] = [];
  private speed: number = GAME_SPEED_START;
  private zOffset: number = 0; // Camera z
  public distance: number = 0;
  public score: number = 0;
  
  // State from outside
  private gameState: GameState;
  private onGameOver: (score: number, shards: number) => void;
  private onScoreUpdate: (score: number) => void;
  private onShardUpdate: (shards: number) => void;
  private shardsCollectedSession: number = 0;

  // Timers
  private eraTimer: number = 0;
  private spawnTimer: number = 0;
  private _lastEra: EraType | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    initialState: GameState,
    onGameOver: (score: number, shards: number) => void,
    onScoreUpdate: (score: number) => void,
    onShardUpdate: (shards: number) => void
  ) {
    this.canvas = canvas;
    this.input = new InputManager(canvas);
    this.renderer = new Renderer(canvas, canvas.width, canvas.height);
    this.gameState = { ...initialState };
    this.onGameOver = onGameOver;
    this.onScoreUpdate = onScoreUpdate;
    this.onShardUpdate = onShardUpdate;

    this.player = {
      x: 0,
      y: 0,
      z: 150, // Fixed distance from camera (camera follows zOffset)
      targetX: 0,
      targetY: 0,
      vy: 0,
      isSliding: false,
      slideTimer: 0,
      isDead: false,
      activeAbility: "None",
      abilityTimer: 0,
      abilityCooldown: 0,
    };
  }

  public start() {
    this.spawnTimer = 0;
    this.eraTimer = 0;
    this.entities = [];
    this.distance = 0;
    this.score = 0;
    this.speed = GAME_SPEED_START;
    this.shardsCollectedSession = 0;
    this.player.isDead = false;
    
    // Initial spawn
    for(let i = 0; i < 5; i++) {
        this.spawnEntity(1000 + i * 800);
    }

    this.loop();
  }

  public stop() {
    cancelAnimationFrame(this.animationId);
    this.input.destroy();
  }

  private triggerEraShift() {
    playSound("eraShift");
    const eras: EraType[] = ["Ancient", "Medieval", "Cyber", "Lava", "Cosmic"];
    let nextEra = eras[Math.floor(Math.random() * eras.length)];
    while (nextEra === this.gameState.currentEra) {
        nextEra = eras[Math.floor(Math.random() * eras.length)];
    }
    this.gameState.currentEra = nextEra;
    this.eraTimer = 0;
    // Brief speed boost on era shift to make it feel impactful
    this.speed += 2;
  }

  private useAbility() {
      const activeSkin = CHARACTER_SKINS.find(s => s.id === this.gameState.selectedSkinId);
      if (!activeSkin || activeSkin.ability === "None") return;

      if (this.player.abilityCooldown <= 0 && this.player.activeAbility === "None") {
          playSound("eraShift");
          this.player.activeAbility = activeSkin.ability;
          this.player.abilityTimer = 180; // 3 seconds at 60fps
          this.player.abilityCooldown = 600; // 10 seconds cooldown
      }
  }

  private handleInput() {
    // Ability trigger (Double tap up perhaps? Or a dedicated button? For now let's map it to an event or wait for UI.
    // Let's implement ability trigger when user double taps screen, roughly check by triggering if already jumping)
    if (this.input.swipeUp && this.player.y > 0) {
        this.useAbility();
    }

    // Lane switching
    if (this.input.swipeLeft && this.player.targetX > -1) {
      this.player.targetX -= 1;
      playSound("jump");
    } else if (this.input.swipeRight && this.player.targetX < 1) {
      this.player.targetX += 1;
      playSound("jump");
    }

    // Jump
    if (this.input.swipeUp && this.player.y === 0 && !this.player.isSliding) {
      this.player.vy = 25; // Initial jump velocity
      playSound("jump");
    }

    // Slide
    if (this.input.swipeDown && this.player.y === 0) {
      this.player.isSliding = true;
      this.player.slideTimer = 30; // 0.5 seconds at 60fps
    }

    this.input.clearInputs();
  }

  private spawnEntity(zPos: number) {
      const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
      const rand = Math.random();

      let type: EntityType = "Obstacle";
      if (rand > 0.95) type = "TimeGlitch";
      else if (rand > 0.7) type = "Shard";

      // Calculate width/height based on type
      let w = 80;
      let h = 80;

      if (type === "Obstacle") {
          // 50% chance for a low sliding obstacle vs high jumping obstacle
          if (Math.random() > 0.5) {
              h = 60; // duck under this
          } else {
              h = 100; // jump over this
          }
      }

      this.entities.push({
          id: Math.random().toString(36).substring(7),
          x: lane * LANE_WIDTH,
          y: type === "Obstacle" ? 0 : 50, // Shards and glitches hover
          z: zPos,
          type,
          width: w,
          height: h,
          depth: 20
      });
  }

  private update() {
    if (this.player.isDead) return;

    const theme = ERAS[this.gameState.currentEra];
    const frameSpeed = this.speed * theme.speedMultiplier;

    // 1. Advance World
    this.zOffset += frameSpeed;
    this.distance += frameSpeed / 100;
    
    // Score update (every 10 points)
    if (Math.floor(this.distance) > this.score) {
        this.score = Math.floor(this.distance);
        if (this.score % 10 === 0) {
            this.onScoreUpdate(this.score);
        }
    }

    // 2. Timeline Shifts
    this.eraTimer++;
    if (this.eraTimer > 1800) { // Approx 30 seconds
        this.triggerEraShift();
    }

    // 3. Spawning
    this.spawnTimer++;
    if (this.spawnTimer > 40) { // Every 40 frames
        this.spawnEntity(this.zOffset + 3000); // spawn far ahead
        this.spawnTimer = 0;
    }

    // 4. Update Player Physics
    this.handleInput();

    // Smooth lane transition
    this.player.x += (this.player.targetX * LANE_WIDTH - this.player.x) * 0.2;

    // Gravity & Jump
    if (this.player.y > 0 || this.player.vy !== 0) {
        this.player.y += this.player.vy;
        this.player.vy -= 1.5; // Gravity
        if (this.player.y <= 0) {
            this.player.y = 0;
            this.player.vy = 0;
        }
    }

    // Slide timer
    if (this.player.isSliding) {
        this.player.slideTimer--;
        if (this.player.slideTimer <= 0) {
            this.player.isSliding = false;
        }
    }

    // Ability timers
    if (this.player.abilityTimer > 0) {
        this.player.abilityTimer--;
        if (this.player.abilityTimer <= 0) {
            this.player.activeAbility = "None";
        }
    }
    if (this.player.abilityCooldown > 0) {
        this.player.abilityCooldown--;
    }

    // 5. Update Entities & Collisions
    for (let i = this.entities.length - 1; i >= 0; i--) {
        const entity = this.entities[i];
        
        // Remove entities behind camera
        if (entity.z < this.zOffset - 200) {
            this.entities.splice(i, 1);
            continue;
        }

        // Relative Z distance from player
        const relZ = entity.z - (this.zOffset + 150); // Player is at offset + 150 basically
        const isCloseZ = relZ > -50 && relZ < 50;

        // Collision logic
        if (!entity.collected && isCloseZ) {
            // Check X bounds (Wait, they are on a fixed lane grid basically)
            const laneDiff = Math.abs(entity.x - this.player.targetX * LANE_WIDTH);
            if (laneDiff < 50) { // Within 50 units X 
                
                // Y Bounds
                let hitY = false;
                
                if (entity.type === "Obstacle") {
                    // Jump over low obstacles (height 60), Duck under high obstacles (height 100)
                    if (entity.height > 80) { // High obstacle
                         if (!this.player.isSliding) { hitY = true; } // Hit your head if you don't slide
                    } else { // Low obstacle
                         if (this.player.y < entity.height) { hitY = true; } // Hit your feet if you don't jump
                    }
                } else {
                    hitY = true; // Items can be collected anytime in same lane usually, or might require jump. We'll be forgiving.
                }

                if (hitY) {
                    if (entity.type === "Obstacle") {
                        if (this.player.activeAbility === "PhaseDash") {
                            // Phased right through
                        } else {
                            // Player hit
                            playSound("hit");
                            this.player.isDead = true;
                            this.onGameOver(this.score, this.shardsCollectedSession);
                        }
                    } else if (entity.type === "Shard") {
                        entity.collected = true;
                        this.shardsCollectedSession++;
                        playSound("collect");
                        this.onShardUpdate(this.shardsCollectedSession);
                    } else if (entity.type === "TimeGlitch") {
                        entity.collected = true;
                        this.triggerEraShift();
                    }
                }
            }
        }
    }

    // Remove collected items
    this.entities = this.entities.filter(e => !e.collected);
  }

  private draw() {
    const theme = ERAS[this.gameState.currentEra];
    
    if (this._lastEra !== this.gameState.currentEra) {
        this.renderer.updateTheme(theme);
        this._lastEra = this.gameState.currentEra;
    }

    this.renderer.updateCameraAndGrid(this.zOffset);

    // Draw Player
    const activeSkinColor = CHARACTER_SKINS.find(s => s.id === this.gameState.selectedSkinId)?.color || "#ffaa00";
    
    // Convert to absolute z for Three.js
    const renderPlayer = { ...this.player, z: this.zOffset + 150 }; 
    const isFrozen = this.player.activeAbility === "TimeFreeze";
    this.renderer.updatePlayer(renderPlayer, activeSkinColor, isFrozen);

    this.renderer.updateEntities(this.entities);

    this.renderer.render();
  }

  private loop = () => {
    this.update();
    this.draw();
    if (!this.player.isDead) {
      this.animationId = requestAnimationFrame(this.loop);
    }
  };
}
