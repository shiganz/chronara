import * as THREE from 'three';
import { Entity3D, EraTheme, Player3D } from "./types";
import { CAMERA_Z, ROAD_WIDTH, LANE_WIDTH } from "./constants";

const PLAYER_W = 70;
const PLAYER_H = 90;   // ← much less tall, closer to a cube
const PLAYER_D = 70;

export class Renderer {
  public renderer: THREE.WebGLRenderer;
  public scene:    THREE.Scene;
  public camera:   THREE.PerspectiveCamera;

  private playerMesh:   THREE.Mesh;
  private playerGlow:   THREE.PointLight;
  private floor:        THREE.Mesh;
  private laneLines:    THREE.LineSegments;
  private gridHelper:   THREE.GridHelper;

  private entityMeshes: Map<string, THREE.Mesh> = new Map();

  private obstacleMat: THREE.MeshStandardMaterial;
  private shardMat:    THREE.MeshStandardMaterial;
  private glitchMat:   THREE.MeshStandardMaterial;

  private dirLight: THREE.DirectionalLight;
  private time = 0;

  constructor(canvas: HTMLCanvasElement, width: number, height: number) {
    // ── Renderer ────────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();

    // ── Camera ──────────────────────────────────────────────────────────────
    // Pull back and up so the player is framed nicely in the lower-center
    this.camera = new THREE.PerspectiveCamera(55, width / height, 1, 8000);
    this.camera.position.set(0, 220, CAMERA_Z - 80);
    this.camera.lookAt(0, 30, 500);

    // ── Lighting ────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.dirLight.position.set(300, 600, -300);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.set(1024, 1024);
    this.scene.add(this.dirLight);

    // Rim / fill light from behind the camera
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
    fillLight.position.set(-200, 100, -600);
    this.scene.add(fillLight);

    // ── Floor ────────────────────────────────────────────────────────────────
    const floorGeom = new THREE.PlaneGeometry(10000, 10000);
    floorGeom.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
    this.floor = new THREE.Mesh(floorGeom, floorMat);
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    // ── Lane dividers (3 vertical lines) ────────────────────────────────────
    const laneLineGeom = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (let i = -1; i <= 1; i++) {  // -1, 0, 1 dividers between lanes
      const x = i * LANE_WIDTH;
      pts.push(x, 2, -5000,  x, 2, 5000);
    }
    laneLineGeom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const laneLineMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 });
    this.laneLines = new THREE.LineSegments(laneLineGeom, laneLineMat);
    this.scene.add(this.laneLines);

    // ── Grid ────────────────────────────────────────────────────────────────
    this.gridHelper = new THREE.GridHelper(ROAD_WIDTH * 8, 60, 0xff00ff, 0xff00ff);
    this.gridHelper.position.y = 1;
    (this.gridHelper.material as THREE.LineBasicMaterial).transparent = true;
    (this.gridHelper.material as THREE.LineBasicMaterial).opacity = 0.25;
    this.scene.add(this.gridHelper);

    // ── Player Box ──────────────────────────────────────────────────────────
    const playerGeom = new THREE.BoxGeometry(PLAYER_W, PLAYER_H, PLAYER_D);
    playerGeom.translate(0, PLAYER_H / 2, 0); // pivot at base
    const playerMat = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      roughness: 0.35,
      metalness: 0.25,
      emissive: 0xff6600,
      emissiveIntensity: 0.15,
    });
    this.playerMesh = new THREE.Mesh(playerGeom, playerMat);
    this.playerMesh.castShadow = true;
    this.scene.add(this.playerMesh);

    // Subtle point light attached to player for a "glow" feel
    this.playerGlow = new THREE.PointLight(0xffaa44, 1.5, 250);
    this.playerGlow.position.set(0, 60, 0);
    this.playerMesh.add(this.playerGlow);

    // ── Fog ─────────────────────────────────────────────────────────────────
    this.scene.fog = new THREE.Fog(0x000000, 1500, 5000);

    // ── Entity Materials ────────────────────────────────────────────────────
    this.obstacleMat = new THREE.MeshStandardMaterial({
      color: 0xff2222,
      roughness: 0.3,
      metalness: 0.5,
      emissive: 0x880000,
      emissiveIntensity: 0.3,
    });
    this.shardMat = new THREE.MeshStandardMaterial({
      color: 0xffe040,
      emissive: 0xffaa00,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8,
    });
    this.glitchMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x88ffff,
      emissiveIntensity: 1.2,
      transparent: true,
      opacity: 0.65,
      roughness: 0.0,
    });
  }

  // ── Theme ──────────────────────────────────────────────────────────────────
  public updateTheme(theme: EraTheme) {
    this.scene.background = new THREE.Color(theme.skyColor);
    (this.floor.material as THREE.MeshStandardMaterial).color.set(theme.groundColor);
    if (this.scene.fog) (this.scene.fog as THREE.Fog).color.set(theme.skyColor);

    // Rebuild grid with era colour
    this.scene.remove(this.gridHelper);
    this.gridHelper.dispose();
    this.gridHelper = new THREE.GridHelper(ROAD_WIDTH * 8, 60, theme.gridColor, theme.gridColor);
    this.gridHelper.position.y = 1;
    (this.gridHelper.material as THREE.LineBasicMaterial).transparent = true;
    (this.gridHelper.material as THREE.LineBasicMaterial).opacity = 0.25;
    this.scene.add(this.gridHelper);

    // Update lane line colour
    (this.laneLines.material as THREE.LineBasicMaterial).color.set(theme.gridColor);

    this.obstacleMat.color.set(theme.obstaclePrimary);
    this.obstacleMat.emissive.set(theme.obstacleSecondary);
    this.obstacleMat.emissiveIntensity = 0.3;
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  public updatePlayer(player: Player3D, skinColor: string, isFrozen: boolean) {
    this.time++;
    this.playerMesh.position.set(player.x, player.y, player.z);

    const mat = this.playerMesh.material as THREE.MeshStandardMaterial;
    mat.color.set(skinColor);

    // Tiny idle bob when on ground
    if (player.y === 0 && !player.isSliding) {
      this.playerMesh.position.y += Math.sin(this.time * 0.08) * 1.5;
    }

    // Squash & stretch on landing is implicit via slide scale
    if (player.isSliding) {
      this.playerMesh.scale.set(1.3, 0.45, 1.3); // squash wide when sliding
    } else {
      this.playerMesh.scale.set(1, 1, 1);
    }

    // Tilt forward slightly while running
    this.playerMesh.rotation.x = player.isSliding ? 0 : -0.08;

    // Lean into lane switch direction
    const leanTarget = (player.targetX * LANE_WIDTH - player.x) * 0.005;
    this.playerMesh.rotation.z = THREE.MathUtils.lerp(this.playerMesh.rotation.z, leanTarget, 0.15);

    // Abilities
    if (player.activeAbility === "PhaseDash") {
      mat.transparent = true;
      mat.opacity = 0.4;
      mat.emissiveIntensity = 0.8;
      this.playerGlow.color.set(0x00ffff);
      this.playerGlow.intensity = 3;
    } else if (player.activeAbility === "TimeFreeze") {
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.emissiveIntensity = 0.6;
      this.playerGlow.color.set(0xaaddff);
      this.playerGlow.intensity = 2;
    } else {
      mat.transparent = false;
      mat.opacity = 1.0;
      mat.emissiveIntensity = 0.15;
      this.playerGlow.color.set(0xffaa44);
      this.playerGlow.intensity = 1.5;
    }

    this.dirLight.intensity = isFrozen ? 0.25 : 1.2;
  }

  // ── Camera & World ─────────────────────────────────────────────────────────
  public updateCameraAndGrid(zOffset: number) {
    this.camera.position.z = zOffset + CAMERA_Z - 80;
    this.floor.position.z = zOffset;
    this.laneLines.position.z = zOffset;

    // Camera looks at a point ahead of the player, subtly lower than horizon
    this.camera.lookAt(0, 30, zOffset + 500);

    const interval = 200;
    this.gridHelper.position.z = zOffset - (zOffset % interval);
  }

  // ── Entities ───────────────────────────────────────────────────────────────
  public updateEntities(entities: Entity3D[]) {
    const activeIds = new Set<string>();

    for (const entity of entities) {
      activeIds.add(entity.id);

      let mesh = this.entityMeshes.get(entity.id);
      if (!mesh) {
        let geom: THREE.BufferGeometry;
        let mat: THREE.Material;

        if (entity.type === "Obstacle") {
          geom = new THREE.BoxGeometry(entity.width * 0.9, entity.height, entity.depth * 2);
          geom.translate(0, entity.height / 2, 0);
          mat = this.obstacleMat;
        } else if (entity.type === "Shard") {
          geom = new THREE.OctahedronGeometry(28);
          mat = this.shardMat;
        } else {
          geom = new THREE.SphereGeometry(32, 20, 20);
          mat = this.glitchMat;
        }

        mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        this.scene.add(mesh);
        this.entityMeshes.set(entity.id, mesh);
      }

      if (entity.type === "Obstacle") {
        mesh.position.set(entity.x, entity.y, entity.z);
      } else {
        const idHash = entity.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const hover = Math.sin(Date.now() / 350 + idHash) * 6 + entity.y + 40;
        mesh.position.set(entity.x, hover, entity.z);
        mesh.rotation.y += entity.type === "Shard" ? 0.06 : 0.03;
        mesh.rotation.x += 0.015;
      }
    }

    // Dispose removed entities
    for (const [id, mesh] of Array.from(this.entityMeshes.entries())) {
      if (!activeIds.has(id)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        this.entityMeshes.delete(id);
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  public render() {
    this.renderer.render(this.scene, this.camera);
  }
}
