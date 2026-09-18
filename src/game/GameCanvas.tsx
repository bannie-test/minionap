import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, FastForward, Backpack, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Collectible, Puzzle } from '../types';
import { gameCollectibles, gamePuzzles, fourSeasons } from '../config/weddingData';
import { soundManager } from '../audio/soundManager';
import { MobileControls } from './MobileControls';

interface GameCanvasProps {
  currentWorld: number;
  playerName: string;
  isSpecialMember?: boolean;
  isPaused?: boolean;
  continuePathTrigger?: number;
  collectedIds: string[];
  solvedPuzzleIds: string[];
  onCollectItem: (item: Collectible) => void;
  onOpenPuzzle: (puzzle: Puzzle) => void;
  onReachGate: () => void;
  onSwitchWorld: (world: number, spawnX?: number) => void;
  onOpenInventory: () => void;
  onOpenSkipModal: () => void;
  onChangeName?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: 'snow' | 'petal' | 'sparkle' | 'leaf';
  color: string;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentWorld,
  playerName,
  isSpecialMember = false,
  isPaused = false,
  continuePathTrigger = 0,
  collectedIds,
  solvedPuzzleIds,
  onCollectItem,
  onOpenPuzzle,
  onReachGate,
  onSwitchWorld,
  onOpenInventory,
  onOpenSkipModal,
  onChangeName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction prompt state
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [canInteract, setCanInteract] = useState<boolean>(false);

  // Input states
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean; interact: boolean }>({
    left: false,
    right: false,
    jump: false,
    interact: false
  });

  // Track desired spawn position if traveling between gates
  const spawnXRef = useRef<number | null>(null);
  const activeWorldRef = useRef<number | null>(null);

  // Keep references to collectedIds and solvedPuzzleIds so initWorld doesn't recreate every time they change
  const collectedIdsRef = useRef(collectedIds);
  collectedIdsRef.current = collectedIds;
  const solvedPuzzleIdsRef = useRef(solvedPuzzleIds);
  solvedPuzzleIdsRef.current = solvedPuzzleIds;

  // When gift is collected or quiz is solved, smoothly continue character along path from their current position
  useEffect(() => {
    if (continuePathTrigger && continuePathTrigger > 0) {
      const p = stateRef.current.player;
      p.vx = 3.5;
      p.facing = 'right';
      p.state = 'walk';
      p.stateTimer = 25;
      keysRef.current.interact = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.jump = false;
    }
  }, [continuePathTrigger]);

  // Game internal state
  const stateRef = useRef({
    player: {
      x: 140,
      y: 400,
      vx: 0,
      vy: 0,
      width: 38,
      height: 52,
      facing: 'right' as 'left' | 'right',
      isGrounded: false,
      state: 'idle' as 'idle' | 'walk' | 'jump' | 'hit' | 'cheer',
      stateTimer: 0,
      blinkTimer: 0,
      invulnerableTimer: 0
    },
    camera: { x: 0, y: 0, targetX: 0 },
    worldWidth: 1600,
    worldHeight: 600,
    obstacles: [] as Array<{ x: number; y: number; width: number; height: number; type: string; vx: number; minX: number; maxX: number }>,
    platforms: [] as Array<{ x: number; y: number; width: number; height: number; type: string }>,
    jumpPads: [] as Array<{ x: number; y: number; width: number; height: number; type: string; bounceTimer: number }>,
    collectibles: [] as Array<{ id: string; x: number; y: number; icon: string; collected: boolean; floatPhase: number }>,
    puzzleCheckpoints: [] as Array<{ id: string; x: number; y: number; numberLabel: number; solved: boolean }>,
    returnGate: { x: 80, y: 360, width: 60, height: 140, targetWorld: 0, label: '' },
    forwardGate: { x: 1450, y: 350, width: 70, height: 150, isWeddingGate: false, targetWorld: 0, label: '' },
    particles: [] as Particle[],
    weatherParticles: [] as WeatherParticle[],
    clouds: [] as Array<{ x: number; y: number; speed: number; scale: number }>
  });

  // Initialize World Geometry & Entities for each of the 4 Seasons
  const initWorld = useCallback((worldNum: number, initialX?: number) => {
    const s = stateRef.current;
    const isDifferentWorld = activeWorldRef.current !== worldNum;
    activeWorldRef.current = worldNum;

    // Only set player position when entering a new world or when explicit coordinates are requested
    if (initialX !== undefined) {
      s.player.x = initialX;
      s.player.y = 500 - s.player.height;
      s.player.vx = 0;
      s.player.vy = 0;
      s.player.isGrounded = true;
      s.player.state = 'idle';
      s.camera.x = Math.max(0, s.player.x - 300);
    } else if (spawnXRef.current !== null) {
      s.player.x = spawnXRef.current;
      spawnXRef.current = null;
      s.player.y = 500 - s.player.height;
      s.player.vx = 0;
      s.player.vy = 0;
      s.player.isGrounded = true;
      s.player.state = 'idle';
      s.camera.x = Math.max(0, s.player.x - 300);
    } else if (isDifferentWorld) {
      // Brand new world transition: spawn at entrance
      s.player.x = 140;
      s.player.y = 500 - s.player.height;
      s.player.vx = 0;
      s.player.vy = 0;
      s.player.isGrounded = true;
      s.player.state = 'idle';
      s.camera.x = 0;
    }
    // CRUCIAL: If worldNum is the same world, preserve s.player.x, s.player.y, and camera exactly where they are!

    // Background clouds
    s.clouds = [
      { x: 100, y: 50, speed: 0.2, scale: 1 },
      { x: 480, y: 90, speed: 0.15, scale: 0.8 },
      { x: 920, y: 60, speed: 0.25, scale: 1.2 },
      { x: 1350, y: 110, speed: 0.18, scale: 0.9 }
    ];

    // Platforms: Solid ground spans across and beyond the entire 1600px world
    s.platforms = [
      { x: -300, y: 500, width: 2400, height: 160, type: 'ground' },
      // Stone garden threshold terrace in front of the forward Garden Gate
      { x: 1390, y: 492, width: 180, height: 16, type: 'garden_terrace' }
    ];

    // Seed Weather Particles (Snow, Petals, Sparkles, Leaves)
    s.weatherParticles = [];
    const pCount = 35;
    for (let i = 0; i < pCount; i++) {
      if (worldNum === 1) {
        // Winter Snowflakes
        s.weatherParticles.push({
          x: Math.random() * s.worldWidth,
          y: Math.random() * 500,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 0.8 + Math.random() * 1.2,
          size: 2 + Math.random() * 3,
          alpha: 0.6 + Math.random() * 0.4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.01,
          type: 'snow',
          color: '#ffffff'
        });
      } else if (worldNum === 2) {
        // Spring Cherry Blossom Petals
        s.weatherParticles.push({
          x: Math.random() * s.worldWidth,
          y: Math.random() * 500,
          vx: 0.8 + Math.random() * 1.2,
          vy: 0.6 + Math.random() * 0.8,
          size: 4 + Math.random() * 4,
          alpha: 0.7 + Math.random() * 0.3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.03,
          type: 'petal',
          color: '#fbcfe8'
        });
      } else if (worldNum === 3) {
        // Summer Golden Sparkles / Fireflies
        s.weatherParticles.push({
          x: Math.random() * s.worldWidth,
          y: Math.random() * 500,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.4 - Math.random() * 0.8,
          size: 2.5 + Math.random() * 3,
          alpha: 0.5 + Math.random() * 0.5,
          rotation: 0,
          rotationSpeed: 0,
          type: 'sparkle',
          color: '#fef08a'
        });
      } else {
        // Autumn Golden Maple Leaves
        s.weatherParticles.push({
          x: Math.random() * s.worldWidth,
          y: Math.random() * 500,
          vx: 1 + Math.random() * 1.5,
          vy: 0.9 + Math.random() * 1.1,
          size: 5 + Math.random() * 4,
          alpha: 0.8 + Math.random() * 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: 0.04,
          type: 'leaf',
          color: Math.random() > 0.5 ? '#f97316' : '#ea580c'
        });
      }
    }

    if (worldNum === 1) {
      // ═══════════════════════════════════════════════════════════════
      // WORLD 1: WINTER WONDERLAND (Frost & Snow)
      // ═══════════════════════════════════════════════════════════════
      s.platforms.push(
        { x: 300, y: 410, width: 140, height: 22, type: 'ice' },
        { x: 520, y: 330, width: 150, height: 22, type: 'ice' },
        { x: 760, y: 390, width: 130, height: 22, type: 'ice' },
        { x: 960, y: 320, width: 160, height: 22, type: 'ice' },
        { x: 1220, y: 400, width: 130, height: 22, type: 'ice' }
      );

      // Playful Snowman / Frost Critters
      s.obstacles = [
        { x: 440, y: 474, width: 34, height: 26, type: 'snowcritter', vx: 0.7, minX: 380, maxX: 560 },
        { x: 880, y: 474, width: 34, height: 26, type: 'snowcritter', vx: -0.7, minX: 820, maxX: 1000 }
      ];

      // Mechanical Snow Pump Jump Pads in Winter
      s.jumpPads = [
        { x: 450, y: 480, width: 46, height: 22, type: 'snow_pump', bounceTimer: 0 },
        { x: 880, y: 480, width: 46, height: 22, type: 'snow_pump', bounceTimer: 0 }
      ];

      // Collectibles in Winter
      s.collectibles = [
        { id: 'col_winter_cocoa', x: 370, y: 360, icon: '☕', collected: collectedIdsRef.current.includes('col_winter_cocoa'), floatPhase: 0 },
        { id: 'col_winter_crystal', x: 1040, y: 270, icon: '❄️', collected: collectedIdsRef.current.includes('col_winter_crystal'), floatPhase: 1 }
      ];

      // 2 Easy Quizzes in World 1
      s.puzzleCheckpoints = [
        { id: 'puz_winter_1', x: 595, y: 420, numberLabel: 1, solved: solvedPuzzleIdsRef.current.includes('puz_winter_1') },
        { id: 'puz_winter_2', x: 1140, y: 420, numberLabel: 2, solved: solvedPuzzleIdsRef.current.includes('puz_winter_2') }
      ];

      // Gates: Left is Start; Right leads to Garden Gate
      s.returnGate = { x: 70, y: 340, width: 70, height: 160, targetWorld: 1, label: '🌿 Garden Gate' };
      s.forwardGate = { x: 1450, y: 340, width: 84, height: 160, isWeddingGate: false, targetWorld: 2, label: '🌿 Garden Gate' };

    } else if (worldNum === 2) {
      // ═══════════════════════════════════════════════════════════════
      // WORLD 2: SPRING BLOSSOM MEADOW (Sakura & Greenery)
      // ═══════════════════════════════════════════════════════════════
      s.platforms.push(
        { x: 260, y: 420, width: 130, height: 22, type: 'blossom' },
        { x: 470, y: 330, width: 140, height: 22, type: 'blossom' },
        { x: 710, y: 380, width: 120, height: 22, type: 'blossom' },
        { x: 920, y: 290, width: 150, height: 22, type: 'blossom' },
        { x: 1160, y: 380, width: 140, height: 22, type: 'blossom' }
      );

      // Playful Garden Snails
      s.obstacles = [
        { x: 400, y: 474, width: 36, height: 26, type: 'snail', vx: 0.9, minX: 350, maxX: 500 },
        { x: 860, y: 474, width: 36, height: 26, type: 'snail', vx: -0.8, minX: 800, maxX: 950 },
        { x: 1260, y: 474, width: 36, height: 26, type: 'snail', vx: 0.8, minX: 1200, maxX: 1340 }
      ];

      // Bouncy Pink Flower Mushroom Pads
      s.jumpPads = [
        { x: 420, y: 480, width: 44, height: 20, type: 'spring_flower', bounceTimer: 0 },
        { x: 850, y: 480, width: 44, height: 20, type: 'spring_flower', bounceTimer: 0 }
      ];

      // Collectibles in Spring
      s.collectibles = [
        { id: 'col_spring_blossom', x: 540, y: 280, icon: '🌸', collected: collectedIdsRef.current.includes('col_spring_blossom'), floatPhase: 0.5 },
        { id: 'col_spring_polaroid', x: 990, y: 240, icon: '📷', collected: collectedIdsRef.current.includes('col_spring_polaroid'), floatPhase: 1.2 }
      ];

      // 2 Easy Quizzes in World 2
      s.puzzleCheckpoints = [
        { id: 'puz_spring_1', x: 540, y: 420, numberLabel: 1, solved: solvedPuzzleIdsRef.current.includes('puz_spring_1') },
        { id: 'puz_spring_2', x: 1100, y: 420, numberLabel: 2, solved: solvedPuzzleIdsRef.current.includes('puz_spring_2') }
      ];

      // Gates: Garden Gates for seamless seasonal transitions
      s.returnGate = { x: 70, y: 340, width: 70, height: 160, targetWorld: 1, label: '🌿 Garden Gate' };
      s.forwardGate = { x: 1450, y: 340, width: 84, height: 160, isWeddingGate: false, targetWorld: 3, label: '🌿 Garden Gate' };

    } else if (worldNum === 3) {
      // ═══════════════════════════════════════════════════════════════
      // WORLD 3: SUMMER GOLDEN COAST (Grassy Steps & Fire Net)
      // ═══════════════════════════════════════════════════════════════
      // Redesigned: More grassy ladder steps in summer!
      s.platforms.push(
        { x: 280, y: 410, width: 130, height: 22, type: 'grassy_summer' },
        { x: 490, y: 320, width: 140, height: 22, type: 'grassy_summer' },
        { x: 730, y: 390, width: 120, height: 22, type: 'grassy_summer' },
        { x: 950, y: 280, width: 160, height: 22, type: 'grassy_summer' },
        { x: 1200, y: 390, width: 130, height: 22, type: 'grassy_summer' }
      );

      // Playful beach crabs / cheerful summer critters
      s.obstacles = [
        { x: 420, y: 474, width: 34, height: 26, type: 'crab', vx: 1.0, minX: 370, maxX: 530 },
        { x: 860, y: 474, width: 34, height: 26, type: 'crab', vx: -1.0, minX: 800, maxX: 960 }
      ];

      // Redesigned: Fire Net Trampoline Jump Pads in Summer!
      s.jumpPads = [
        { x: 430, y: 480, width: 48, height: 22, type: 'fire_net', bounceTimer: 0 },
        { x: 890, y: 480, width: 48, height: 22, type: 'fire_net', bounceTimer: 0 }
      ];

      // Collectibles in Summer
      s.collectibles = [
        { id: 'col_summer_shades', x: 560, y: 270, icon: '🕶️', collected: collectedIdsRef.current.includes('col_summer_shades'), floatPhase: 0.3 },
        { id: 'col_summer_ring', x: 1030, y: 230, icon: '💍', collected: collectedIdsRef.current.includes('col_summer_ring'), floatPhase: 0.9 }
      ];

      // 2 Easy Quizzes in World 3
      s.puzzleCheckpoints = [
        { id: 'puz_summer_1', x: 550, y: 420, numberLabel: 1, solved: solvedPuzzleIdsRef.current.includes('puz_summer_1') },
        { id: 'puz_summer_2', x: 1100, y: 420, numberLabel: 2, solved: solvedPuzzleIdsRef.current.includes('puz_summer_2') }
      ];

      // Gates: Garden Gates with seasonal flowers
      s.returnGate = { x: 70, y: 340, width: 70, height: 160, targetWorld: 2, label: '🌿 Garden Gate' };
      s.forwardGate = { x: 1450, y: 340, width: 84, height: 160, isWeddingGate: false, targetWorld: 4, label: '🌿 Garden Gate' };

    } else {
      // ═══════════════════════════════════════════════════════════════
      // WORLD 4: AUTUMN HARVEST WOODS -> GRAND WEDDING GATE!
      // ═══════════════════════════════════════════════════════════════
      // Redesigned: Ladder steps look like sculpted Autumn Leaves!
      s.platforms.push(
        { x: 260, y: 410, width: 130, height: 24, type: 'leaf' },
        { x: 470, y: 320, width: 140, height: 24, type: 'leaf' },
        { x: 720, y: 390, width: 130, height: 24, type: 'leaf' },
        { x: 940, y: 290, width: 160, height: 24, type: 'leaf' },
        { x: 1180, y: 380, width: 140, height: 24, type: 'leaf' }
      );

      // Playful woodland hedgehogs
      s.obstacles = [
        { x: 380, y: 474, width: 34, height: 26, type: 'hedgehog', vx: 1.0, minX: 330, maxX: 480 },
        { x: 820, y: 474, width: 34, height: 26, type: 'hedgehog', vx: -1.0, minX: 760, maxX: 920 }
      ];

      // Bouncy Autumn Pumpkin Jump Pads
      s.jumpPads = [
        { x: 420, y: 480, width: 44, height: 20, type: 'pumpkin', bounceTimer: 0 },
        { x: 880, y: 480, width: 44, height: 20, type: 'pumpkin', bounceTimer: 0 }
      ];

      // Collectibles in Autumn
      s.collectibles = [
        { id: 'col_autumn_wine', x: 540, y: 270, icon: '🍷', collected: collectedIdsRef.current.includes('col_autumn_wine'), floatPhase: 0.4 },
        { id: 'col_autumn_scroll', x: 1020, y: 240, icon: '💌', collected: collectedIdsRef.current.includes('col_autumn_scroll'), floatPhase: 0.8 }
      ];

      // 2 Easy Quizzes in World 4
      s.puzzleCheckpoints = [
        { id: 'puz_autumn_1', x: 530, y: 420, numberLabel: 1, solved: solvedPuzzleIdsRef.current.includes('puz_autumn_1') },
        { id: 'puz_autumn_2', x: 1080, y: 420, numberLabel: 2, solved: solvedPuzzleIdsRef.current.includes('puz_autumn_2') }
      ];

      // Gates: Left goes BACK to World 3; Right is THE GRAND WEDDING GATE!
      s.returnGate = { x: 70, y: 340, width: 70, height: 160, targetWorld: 3, label: '🌿 Garden Gate' };
      // THE WEDDING GATE
      s.forwardGate = { x: 1390, y: 270, width: 130, height: 230, isWeddingGate: true, targetWorld: 0, label: '💒 Grand Wedding Gate' };
    }
  }, []);

  useEffect(() => {
    if (activeWorldRef.current !== currentWorld) {
      initWorld(currentWorld);
    }
  }, [currentWorld, initWorld]);

  // Synchronize collected status of collectibles on-the-fly without resetting player position
  useEffect(() => {
    const s = stateRef.current;
    s.collectibles.forEach((c) => {
      c.collected = collectedIds.includes(c.id);
    });
  }, [collectedIds]);

  // Synchronize solved status of puzzle checkpoints on-the-fly without resetting player position
  useEffect(() => {
    const s = stateRef.current;
    s.puzzleCheckpoints.forEach((cp) => {
      cp.solved = solvedPuzzleIds.includes(cp.id);
    });
  }, [solvedPuzzleIds]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      soundManager.ensureContext();

      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = true;
      } else if (['KeyE', 'Enter'].includes(e.code)) {
        keysRef.current.interact = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      } else if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        keysRef.current.jump = false;
      } else if (['KeyE', 'Enter'].includes(e.code)) {
        keysRef.current.interact = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnParticles = (x: number, y: number, color: string, count: number = 8) => {
      const s = stateRef.current;
      for (let i = 0; i < count; i++) {
        s.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.8) * 6,
          color,
          size: 2 + Math.random() * 3.5,
          alpha: 1,
          life: 25 + Math.random() * 20
        });
      }
    };

    const updatePhysics = () => {
      if (isPaused) {
        // Keep player safely stationary and grounded while answering quiz or viewing keepsake
        const p = stateRef.current.player;
        p.vx = 0;
        p.state = 'idle';
        return;
      }

      const s = stateRef.current;
      const p = s.player;
      const keys = keysRef.current;

      // Invulnerability & Hit timer
      if (p.invulnerableTimer > 0) p.invulnerableTimer--;
      if (p.stateTimer > 0) {
        p.stateTimer--;
        if (p.stateTimer === 0) p.state = 'idle';
      }

      // Blink animation
      p.blinkTimer = (p.blinkTimer + 1) % 220;

      // Horizontal Motion
      const moveSpeed = 4.8;
      const acceleration = 0.65;
      const friction = 0.82;

      if (p.state !== 'hit') {
        if (keys.left) {
          p.vx -= acceleration;
          p.facing = 'left';
          if (p.isGrounded) p.state = 'walk';
        } else if (keys.right) {
          p.vx += acceleration;
          p.facing = 'right';
          if (p.isGrounded) p.state = 'walk';
        } else {
          p.vx *= friction;
          if (Math.abs(p.vx) < 0.1) p.vx = 0;
          if (p.isGrounded && p.state !== 'cheer') p.state = 'idle';
        }
      } else {
        p.vx *= 0.9;
      }

      // Max horizontal speed clamp
      p.vx = Math.max(-moveSpeed, Math.min(moveSpeed, p.vx));
      p.x += p.vx;

      // World boundary clamp
      p.x = Math.max(15, Math.min(s.worldWidth - p.width - 15, p.x));

      // Gravity & Jumping
      const gravity = 0.58;
      p.vy += gravity;

      if (keys.jump && p.isGrounded && p.state !== 'hit') {
        p.vy = -12.5;
        p.isGrounded = false;
        p.state = 'jump';
        soundManager.playJump();
        spawnParticles(p.x + p.width / 2, p.y + p.height, '#fde047', 6);
      }

      p.y += p.vy;
      p.isGrounded = false;

      // Solid Ground Level
      const FLOOR_Y = 500;
      const groundPlayerY = FLOOR_Y - p.height; // e.g. 500 - 52 = 448

      // Platform Collisions (Elevated steps and garden terraces)
      for (const plat of s.platforms) {
        if (plat.type === 'ground') continue; // Ground is strictly enforced below

        // Continuous collision window so high falling speed never slips through
        const collisionTolerance = Math.max(16, p.vy + 4);
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.width &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + collisionTolerance &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          if (p.state === 'jump') p.state = 'idle';
        }
      }

      // STRICT SOLID GROUND COLLISION:
      // Prevents player from ever jumping into the ground and disappearing near the gate or anywhere
      if (p.y >= groundPlayerY) {
        p.y = groundPlayerY;
        p.vy = 0;
        p.isGrounded = true;
        if (p.state === 'jump') p.state = 'idle';
      }

      // Emergency Fail-Safe (guarantees character is NEVER lost in the ground)
      if (p.y > groundPlayerY) {
        p.y = groundPlayerY;
        p.vy = 0;
        p.isGrounded = true;
      }

      // Jump Pads Interaction (Snow Pump in Winter, Fire Net in Summer, Petal in Spring, Pumpkin in Autumn)
      for (const pad of s.jumpPads) {
        if (pad.bounceTimer > 0) pad.bounceTimer--;

        if (
          p.x + p.width > pad.x &&
          p.x < pad.x + pad.width &&
          p.y + p.height >= pad.y &&
          p.y + p.height <= pad.y + 18 &&
          p.vy >= 0
        ) {
          p.y = pad.y - p.height;
          p.vy = pad.type === 'fire_net' ? -18 : pad.type === 'snow_pump' ? -17.5 : -17; // Extra springy boost
          p.isGrounded = false;
          p.state = 'jump';
          pad.bounceTimer = 16;
          soundManager.playJump();

          const particleColor = pad.type === 'snow_pump'
            ? '#bae6fd'
            : pad.type === 'fire_net'
            ? '#f97316'
            : pad.type === 'spring_flower'
            ? '#f472b6'
            : '#ea580c';
          spawnParticles(pad.x + pad.width / 2, pad.y, particleColor, 18);
        }
      }

      // Obstacles update & playful bounce
      for (const obs of s.obstacles) {
        obs.x += obs.vx;
        if (obs.x <= obs.minX || obs.x + obs.width >= obs.maxX) {
          obs.vx *= -1;
        }

        if (
          p.invulnerableTimer === 0 &&
          p.x + p.width > obs.x + 4 &&
          p.x < obs.x + obs.width - 4 &&
          p.y + p.height > obs.y + 4 &&
          p.y < obs.y + obs.height
        ) {
          p.state = 'hit';
          p.stateTimer = 25;
          p.invulnerableTimer = 60;
          p.vy = -7;
          p.vx = p.x < obs.x ? -5 : 5;
          soundManager.playHitObstacle();
          spawnParticles(p.x + p.width / 2, p.y + p.height / 2, '#fde047', 8);
        }
      }

      // Collectibles Hover Animation & Interaction
      let nearbyPrompt: string | null = null;
      let activeCanInteract = false;

      for (const col of s.collectibles) {
        col.floatPhase += 0.05;
        const hoverY = col.y + Math.sin(col.floatPhase) * 6;

        if (!col.collected) {
          const dist = Math.hypot(
            (p.x + p.width / 2) - (col.x + 18),
            (p.y + p.height / 2) - hoverY
          );

          if (dist < 44) {
            nearbyPrompt = "Press [E] or tap OPEN to inspect Keepsake";
            activeCanInteract = true;

            if (keys.interact) {
              col.collected = true;
              keys.interact = false;
              soundManager.playCollect();
              soundManager.playGiftOpen();
              spawnParticles(col.x + 18, hoverY, '#f43f5e', 22);

              const matched = gameCollectibles.find(c => c.id === col.id);
              if (matched) {
                onCollectItem(matched);
              }
            }
          }
        }
      }

      // Puzzle Checkpoints (ONLY active & accessible if player entered a name in Special Guest database table!)
      if (isSpecialMember) {
        for (const cp of s.puzzleCheckpoints) {
          if (!cp.solved) {
            const dist = Math.abs((p.x + p.width / 2) - cp.x);
            if (dist < 60) {
              const puzzle = gamePuzzles[cp.id];
              const catLabel = puzzle?.categoryLabel || 'Love Trivia';
              nearbyPrompt = `👑 Press [E] or tap OPEN for VIP Riddle #${cp.numberLabel} (${catLabel})`;
              activeCanInteract = true;

              if (keys.interact) {
                keys.interact = false;
                if (puzzle) {
                  onOpenPuzzle(puzzle);
                }
              }
            }
          }
        }
      }

      // ── RETURN GATE (BACK TO PREVIOUS WORLD) ───────────────────────
      if (currentWorld > 1) {
        const retDist = Math.abs((p.x + p.width / 2) - (s.returnGate.x + s.returnGate.width / 2));
        if (retDist < 70) {
          nearbyPrompt = `Press [E] or tap RETURN to stroll through the Garden Gate`;
          activeCanInteract = true;

          if (keys.interact) {
            keys.interact = false;
            soundManager.playGateOpen();
            // Traveling back spawns player near the forward gate of previous world
            spawnXRef.current = 1370;
            onSwitchWorld(currentWorld - 1, 1370);
          }
        }
      }

      // ── FORWARD GATE (GARDEN GATE / WEDDING GATE) ───────────────────
      const gateDist = Math.abs((p.x + p.width / 2) - (s.forwardGate.x + s.forwardGate.width / 2));
      if (gateDist < 80) {
        if (s.forwardGate.isWeddingGate) {
          nearbyPrompt = "Press [E] or tap OPEN to enter the Grand Wedding Gate!";
          activeCanInteract = true;
          if (keys.interact) {
            keys.interact = false;
            p.state = 'cheer';
            onReachGate();
          }
        } else {
          // Garden Gate: Does NOT fill the name of the next season, per user instructions
          nearbyPrompt = `Press [E] or tap ENTER to stroll through the Garden Gate`;
          activeCanInteract = true;
          if (keys.interact) {
            keys.interact = false;
            soundManager.playGateOpen();
            // Traveling forward spawns player on the left side of next world
            spawnXRef.current = 150;
            onSwitchWorld(currentWorld + 1, 150);
          }
        }
      }

      setInteractPrompt(nearbyPrompt);
      setCanInteract(activeCanInteract);

      // Camera Tracking
      const viewportWidth = canvas.width;
      const targetCamX = p.x - viewportWidth * 0.38;
      const clampedCamX = Math.max(0, Math.min(s.worldWidth - viewportWidth, targetCamX));
      s.camera.x += (clampedCamX - s.camera.x) * 0.1;

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15;
        pt.alpha -= 1 / pt.life;
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Update Weather Particles (Snow, Petals, Sparkles, Leaves)
      for (const wp of s.weatherParticles) {
        wp.x += wp.vx;
        wp.y += wp.vy;
        wp.rotation += wp.rotationSpeed;

        if (wp.type === 'sparkle') {
          if (wp.y < 0) {
            wp.y = 520;
            wp.x = Math.random() * s.worldWidth;
          }
        } else {
          if (wp.y > 510) {
            wp.y = -10;
            wp.x = Math.random() * s.worldWidth;
          }
        }
        if (wp.x > s.worldWidth + 20) wp.x = -10;
        if (wp.x < -20) wp.x = s.worldWidth + 10;
      }

      // Clouds
      for (const cl of s.clouds) {
        cl.x += cl.speed;
        if (cl.x > s.worldWidth + 200) cl.x = -200;
      }
    };

    const render = () => {
      const s = stateRef.current;
      const p = s.player;
      const camX = s.camera.x;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. SKY GRADIENT (Distinct per season)
      let skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      if (currentWorld === 1) {
        // Winter: Cool Frost Blue & Icy Mist
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.4, '#7dd3fc');
        skyGrad.addColorStop(0.8, '#e0f2fe');
        skyGrad.addColorStop(1, '#ffffff');
      } else if (currentWorld === 2) {
        // Spring: Soft Rosy Dawn & Cherry Blossom Mint
        skyGrad.addColorStop(0, '#f472b6');
        skyGrad.addColorStop(0.4, '#fbcfe8');
        skyGrad.addColorStop(0.75, '#ecfdf5');
        skyGrad.addColorStop(1, '#d1fae5');
      } else if (currentWorld === 3) {
        // Summer: Radiant Golden Azure & Sunbeams
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.4, '#38bdf8');
        skyGrad.addColorStop(0.75, '#fde047');
        skyGrad.addColorStop(1, '#fef9c3');
      } else {
        // Autumn: Romantic Twilight Sunset (Crimson, Amber, Gold)
        skyGrad.addColorStop(0, '#881337');
        skyGrad.addColorStop(0.35, '#be123c');
        skyGrad.addColorStop(0.65, '#ea580c');
        skyGrad.addColorStop(0.88, '#f59e0b');
        skyGrad.addColorStop(1, '#fef3c7');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. PARALLAX DISTANT HILLS / MOUNTAINS
      ctx.save();
      ctx.translate(-camX * 0.25, 0);
      if (currentWorld === 1) {
        // Snow Mountains
        ctx.fillStyle = '#bae6fd';
      } else if (currentWorld === 2) {
        // Spring Green Slopes
        ctx.fillStyle = '#86efac';
      } else if (currentWorld === 3) {
        // Coastal Terraces
        ctx.fillStyle = '#fde047';
      } else {
        // Autumn Crimson Foliage
        ctx.fillStyle = '#fb923c';
      }
      ctx.beginPath();
      ctx.moveTo(-100, h);
      ctx.bezierCurveTo(200, 310, 500, 420, 800, 330);
      ctx.bezierCurveTo(1100, 250, 1400, 370, 1800, 300);
      ctx.lineTo(2000, h);
      ctx.fill();
      ctx.restore();

      // 3. CLOUDS
      ctx.save();
      ctx.translate(-camX * 0.5, 0);
      for (const cl of s.clouds) {
        ctx.fillStyle = currentWorld === 4 ? 'rgba(254, 215, 170, 0.75)' : 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, 25 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 22 * cl.scale, cl.y - 10 * cl.scale, 30 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 50 * cl.scale, cl.y, 24 * cl.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ── MAIN WORLD LAYER (Shifted by camera) ────────────────────────
      ctx.save();
      ctx.translate(-camX, 0);

      // 4. PLATFORMS & GROUND
      for (const plat of s.platforms) {
        if (plat.type === 'ground') {
          // Top layer of ground
          if (currentWorld === 1) {
            // Crisp White Powder Snow
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(plat.x, plat.y, plat.width, 18);
            // Frosted Earth underneath
            const soilGrad = ctx.createLinearGradient(0, plat.y + 18, 0, plat.y + plat.height);
            soilGrad.addColorStop(0, '#38bdf8');
            soilGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(plat.x, plat.y + 18, plat.width, plat.height - 18);
            // Hanging Icicles
            ctx.fillStyle = '#bae6fd';
            for (let gx = 0; gx < plat.width; gx += 32) {
              ctx.beginPath();
              ctx.moveTo(gx, plat.y + 18);
              ctx.lineTo(gx + 6, plat.y + 26);
              ctx.lineTo(gx + 12, plat.y + 18);
              ctx.fill();
            }
          } else if (currentWorld === 2) {
            // Spring Meadow Grass
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(plat.x, plat.y, plat.width, 16);
            const soilGrad = ctx.createLinearGradient(0, plat.y + 16, 0, plat.y + plat.height);
            soilGrad.addColorStop(0, '#15803d');
            soilGrad.addColorStop(1, '#1e1b4b');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(plat.x, plat.y + 16, plat.width, plat.height - 16);
            // Wildflower Tufts
            for (let gx = 0; gx < plat.width; gx += 26) {
              ctx.fillStyle = gx % 52 === 0 ? '#f472b6' : '#fef08a';
              ctx.beginPath();
              ctx.arc(gx + 6, plat.y - 2, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (currentWorld === 3) {
            // Summer Golden Coastal Turf
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(plat.x, plat.y, plat.width, 16);
            const soilGrad = ctx.createLinearGradient(0, plat.y + 16, 0, plat.y + plat.height);
            soilGrad.addColorStop(0, '#b45309');
            soilGrad.addColorStop(1, '#451a03');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(plat.x, plat.y + 16, plat.width, plat.height - 16);
            // Mini Sunflower Sprouts
            ctx.fillStyle = '#facc15';
            for (let gx = 0; gx < plat.width; gx += 40) {
              ctx.beginPath();
              ctx.arc(gx + 8, plat.y - 3, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Autumn Amber Leaf Ground
            ctx.fillStyle = '#d97706';
            ctx.fillRect(plat.x, plat.y, plat.width, 18);
            const soilGrad = ctx.createLinearGradient(0, plat.y + 18, 0, plat.y + plat.height);
            soilGrad.addColorStop(0, '#78350f');
            soilGrad.addColorStop(1, '#292524');
            ctx.fillStyle = soilGrad;
            ctx.fillRect(plat.x, plat.y + 18, plat.width, plat.height - 18);
            // Scattered maple leaves
            for (let gx = 0; gx < plat.width; gx += 30) {
              ctx.fillStyle = gx % 60 === 0 ? '#ea580c' : '#b91c1c';
              ctx.beginPath();
              ctx.ellipse(gx + 6, plat.y + 4, 5, 3, 0.4, 0, Math.PI * 2);
              ctx.fill();
            }

            // Velvet Wedding Red Carpet in World 4 approaching Wedding Gate
            const carpetStart = 1260;
            const carpetWidth = 260;
            ctx.fillStyle = '#9f1239'; // Deep royal velvet rose
            ctx.fillRect(carpetStart, plat.y, carpetWidth, 8);
            // Gold trim on carpet
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(carpetStart, plat.y, carpetWidth, 1.5);
            ctx.fillRect(carpetStart, plat.y + 6.5, carpetWidth, 1.5);
          }
        } else {
          // Floating Platforms / Ladder Steps per season
          if (plat.type === 'leaf') {
            // ═══════════════════════════════════════════════════════════════
            // AUTUMN: SCULPTED GOLDEN MAPLE LEAF STEP
            // "while in autum, make it look like a leaf"
            // ═══════════════════════════════════════════════════════════════
            ctx.save();
            const lx = plat.x;
            const ly = plat.y;
            const lw = plat.width;
            const lh = plat.height;

            // Leaf Petiole Stem
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lx, ly + lh * 0.5);
            ctx.quadraticCurveTo(lx - 10, ly + lh * 0.5 + 5, lx - 16, ly + lh * 0.5 + 2);
            ctx.stroke();

            // Autumn Gradient: fiery crimson to rich golden amber
            const leafGrad = ctx.createLinearGradient(lx, ly, lx + lw, ly + lh);
            leafGrad.addColorStop(0, '#be123c');
            leafGrad.addColorStop(0.35, '#ea580c');
            leafGrad.addColorStop(0.7, '#f59e0b');
            leafGrad.addColorStop(1, '#fde047');

            // Draw organic lobed leaf shape
            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.moveTo(lx, ly + lh * 0.5);
            ctx.bezierCurveTo(lx + lw * 0.2, ly - 6, lx + lw * 0.45, ly - 8, lx + lw * 0.65, ly - 3);
            ctx.bezierCurveTo(lx + lw * 0.8, ly - 1, lx + lw * 0.95, ly + lh * 0.2, lx + lw, ly + lh * 0.5);
            ctx.bezierCurveTo(lx + lw * 0.95, ly + lh * 0.8, lx + lw * 0.8, ly + lh + 4, lx + lw * 0.65, ly + lh + 5);
            ctx.bezierCurveTo(lx + lw * 0.45, ly + lh + 6, lx + lw * 0.2, ly + lh + 5, lx, ly + lh * 0.5);
            ctx.closePath();
            ctx.fill();

            // Leaf Edge Highlight
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Central Vein
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(lx + 4, ly + lh * 0.5);
            ctx.quadraticCurveTo(lx + lw * 0.5, ly + lh * 0.48, lx + lw - 6, ly + lh * 0.5);
            ctx.stroke();

            // Lateral Veins
            ctx.lineWidth = 1.2;
            for (let v = 0.25; v < 0.85; v += 0.2) {
              const vx = lx + lw * v;
              const vy = ly + lh * 0.5;
              ctx.beginPath();
              ctx.moveTo(vx, vy);
              ctx.lineTo(vx + 16, vy - 7);
              ctx.moveTo(vx, vy);
              ctx.lineTo(vx + 16, vy + 7);
              ctx.stroke();
            }

            // Morning Dew Drop on Leaf Tip
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(lx + lw - 8, ly + lh * 0.5 - 2, 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

          } else if (plat.type === 'grassy_summer') {
            // ═══════════════════════════════════════════════════════════════
            // SUMMER: LUSH GRASSY LADDER STEP
            // "make it more grassy on summer"
            // ═══════════════════════════════════════════════════════════════
            ctx.save();
            const gx = plat.x;
            const gy = plat.y;
            const gw = plat.width;
            const gh = plat.height;

            // Rich earthy bedrock foundation
            const earthGrad = ctx.createLinearGradient(0, gy, 0, gy + gh);
            earthGrad.addColorStop(0, '#592e12');
            earthGrad.addColorStop(1, '#2e1606');
            ctx.fillStyle = earthGrad;
            ctx.beginPath();
            ctx.roundRect(gx, gy + 5, gw, gh - 5, [0, 0, 6, 6]);
            ctx.fill();

            // Thick emerald moss & turf underlayer
            const grassGrad = ctx.createLinearGradient(0, gy, 0, gy + 10);
            grassGrad.addColorStop(0, '#4ade80');
            grassGrad.addColorStop(1, '#15803d');
            ctx.fillStyle = grassGrad;
            ctx.beginPath();
            ctx.roundRect(gx, gy, gw, 10, [6, 6, 0, 0]);
            ctx.fill();

            // Abundant waving grass blades across the entire step!
            const nowTime = Date.now() * 0.003;
            for (let bx = 3; bx < gw - 3; bx += 4.5) {
              const sway = Math.sin(nowTime * 5 + bx) * 1.5;
              const bHeight = 5 + (bx % 3) * 2;
              ctx.strokeStyle = bx % 9 === 0 ? '#86efac' : bx % 2 === 0 ? '#22c55e' : '#16a34a';
              ctx.lineWidth = 1.8;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(gx + bx, gy + 2);
              ctx.quadraticCurveTo(gx + bx + sway, gy - bHeight / 2, gx + bx + sway * 1.6, gy - bHeight);
              ctx.stroke();
            }

            // Trailing Ivy Vines hanging down from underneath
            for (let ix = 12; ix < gw - 12; ix += 28) {
              ctx.strokeStyle = '#15803d';
              ctx.lineWidth = 1.6;
              ctx.beginPath();
              ctx.moveTo(gx + ix, gy + gh - 4);
              ctx.quadraticCurveTo(gx + ix + 4, gy + gh + 6, gx + ix, gy + gh + 12);
              ctx.stroke();

              // Tiny ivy leaf
              ctx.fillStyle = '#4ade80';
              ctx.beginPath();
              ctx.ellipse(gx + ix + 2, gy + gh + 8, 3, 2, 0.5, 0, Math.PI * 2);
              ctx.fill();
            }

            // Cheerful yellow summer buttercup daisies
            for (let fx = 18; fx < gw - 15; fx += 38) {
              ctx.fillStyle = '#fef08a';
              ctx.beginPath();
              ctx.arc(gx + fx, gy - 2, 2.8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.arc(gx + fx, gy - 2, 1.2, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();

          } else if (plat.type === 'ice') {
            // ═══════════════════════════════════════════════════════════════
            // WINTER: FROSTED GLACIAL ICE STEP WITH ICICLES
            // ═══════════════════════════════════════════════════════════════
            ctx.save();
            const iceGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.height);
            iceGrad.addColorStop(0, '#e0f2fe');
            iceGrad.addColorStop(0.5, '#7dd3fc');
            iceGrad.addColorStop(1, '#0284c7');
            ctx.fillStyle = iceGrad;
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
            ctx.fill();

            // Puffy snow pillow on top
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.width, 6, [6, 6, 0, 0]);
            ctx.fill();

            // Hanging icicles
            for (let ix = 10; ix < plat.width - 10; ix += 18) {
              const icicleLen = 5 + (ix % 7);
              ctx.fillStyle = 'rgba(224, 242, 254, 0.9)';
              ctx.beginPath();
              ctx.moveTo(plat.x + ix, plat.y + plat.height);
              ctx.lineTo(plat.x + ix + 3, plat.y + plat.height + icicleLen);
              ctx.lineTo(plat.x + ix + 6, plat.y + plat.height);
              ctx.fill();
            }
            ctx.restore();

          } else {
            // ═══════════════════════════════════════════════════════════════
            // SPRING: RUSTIC SAKURA WOOD WITH BLOSSOMS
            // ═══════════════════════════════════════════════════════════════
            ctx.save();
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
            ctx.fill();

            // Spring moss
            ctx.fillStyle = '#86efac';
            ctx.fillRect(plat.x, plat.y, plat.width, 5);

            // Scattered Sakura petals
            for (let px = 14; px < plat.width - 10; px += 24) {
              ctx.fillStyle = '#fbcfe8';
              ctx.beginPath();
              ctx.ellipse(plat.x + px, plat.y + 2, 4, 2.5, 0.3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }
        }
      }

      // 5. JUMP PADS (Snow Pump in Winter, Fire Net in Summer, Spring Petal, Pumpkin)
      for (const pad of s.jumpPads) {
        const isBouncing = pad.bounceTimer > 0;
        const squash = isBouncing ? 0.6 : 1;

        if (pad.type === 'snow_pump') {
          // ═══════════════════════════════════════════════════════════════
          // WINTER: MECHANICAL STEAM/SNOW PUMP
          // "snow pump in winter"
          // ═══════════════════════════════════════════════════════════════
          ctx.save();
          const px = pad.x;
          const py = pad.y;
          const pw = pad.width;

          // Heavy riveted steel base
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(px + 4, py + 12, pw - 8, 10, [2, 2, 4, 4]);
          ctx.fill();
          // Base rivets
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(px + 6, py + 16, 2.5, 2.5);
          ctx.fillRect(px + pw - 9, py + 16, 2.5, 2.5);

          // Central Chrome Piston Shaft
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(px + pw / 2 - 5, py + 4 * squash, 10, 10 * squash);

          // Heavy Industrial Compression Spring
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const sy = py + 3 + (i * 3) * squash;
            ctx.moveTo(px + pw / 2 - 8, sy);
            ctx.lineTo(px + pw / 2 + 8, sy + 1.5 * squash);
          }
          ctx.stroke();

          // Brass Pressure Gauge on side of pump
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(px - 1, py + 13, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(px - 1, py + 13, 3, 0, Math.PI * 2);
          ctx.fill();
          // Gauge needle
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px - 1, py + 13);
          ctx.lineTo(px + (isBouncing ? 1 : -2), py + 11);
          ctx.stroke();

          // Piston Top Platform with Snowflake insignia
          const pumpTopY = py + (isBouncing ? 6 : 0);
          const topGrad = ctx.createLinearGradient(px, pumpTopY, px + pw, pumpTopY + 8);
          topGrad.addColorStop(0, '#0284c7');
          topGrad.addColorStop(0.5, '#38bdf8');
          topGrad.addColorStop(1, '#bae6fd');
          ctx.fillStyle = topGrad;
          ctx.beginPath();
          ctx.roundRect(px, pumpTopY, pw, 8, 4);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Snowflake emblem
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('❄️', px + pw / 2, pumpTopY + 7);

          // Frost steam puffs when active
          if (isBouncing) {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.7)';
            ctx.beginPath();
            ctx.arc(px + 4, py + 12, 5, 0, Math.PI * 2);
            ctx.arc(px + pw - 4, py + 12, 5, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

        } else if (pad.type === 'fire_net') {
          // ═══════════════════════════════════════════════════════════════
          // SUMMER: SUSPENDED FIERY ACROBATIC NET TRAMPOLINE
          // "or fire net in summer"
          // ═══════════════════════════════════════════════════════════════
          ctx.save();
          const fx = pad.x;
          const fy = pad.y;
          const fw = pad.width;

          // Sturdy Charred Iron Support Posts on left & right
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(fx, fy + 2, 6, 18);
          ctx.fillRect(fx + fw - 6, fy + 2, 6, 18);

          // Gold Torch / Flame Brackets
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(fx - 1, fy + 3, 8, 4);
          ctx.fillRect(fx + fw - 7, fy + 3, 8, 4);

          // Torch flames on posts
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(fx + 3, fy + 1, 3.5, 0, Math.PI * 2);
          ctx.arc(fx + fw - 3, fy + 1, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(fx + 3, fy + 1, 2, 0, Math.PI * 2);
          ctx.arc(fx + fw - 3, fy + 1, 2, 0, Math.PI * 2);
          ctx.fill();

          // Fire Net Dip under dynamic tension
          const dipY = fy + (isBouncing ? 14 : 7);

          // Outer fiery glow
          ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(fx + 5, fy + 6);
          ctx.quadraticCurveTo(fx + fw / 2, dipY + 4, fx + fw - 5, fy + 6);
          ctx.stroke();

          // Main Woven Net Cables (Blazing fiery crimson & orange)
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(fx + 5, fy + 6);
          ctx.quadraticCurveTo(fx + fw / 2, dipY, fx + fw - 5, fy + 6);
          ctx.stroke();

          // Cross Weave Net Lines
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          for (let nx = fx + 11; nx < fx + fw - 8; nx += 7) {
            ctx.beginPath();
            const factor = (nx - fx) / fw;
            const wireY = (fy + 6) + (dipY - (fy + 6)) * 4 * factor * (1 - factor);
            ctx.moveTo(nx, wireY - 2);
            ctx.lineTo(nx, wireY + 4);
            ctx.stroke();
          }

          // Hot incandescent core strand
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(fx + 8, fy + 6);
          ctx.quadraticCurveTo(fx + fw / 2, dipY - 0.5, fx + fw - 8, fy + 6);
          ctx.stroke();

          // Rising fiery sparks / embers
          const emberTime = Date.now() * 0.003;
          for (let i = 0; i < 3; i++) {
            const sparkX = fx + 10 + (i * 12) + Math.sin(emberTime * 3 + i) * 3;
            const sparkY = fy - 2 - (emberTime * 50 + i * 4) % 10;
            ctx.fillStyle = i % 2 === 0 ? '#f59e0b' : '#f97316';
            ctx.beginPath();
            ctx.arc(sparkX, sparkY, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

        } else if (pad.type === 'pumpkin') {
          // Harvest Pumpkin Trampoline in Autumn
          ctx.save();
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(pad.x + pad.width / 2, pad.y + 10, pad.width / 2 - 2, 8 * squash, 0, 0, Math.PI * 2);
          ctx.fill();
          // Pumpkin ribs
          ctx.strokeStyle = '#c2410c';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(pad.x + pad.width / 2, pad.y + 10, pad.width / 4, 8 * squash, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Green vine stalk
          ctx.fillStyle = '#15803d';
          ctx.fillRect(pad.x + pad.width / 2 - 2, pad.y + (isBouncing ? 4 : 0), 4, 5);
          ctx.restore();

        } else {
          // Spring Flower Petal Cushion
          ctx.save();
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.ellipse(pad.x + pad.width / 2, pad.y + 10, pad.width / 2 - 2, 9 * squash, 0, 0, Math.PI * 2);
          ctx.fill();
          // Yellow stamen center
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(pad.x + pad.width / 2, pad.y + 9, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 6. OBSTACLES (Snails, Snow Critters, Crabs, Hedgehogs)
      for (const obs of s.obstacles) {
        if (obs.type === 'snail') {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(obs.x + 16 + (obs.vx > 0 ? 4 : -4), obs.y + 20, 16, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          const headX = obs.vx > 0 ? obs.x + 28 : obs.x + 4;
          ctx.fillRect(headX - 1, obs.y + 6, 3, 8);
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(headX, obs.y + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'snowcritter') {
          // Playful Winter Snowball Roll
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 12, 13, 0, Math.PI * 2);
          ctx.fill();
          // Blue earmuffs
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(obs.x + 4, obs.y + 8, 4, 8);
          ctx.fillRect(obs.x + 24, obs.y + 8, 4, 8);
          // Tiny coal eyes & carrot nose
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(obs.x + 14, obs.y + 10, 1.5, 0, Math.PI * 2);
          ctx.arc(obs.x + 20, obs.y + 10, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(obs.x + 17, obs.y + 14, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'crab') {
          // Cheerful Beach Crab
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.ellipse(obs.x + 16, obs.y + 14, 13, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eyes
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(obs.x + 11, obs.y + 6, 3, 0, Math.PI * 2);
          ctx.arc(obs.x + 21, obs.y + 6, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(obs.x + 11, obs.y + 6, 1.5, 0, Math.PI * 2);
          ctx.arc(obs.x + 21, obs.y + 6, 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Hedgehog
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 14, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fed7aa';
          const faceX = obs.vx > 0 ? obs.x + 24 : obs.x + 8;
          ctx.beginPath();
          ctx.arc(faceX, obs.y + 15, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(faceX, obs.y + 14, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 7. COLLECTIBLES
      for (const col of s.collectibles) {
        if (!col.collected) {
          const hoverY = col.y + Math.sin(col.floatPhase) * 6;
          // Glowing Halo
          ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
          ctx.beginPath();
          ctx.arc(col.x + 18, hoverY + 18, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(col.icon, col.x + 18, hoverY + 24);
        }
      }

      // 8. PUZZLE CHECKPOINT SIGNPOSTS - Hidden completely unless player entered name in Special Guest List
      if (isSpecialMember) {
        for (const cp of s.puzzleCheckpoints) {
          ctx.save();
          // Wooden / Iron Post with golden finial
          ctx.fillStyle = '#78350f';
          ctx.fillRect(cp.x - 4, cp.y + 20, 8, 60);

          // VIP Sign Board with Gold Trim
          ctx.fillStyle = cp.solved ? '#10b981' : '#b45309';
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(cp.x - 46, cp.y - 14, 92, 38, 8);
          ctx.fill();
          ctx.stroke();

          // Crown on top of signboard
          ctx.fillStyle = '#fde047';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('👑', cp.x, cp.y - 18);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText(cp.solved ? '✨ SOLVED' : `👑 VIP RIDDLE #${cp.numberLabel}`, cp.x, cp.y + 10);
          ctx.restore();
        }
      }

      // 9. RETURN GATE (LEFT SIDE) ── Rustic Garden Arbor Gate
      if (currentWorld > 1) {
        const rGate = s.returnGate;
        const rx = rGate.x;
        const ry = rGate.y;
        const rw = rGate.width;
        const rh = rGate.height;

        // Stone pedestals
        ctx.fillStyle = '#475569';
        ctx.fillRect(rx - 4, ry + rh - 16, 18, 16);
        ctx.fillRect(rx + rw - 14, ry + rh - 16, 18, 16);

        // Wooden Pergola Posts
        ctx.fillStyle = '#78350f';
        ctx.fillRect(rx, ry + 20, 12, rh - 20);
        ctx.fillRect(rx + rw - 12, ry + 20, 12, rh - 20);

        // Arbor Arch
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + 26, rw / 2 - 2, Math.PI, 0);
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 10;
        ctx.stroke();

        // Inner glowing garden path
        const rGrad = ctx.createLinearGradient(0, ry + 26, 0, ry + rh);
        rGrad.addColorStop(0, '#fef9c3');
        rGrad.addColorStop(0.5, '#e0f2fe');
        rGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rGrad;
        ctx.beginPath();
        ctx.roundRect(rx + 12, ry + 26, rw - 24, rh - 30, [12, 12, 0, 0]);
        ctx.fill();

        // Hanging Garden Lantern
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(rx + rw / 2, ry + 42, 6, 0, Math.PI * 2);
        ctx.fill();

        // Garden Gate Header Plaque (NO next or previous season name!)
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(rx - 8, ry + 4, rw + 16, 18, 5);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 GARDEN GATE 🌿', rx + rw / 2, ry + 16);
      }

      // 10. FORWARD GATE OR GRAND WEDDING GATE (RIGHT SIDE)
      const fGate = s.forwardGate;
      if (fGate.isWeddingGate) {
        // ══════════════════════════════════════════════════════════════
        // THE GRAND WEDDING GATE (World 4 Exit)
        // Designed specifically to look like an ornate wedding gate!
        // ══════════════════════════════════════════════════════════════
        const gx = fGate.x;
        const gy = fGate.y;
        const gw = fGate.width;
        const gh = fGate.height;

        // Twin Elegant Fluted Marble Columns
        ctx.fillStyle = '#fffbeb';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;

        // Left Roman Column
        ctx.beginPath();
        ctx.roundRect(gx, gy, 26, gh, 4);
        ctx.fill();
        ctx.stroke();

        // Right Roman Column
        ctx.beginPath();
        ctx.roundRect(gx + gw - 26, gy, 26, gh, 4);
        ctx.fill();
        ctx.stroke();

        // Fluted lines on columns
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gx + 8, gy + 10); ctx.lineTo(gx + 8, gy + gh - 10);
        ctx.moveTo(gx + 18, gy + 10); ctx.lineTo(gx + 18, gy + gh - 10);
        ctx.moveTo(gx + gw - 18, gy + 10); ctx.lineTo(gx + gw - 18, gy + gh - 10);
        ctx.moveTo(gx + gw - 8, gy + 10); ctx.lineTo(gx + gw - 8, gy + gh - 10);
        ctx.stroke();

        // Majestic Floral Wedding Arch overhead
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 20, gw / 2, Math.PI, 0);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 14;
        ctx.stroke();

        // White & Blush Climbing Garden Roses along the arch
        const flowerCount = 9;
        for (let fi = 0; fi <= flowerCount; fi++) {
          const angle = Math.PI + (Math.PI * fi) / flowerCount;
          const fx = gx + gw / 2 + Math.cos(angle) * (gw / 2);
          const fy = gy + 20 + Math.sin(angle) * (gw / 2);
          ctx.fillStyle = fi % 2 === 0 ? '#ffffff' : '#fda4af';
          ctx.beginPath();
          ctx.arc(fx, fy, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(fx, fy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draped Soft Chiffon Wedding Curtains on both sides
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        // Left drape
        ctx.beginPath();
        ctx.moveTo(gx + 26, gy + 25);
        ctx.quadraticCurveTo(gx + 45, gy + gh * 0.4, gx + 26, gy + gh * 0.75);
        ctx.lineTo(gx + 26, gy + 25);
        ctx.fill();
        // Right drape
        ctx.beginPath();
        ctx.moveTo(gx + gw - 26, gy + 25);
        ctx.quadraticCurveTo(gx + gw - 45, gy + gh * 0.4, gx + gw - 26, gy + gh * 0.75);
        ctx.lineTo(gx + gw - 26, gy + 25);
        ctx.fill();

        // Golden Gate Center Doors with Warm Welcome Glow
        const gateCenterGrad = ctx.createLinearGradient(0, gy + 30, 0, gy + gh);
        gateCenterGrad.addColorStop(0, '#fef9c3');
        gateCenterGrad.addColorStop(0.5, '#fed7aa');
        gateCenterGrad.addColorStop(1, '#fbcfe8');
        ctx.fillStyle = gateCenterGrad;
        ctx.fillRect(gx + 26, gy + 30, gw - 52, gh - 30);

        // Golden Wedding Monogram & Plaque
        ctx.fillStyle = '#78350f';
        ctx.font = '28px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💍', gx + gw / 2, gy + 85);

        ctx.font = 'bold 11px serif';
        ctx.fillStyle = '#881337';
        ctx.fillText('JULIAN & SOPHIA', gx + gw / 2, gy + 115);
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText('WEDDING INVITATION', gx + gw / 2, gy + 130);
        ctx.fillText('OCTOBER 24, 2026', gx + gw / 2, gy + 145);

        // Ceremonial Wedding Lanterns on column bases
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(gx + 13, gy + gh - 20, 8, 0, Math.PI * 2);
        ctx.arc(gx + gw - 13, gy + gh - 20, 8, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // ══════════════════════════════════════════════════════════════
        // REDESIGNED GARDEN GATE (Worlds 1, 2, 3)
        // Authentic Garden Gate decorated with flowers matching current season,
        // strictly with NO name of next season!
        // ══════════════════════════════════════════════════════════════
        const gx = fGate.x;
        const gy = fGate.y;
        const gw = fGate.width;
        const gh = fGate.height;

        // 1. Stone Pathway Threshold at Base
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(gx - 6, gy + gh - 10, gw + 12, 10);
        ctx.fillStyle = '#94a3b8';
        for (let bx = gx; bx < gx + gw; bx += 14) {
          ctx.fillRect(bx, gy + gh - 8, 11, 6);
        }

        // 2. Twin Stone Pedestal Footers
        ctx.fillStyle = '#64748b';
        ctx.fillRect(gx - 4, gy + gh - 22, 18, 14);
        ctx.fillRect(gx + gw - 14, gy + gh - 22, 18, 14);

        // 3. Wooden Garden Arbor Trellis Posts
        const woodColor = currentWorld === 1 ? '#475569' : '#78350f';
        ctx.fillStyle = woodColor;
        ctx.fillRect(gx, gy + 24, 14, gh - 46);
        ctx.fillRect(gx + gw - 14, gy + 24, 14, gh - 46);

        // Lattice cross-bars on trellis posts
        ctx.strokeStyle = currentWorld === 1 ? '#94a3b8' : '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let ly = gy + 32; ly < gy + gh - 25; ly += 14) {
          ctx.moveTo(gx + 2, ly); ctx.lineTo(gx + 12, ly + 8);
          ctx.moveTo(gx + gw - 12, ly); ctx.lineTo(gx + gw - 2, ly + 8);
        }
        ctx.stroke();

        // 4. Center Garden Portal - Warm welcoming sunlit path ahead
        const gardenPathGrad = ctx.createLinearGradient(0, gy + 24, 0, gy + gh);
        if (currentWorld === 1) {
          gardenPathGrad.addColorStop(0, '#ffffff');
          gardenPathGrad.addColorStop(0.5, '#e0f2fe');
          gardenPathGrad.addColorStop(1, '#0f172a');
        } else if (currentWorld === 2) {
          gardenPathGrad.addColorStop(0, '#ffffff');
          gardenPathGrad.addColorStop(0.5, '#fce7f3');
          gardenPathGrad.addColorStop(1, '#1e293b');
        } else {
          gardenPathGrad.addColorStop(0, '#fef9c3');
          gardenPathGrad.addColorStop(0.5, '#fed7aa');
          gardenPathGrad.addColorStop(1, '#1e293b');
        }
        ctx.fillStyle = gardenPathGrad;
        ctx.beginPath();
        ctx.roundRect(gx + 14, gy + 28, gw - 28, gh - 48, [12, 12, 0, 0]);
        ctx.fill();

        // 5. Open Wrought-Iron / Picket Garden Gate Wings (swung welcomingly inward)
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        // Left gate wing
        ctx.beginPath();
        ctx.moveTo(gx + 14, gy + gh - 22);
        ctx.lineTo(gx + 26, gy + gh - 40);
        ctx.lineTo(gx + 26, gy + 60);
        ctx.stroke();
        // Right gate wing
        ctx.beginPath();
        ctx.moveTo(gx + gw - 14, gy + gh - 22);
        ctx.lineTo(gx + gw - 26, gy + gh - 40);
        ctx.lineTo(gx + gw - 26, gy + 60);
        ctx.stroke();

        // 6. Gracefully Curved Garden Arbor Overhead Arch
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 28, gw / 2 - 4, Math.PI, 0);
        ctx.strokeStyle = woodColor;
        ctx.lineWidth = 12;
        ctx.stroke();

        // 7. Climbing Green Ivy Vines
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3.5;
        // Left climbing vine
        ctx.beginPath();
        ctx.moveTo(gx + 5, gy + gh - 22);
        ctx.quadraticCurveTo(gx + 12, gy + gh * 0.5, gx + 6, gy + 32);
        ctx.stroke();
        // Right climbing vine
        ctx.beginPath();
        ctx.moveTo(gx + gw - 5, gy + gh - 22);
        ctx.quadraticCurveTo(gx + gw - 12, gy + gh * 0.5, gx + gw - 6, gy + 32);
        ctx.stroke();

        // 8. SEASONAL FLOWERS DECORATING THE GARDEN GATE (matching CURRENT season)
        if (currentWorld === 1) {
          // ── WINTER GARDEN GATE: Frosted snowdrops, white winter jasmine & red holly berries ──
          const winterBlooms = [
            { x: gx + 3, y: gy + gh * 0.7 },
            { x: gx + 8, y: gy + gh * 0.45 },
            { x: gx + 15, y: gy + 20 },
            { x: gx + gw / 2 - 12, y: gy + 8 },
            { x: gx + gw / 2 + 12, y: gy + 8 },
            { x: gx + gw - 15, y: gy + 20 },
            { x: gx + gw - 8, y: gy + gh * 0.45 },
            { x: gx + gw - 3, y: gy + gh * 0.7 }
          ];
          winterBlooms.forEach((b, idx) => {
            // White frosted petal
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
            ctx.fill();
            // Ice blue / crystal center
            ctx.fillStyle = '#7dd3fc';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Red holly berries beside flower
            if (idx % 2 === 0) {
              ctx.fillStyle = '#dc2626';
              ctx.beginPath();
              ctx.arc(b.x + 5, b.y + 4, 3, 0, Math.PI * 2);
              ctx.arc(b.x - 4, b.y + 4, 2.5, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        } else if (currentWorld === 2) {
          // ── SPRING GARDEN GATE: Cascading cherry blossoms, pink roses & white daisies ──
          const springBlooms = [
            { x: gx + 3, y: gy + gh * 0.75, color: '#f472b6' },
            { x: gx + 7, y: gy + gh * 0.5, color: '#fda4af' },
            { x: gx + 12, y: gy + 26, color: '#ffffff' },
            { x: gx + gw / 2 - 16, y: gy + 9, color: '#f472b6' },
            { x: gx + gw / 2, y: gy + 6, color: '#fda4af' },
            { x: gx + gw / 2 + 16, y: gy + 9, color: '#ffffff' },
            { x: gx + gw - 12, y: gy + 26, color: '#f472b6' },
            { x: gx + gw - 7, y: gy + gh * 0.5, color: '#fda4af' },
            { x: gx + gw - 3, y: gy + gh * 0.75, color: '#f472b6' }
          ];
          springBlooms.forEach((b) => {
            // Flower petals
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, 6.5, 0, Math.PI * 2);
            ctx.fill();
            // Center stamen
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Fresh green leaves
            ctx.fillStyle = '#4ade80';
            ctx.beginPath();
            ctx.arc(b.x + 4, b.y - 4, 2.5, 0, Math.PI * 2);
            ctx.fill();
          });
        } else {
          // ── SUMMER GARDEN GATE: Radiant sunflowers, coral hibiscuses & purple lavender ──
          const summerBlooms = [
            { x: gx + 3, y: gy + gh * 0.72, type: 'sunflower' },
            { x: gx + 8, y: gy + gh * 0.48, type: 'hibiscus' },
            { x: gx + 14, y: gy + 24, type: 'sunflower' },
            { x: gx + gw / 2 - 15, y: gy + 8, type: 'hibiscus' },
            { x: gx + gw / 2, y: gy + 5, type: 'sunflower' },
            { x: gx + gw / 2 + 15, y: gy + 8, type: 'hibiscus' },
            { x: gx + gw - 14, y: gy + 24, type: 'sunflower' },
            { x: gx + gw - 8, y: gy + gh * 0.48, type: 'hibiscus' },
            { x: gx + gw - 3, y: gy + gh * 0.72, type: 'sunflower' }
          ];
          summerBlooms.forEach((b) => {
            if (b.type === 'sunflower') {
              // Sunflower yellow petals
              ctx.fillStyle = '#fbbf24';
              ctx.beginPath();
              ctx.arc(b.x, b.y, 7, 0, Math.PI * 2);
              ctx.fill();
              // Dark chocolate center
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(b.x, b.y, 3.2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Coral hibiscus
              ctx.fillStyle = '#f97316';
              ctx.beginPath();
              ctx.arc(b.x, b.y, 6.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = '#fde047';
              ctx.beginPath();
              ctx.arc(b.x, b.y, 2.2, 0, Math.PI * 2);
              ctx.fill();
            }
            // Blooming purple lavender sprig
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(b.x - 3, b.y + 4, 2, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // 9. Hanging Brass Carriage Lantern at Peak
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 45, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gx + gw / 2, gy + 44, 3, 0, Math.PI * 2);
        ctx.fill();

        // 10. Rustic Wooden Garden Plaque
        // Explicitly says "GARDEN GATE", strictly omitting the next season name as requested!
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(gx - 6, gy + 4, gw + 12, 18, 5);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌿 GARDEN GATE 🌿', gx + gw / 2, gy + 16);
      }

      // 11. PLAYER CHARACTER "MINION"
      const px = p.x;
      const py = p.y;
      const pw = p.width;
      const ph = p.height;
      const isHit = p.state === 'hit';
      const isJump = p.state === 'jump';
      const isCheer = p.state === 'cheer';

      // ── FLOATING GUEST NAME TAG ABOVE MINION HEAD ─────────────────────
      // Rendered in non-flipped world space so name is ALWAYS crystal clear and right-side up!
      const nameTagY = py - 24 + (isJump ? -4 : 0);
      const guestNameText = playerName.trim() ? playerName.trim() : 'Guest Explorer';
      const guestBadge = isSpecialMember ? `👑 ${guestNameText} (VIP)` : `⭐ ${guestNameText}`;

      ctx.save();
      ctx.font = 'bold 11px sans-serif';
      const textWidth = ctx.measureText(guestBadge).width;
      const tagWidth = Math.max(82, textWidth + 18);
      const tagHeight = 22;
      const tagX = px + pw / 2 - tagWidth / 2;

      // Dark slate / royal navy nametag pill with border
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 5;
      ctx.fillStyle = isSpecialMember ? '#1e1b4b' : '#0f172a';
      ctx.beginPath();
      ctx.roundRect(tagX, nameTagY, tagWidth, tagHeight, 11);
      ctx.fill();

      // Border: Royal gold for VIP, warm gold for guest
      ctx.strokeStyle = isSpecialMember ? '#facc15' : '#fbbf24';
      ctx.lineWidth = isSpecialMember ? 2 : 1.5;
      ctx.stroke();

      // Badge and Name text
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = isSpecialMember ? '#fef08a' : '#fde047';
      ctx.textAlign = 'center';
      ctx.fillText(guestBadge, px + pw / 2, nameTagY + 15);
      ctx.restore();

      // Comic squish/stretch scale for Minion
      let scaleX = 1;
      let scaleY = 1;
      if (isJump) {
        scaleX = 0.88;
        scaleY = 1.15;
      } else if (p.isGrounded && Math.abs(p.vx) > 0.5) {
        scaleY = 1 + Math.sin(Date.now() / 80) * 0.08;
      } else if (isHit) {
        scaleX = 1.25;
        scaleY = 0.75;
      }

      ctx.save();
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.scale(scaleX * (p.facing === 'left' ? -1 : 1), scaleY);

      // Invulnerability blink
      if (p.invulnerableTimer > 0 && Math.floor(p.invulnerableTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Minion Shoes (Tiny black shoes)
      ctx.fillStyle = '#1c1917';
      const stepOffset = p.state === 'walk' ? Math.sin(Date.now() / 90) * 4 : 0;
      ctx.beginPath();
      ctx.ellipse(-10, ph / 2 - 2 + stepOffset, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(10, ph / 2 - 2 - stepOffset, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Minion Body (Yellow pill shape)
      ctx.fillStyle = isHit ? '#fde047' : '#facc15';
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph - 6, 18);
      ctx.fill();

      // Minion Denim Overalls (Blue pants & bib)
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(-pw / 2, 2, pw, ph / 2 - 6, [0, 0, 10, 10]);
      ctx.fill();
      // Overall front bib
      ctx.fillRect(-12, -4, 24, 12);
      // Overall straps
      ctx.fillRect(-14, -12, 6, 10);
      ctx.fillRect(8, -12, 6, 10);
      // Golden buttons
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-11, -4, 2, 0, Math.PI * 2);
      ctx.arc(11, -4, 2, 0, Math.PI * 2);
      ctx.fill();

      // Minion Hands / Arms
      ctx.fillStyle = '#facc15';
      if (isCheer) {
        ctx.fillRect(-pw / 2 - 4, -ph / 2 + 2, 6, 14);
        ctx.fillRect(pw / 2 - 2, -ph / 2 + 2, 6, 14);
      } else {
        ctx.fillRect(-pw / 2 - 3, -6 + stepOffset, 5, 14);
        ctx.fillRect(pw / 2 - 2, -6 - stepOffset, 5, 14);
      }

      // Aviator Goggles Strap (Black band wrapping head)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-pw / 2, -18, pw, 6);

      // Goggles Silver Frame
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(2, -15, 11, 0, Math.PI * 2);
      ctx.fill();
      // Goggle Lens (White lens)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(2, -15, 9, 0, Math.PI * 2);
      ctx.fill();

      // Eye Pupil
      if (isHit) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -19); ctx.lineTo(6, -11);
        ctx.moveTo(6, -19); ctx.lineTo(-2, -11);
        ctx.stroke();
      } else if (p.blinkTimer > 175) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, -15); ctx.lineTo(7, -15);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#854d0e';
        ctx.beginPath();
        ctx.arc(3, -15, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(3.5, -15, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4.5, -16.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.fillStyle = '#991b1b';
      if (isCheer || isJump) {
        ctx.beginPath();
        ctx.arc(3, -4, 5, 0, Math.PI);
        ctx.fill();
      } else if (isHit) {
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -3);
        ctx.quadraticCurveTo(2, -6, 6, -3);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(2, -5, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      ctx.restore();

      // 12. WEATHER PARTICLES (Snowflakes, Cherry Blossoms, Sparkles, Maple Leaves)
      for (const wp of s.weatherParticles) {
        ctx.save();
        ctx.globalAlpha = wp.alpha;
        ctx.translate(wp.x, wp.y);
        ctx.rotate(wp.rotation);

        if (wp.type === 'snow') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, wp.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (wp.type === 'petal') {
          ctx.fillStyle = '#fbcfe8';
          ctx.beginPath();
          ctx.ellipse(0, 0, wp.size, wp.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (wp.type === 'sparkle') {
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, wp.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Maple Leaf
          ctx.fillStyle = wp.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, wp.size, wp.size * 0.6, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 13. EXPLOSION PARTICLES (Gifts & Bounces)
      for (const pt of s.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore(); // restore camera
    };

    const loop = () => {
      updatePhysics();
      render();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentWorld, playerName, onCollectItem, onOpenPuzzle, onReachGate, onSwitchWorld]);

  // Responsive canvas resizing
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width;
      canvasRef.current.height = Math.min(600, Math.max(420, rect.height));
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const currentSeason = fourSeasons[currentWorld - 1] || fourSeasons[0];

  return (
    <div ref={containerRef} className="relative w-full h-[520px] sm:h-[580px] bg-stone-900 overflow-hidden select-none">
      {/* 2D HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block focus:outline-none"
        tabIndex={0}
      />

      {/* TOP GAME HUD / STATUS BAR */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between pointer-events-none z-20">
        {/* Left: World / Season Indicator & Quick Teleport Portals */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Current Season Badge */}
          <div className="bg-stone-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-base">{currentSeason.icon}</span>
            <span>{currentSeason.name}</span>
          </div>

          {/* Player Name Badge & VIP Status */}
          <button
            onClick={() => {
              if (onChangeName) onChangeName();
            }}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs shadow-md transition active:scale-95 ${
              isSpecialMember
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-900 border border-amber-300 ring-2 ring-amber-400/40'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600'
            }`}
            title="Click to edit name or view VIP quiz status"
          >
            <span>{isSpecialMember ? '👑' : '⭐'}</span>
            <span className="max-w-[100px] truncate">{playerName || 'Guest'}</span>
            {isSpecialMember && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-amber-600/25 text-stone-900">
                VIP Quizzes
              </span>
            )}
          </button>

          {/* Keepsakes Inventory Button */}
          <button
            id="game-open-inventory-btn"
            onClick={() => {
              soundManager.playClick();
              onOpenInventory();
            }}
            className="bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs sm:text-sm transition-transform active:scale-95"
            title="Open Wedding Keepsakes Backpack (Categorized from Quizzes)"
          >
            <Backpack className="w-4 h-4 text-stone-900" />
            <span>Keepsakes {collectedIds.length}/{gameCollectibles.length}</span>
          </button>

          {/* Quizzes Solved Badge - Clickable to open category keepsakes progress */}
          {isSpecialMember && (
            <button
              id="hud-quizzes-badge-btn"
              onClick={() => {
                soundManager.playClick();
                onOpenInventory();
              }}
              className="hidden md:flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-md transition active:scale-95"
              title="Click to view keepsake categories unlocked by quizzes"
            >
              <span>🧩</span>
              <span>{solvedPuzzleIds.length}/8 Quizzes Counted</span>
            </button>
          )}
        </div>

        {/* Right: Seasonal Teleport Portals & Skip Button */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* 4 Seasons Portal Tabs */}
          <div className="hidden lg:flex items-center gap-1 bg-stone-950/70 backdrop-blur-md p-1 rounded-full border border-white/15">
            {fourSeasons.map((season) => (
              <button
                key={season.id}
                onClick={() => {
                  soundManager.playClick();
                  onSwitchWorld(season.id, 140);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                  currentWorld === season.id
                    ? 'bg-amber-400 text-stone-900 shadow-sm'
                    : 'text-stone-300 hover:text-white hover:bg-white/10'
                }`}
                title={`Fast Travel to ${season.name}`}
              >
                <span>{season.icon}</span>
                <span>{season.season.charAt(0).toUpperCase() + season.season.slice(1)}</span>
              </button>
            ))}
          </div>

          <button
            id="game-skip-adventure-btn"
            onClick={() => {
              soundManager.playClick();
              onOpenSkipModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-rose-600 font-semibold text-xs sm:text-sm shadow-md border border-rose-200 transition-all hover:scale-105 active:scale-95"
            title="Skip game and view wedding card directly"
          >
            <FastForward className="w-4 h-4 text-rose-500" />
            <span className="hidden xs:inline">Skip to Invitation</span>
          </button>
        </div>
      </div>

      {/* Seasonal Navigation Helper Pill (Mobile & Desktop) */}
      <div className="absolute top-12 left-4 pointer-events-none z-10 flex items-center gap-2 text-[11px] text-white/80 bg-stone-900/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
        <span>Gate travel:</span>
        {currentWorld > 1 && <span>◄ Left Gate (Back)</span>}
        {currentWorld > 1 && <span>•</span>}
        <span>Right Gate ({currentWorld === 4 ? '💒 Wedding Gate' : '► Next Season'})</span>
      </div>

      {/* Desktop Key Controls Reminder Hint */}
      <div className="hidden sm:flex absolute bottom-3 left-4 pointer-events-none z-10 items-center gap-2 bg-stone-900/60 backdrop-blur-xs text-white/90 text-[11px] px-3 py-1.5 rounded-xl border border-white/10">
        <span className="font-bold text-amber-300">Controls:</span>
        <span>[A/D or ◄/►] Move</span>
        <span>•</span>
        <span>[Space / W] Jump</span>
        <span>•</span>
        <span>[E / Enter] Open &amp; Travel</span>
      </div>

      {/* Interactive Action Prompt Banner */}
      {interactPrompt && (
        <div className="absolute top-20 inset-x-0 flex justify-center pointer-events-none z-20">
          <div className="bg-stone-900/90 backdrop-blur-md text-amber-300 text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-amber-400/50 shadow-xl animate-bounce flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{interactPrompt}</span>
          </div>
        </div>
      )}

      {/* Mobile Touch Controls */}
      <MobileControls
        onPressLeft={(active) => { keysRef.current.left = active; }}
        onPressRight={(active) => { keysRef.current.right = active; }}
        onPressJump={() => {
          keysRef.current.jump = true;
          setTimeout(() => { keysRef.current.jump = false; }, 120);
        }}
        onPressAction={() => {
          keysRef.current.interact = true;
          setTimeout(() => { keysRef.current.interact = false; }, 200);
        }}
        canInteract={canInteract}
      />
    </div>
  );
};
