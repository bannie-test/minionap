import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sparkles, FastForward, Backpack, Volume2, HelpCircle, Trophy } from 'lucide-react';
import { Collectible, Puzzle } from '../types';
import { gameCollectibles, gamePuzzles } from '../config/weddingData';
import { soundManager } from '../audio/soundManager';
import { MobileControls } from './MobileControls';

interface GameCanvasProps {
  currentWorld: number;
  collectedIds: string[];
  solvedPuzzleIds: string[];
  onCollectItem: (item: Collectible) => void;
  onOpenPuzzle: (puzzle: Puzzle) => void;
  onReachGate: () => void;
  onNextWorld: (world: number) => void;
  onOpenInventory: () => void;
  onOpenSkipModal: () => void;
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

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentWorld,
  collectedIds,
  solvedPuzzleIds,
  onCollectItem,
  onOpenPuzzle,
  onReachGate,
  onNextWorld,
  onOpenInventory,
  onOpenSkipModal
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

  // Game internal state
  const stateRef = useRef({
    player: {
      x: 100,
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
    jumpPads: [] as Array<{ x: number; y: number; width: number; height: number; bounceTimer: number }>,
    collectibles: [] as Array<{ id: string; x: number; y: number; icon: string; collected: boolean; floatPhase: number }>,
    puzzleCheckpoints: [] as Array<{ id: string; x: number; y: number; solved: boolean }>,
    exitGate: { x: 1480, y: 350, width: 80, height: 160, isWeddingGate: false },
    particles: [] as Particle[],
    clouds: [] as Array<{ x: number; y: number; speed: number; scale: number }>
  });

  // Initialize World Geometry & Entities
  const initWorld = useCallback((worldNum: number) => {
    const s = stateRef.current;
    s.player.x = 80;
    s.player.y = 380;
    s.player.vx = 0;
    s.player.vy = 0;
    s.player.state = 'idle';
    s.camera.x = 0;

    // Background clouds
    s.clouds = [
      { x: 100, y: 60, speed: 0.2, scale: 1 },
      { x: 450, y: 110, speed: 0.15, scale: 0.8 },
      { x: 850, y: 80, speed: 0.25, scale: 1.2 },
      { x: 1250, y: 130, speed: 0.18, scale: 0.9 }
    ];

    // Platforms
    s.platforms = [
      // Ground floor spans entire world width
      { x: 0, y: 500, width: 1600, height: 100, type: 'ground' }
    ];

    if (worldNum === 1) {
      // Sunny Garden: Simple gentle platforms
      s.platforms.push(
        { x: 320, y: 410, width: 140, height: 20, type: 'grass' },
        { x: 550, y: 340, width: 150, height: 20, type: 'grass' },
        { x: 780, y: 400, width: 130, height: 20, type: 'grass' },
        { x: 980, y: 330, width: 160, height: 20, type: 'grass' }
      );

      // Playful Garden Snails as obstacles
      s.obstacles = [
        { x: 520, y: 474, width: 36, height: 26, type: 'snail', vx: 0.8, minX: 470, maxX: 650 },
        { x: 920, y: 474, width: 36, height: 26, type: 'snail', vx: -0.7, minX: 850, maxX: 1050 }
      ];

      // Jump Pads
      s.jumpPads = [
        { x: 720, y: 480, width: 44, height: 20, bounceTimer: 0 }
      ];

      // Collectibles
      s.collectibles = [
        { id: 'col_gift1', x: 380, y: 370, icon: '🎁', collected: collectedIds.includes('col_gift1'), floatPhase: 0 },
        { id: 'col_photo1', x: 620, y: 300, icon: '📷', collected: collectedIds.includes('col_photo1'), floatPhase: 1 }
      ];

      // Puzzle Checkpoint
      s.puzzleCheckpoints = [
        { id: 'puz_world1', x: 1100, y: 420, solved: solvedPuzzleIds.includes('puz_world1') }
      ];

      // Exit Gate
      s.exitGate = { x: 1450, y: 370, width: 60, height: 130, isWeddingGate: false };

    } else if (worldNum === 2) {
      // Adventure Forest: Bouncy mushrooms, floating logs
      s.platforms.push(
        { x: 250, y: 420, width: 120, height: 20, type: 'wood' },
        { x: 450, y: 330, width: 130, height: 20, type: 'wood' },
        { x: 680, y: 380, width: 110, height: 20, type: 'wood' },
        { x: 880, y: 280, width: 150, height: 20, type: 'wood' },
        { x: 1120, y: 380, width: 140, height: 20, type: 'wood' }
      );

      // Moving hedgehog / playful obstacles
      s.obstacles = [
        { x: 350, y: 474, width: 34, height: 26, type: 'hedgehog', vx: 1.1, minX: 300, maxX: 430 },
        { x: 800, y: 474, width: 34, height: 26, type: 'hedgehog', vx: -1.2, minX: 740, maxX: 880 },
        { x: 1250, y: 474, width: 34, height: 26, type: 'hedgehog', vx: 1.0, minX: 1190, maxX: 1340 }
      ];

      // Bouncy mushroom pads
      s.jumpPads = [
        { x: 400, y: 480, width: 44, height: 20, bounceTimer: 0 },
        { x: 820, y: 480, width: 44, height: 20, bounceTimer: 0 }
      ];

      // Collectibles
      s.collectibles = [
        { id: 'col_star', x: 510, y: 290, icon: '⭐', collected: collectedIds.includes('col_star'), floatPhase: 0.5 },
        { id: 'col_ring', x: 950, y: 240, icon: '💍', collected: collectedIds.includes('col_ring'), floatPhase: 1.2 }
      ];

      // Puzzle Checkpoint
      s.puzzleCheckpoints = [
        { id: 'puz_world2', x: 1180, y: 420, solved: solvedPuzzleIds.includes('puz_world2') }
      ];

      // Exit Gate
      s.exitGate = { x: 1460, y: 370, width: 60, height: 130, isWeddingGate: false };

    } else {
      // World 3: Golden Wedding Path
      s.platforms.push(
        { x: 260, y: 400, width: 130, height: 20, type: 'cloud' },
        { x: 480, y: 320, width: 140, height: 20, type: 'cloud' },
        { x: 720, y: 390, width: 120, height: 20, type: 'cloud' },
        { x: 940, y: 300, width: 160, height: 20, type: 'cloud' }
      );

      s.obstacles = [
        { x: 620, y: 474, width: 32, height: 26, type: 'sparkler', vx: 0.6, minX: 560, maxX: 680 },
        { x: 850, y: 474, width: 32, height: 26, type: 'sparkler', vx: -0.6, minX: 800, maxX: 920 }
      ];

      s.jumpPads = [
        { x: 420, y: 480, width: 44, height: 20, bounceTimer: 0 },
        { x: 880, y: 480, width: 44, height: 20, bounceTimer: 0 }
      ];

      s.collectibles = [
        { id: 'col_flower', x: 540, y: 280, icon: '🌹', collected: collectedIds.includes('col_flower'), floatPhase: 0.3 },
        { id: 'col_invitation', x: 1020, y: 260, icon: '💌', collected: collectedIds.includes('col_invitation'), floatPhase: 0.8 }
      ];

      s.puzzleCheckpoints = [
        { id: 'puz_world3', x: 1180, y: 420, solved: solvedPuzzleIds.includes('puz_world3') }
      ];

      // The Grand Wedding Gate!
      s.exitGate = { x: 1420, y: 290, width: 100, height: 210, isWeddingGate: true };
    }
  }, [collectedIds, solvedPuzzleIds]);

  useEffect(() => {
    initWorld(currentWorld);
  }, [currentWorld, initWorld]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Resume audio context on first interaction
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

  // Primary Game Animation Loop (60 FPS)
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnParticles = (x: number, y: number, color: string, count = 10) => {
      for (let i = 0; i < count; i++) {
        stateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.8) * 6,
          color,
          size: Math.random() * 5 + 3,
          alpha: 1,
          life: 30 + Math.random() * 20
        });
      }
    };

    const updatePhysics = () => {
      const s = stateRef.current;
      const p = s.player;
      const keys = keysRef.current;

      // Update Invulnerability & State Timers
      if (p.invulnerableTimer > 0) p.invulnerableTimer--;
      if (p.stateTimer > 0) {
        p.stateTimer--;
        if (p.stateTimer === 0 && p.state === 'hit') p.state = 'idle';
      }
      p.blinkTimer = (p.blinkTimer + 1) % 180;

      // Horizontal acceleration & friction
      const moveSpeed = 4.8;
      const acceleration = 0.9;
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
        // Reduced control while comedic hit reaction
        p.vx *= 0.9;
      }

      // Max horizontal speed clamp
      p.vx = Math.max(-moveSpeed, Math.min(moveSpeed, p.vx));
      p.x += p.vx;

      // World boundary clamp
      p.x = Math.max(10, Math.min(s.worldWidth - p.width - 20, p.x));

      // Gravity & Jumping
      const gravity = 0.58;
      p.vy += gravity;

      if (keys.jump && p.isGrounded && p.state !== 'hit') {
        p.vy = -12.5;
        p.isGrounded = false;
        p.state = 'jump';
        soundManager.playJump();
        spawnParticles(p.x + p.width / 2, p.y + p.height, '#fef08a', 5);
      }

      p.y += p.vy;
      p.isGrounded = false;

      // Platform Collision Detection
      for (const plat of s.platforms) {
        // Check if player lands on top
        if (
          p.x + p.width > plat.x &&
          p.x < plat.x + plat.width &&
          p.y + p.height >= plat.y &&
          p.y + p.height <= plat.y + 16 &&
          p.vy >= 0
        ) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.isGrounded = true;
          if (p.state === 'jump') p.state = 'idle';
        }
      }

      // Jump Pads Interaction (Mushroom bounce)
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
          p.vy = -17; // Super bouncy jump!
          p.isGrounded = false;
          p.state = 'jump';
          pad.bounceTimer = 15;
          soundManager.playJump();
          spawnParticles(pad.x + pad.width / 2, pad.y, '#fb7185', 12);
        }
      }

      // Obstacles update and gentle comic bounce
      for (const obs of s.obstacles) {
        obs.x += obs.vx;
        if (obs.x <= obs.minX || obs.x + obs.width >= obs.maxX) {
          obs.vx *= -1;
        }

        // Collision with player
        if (
          p.invulnerableTimer === 0 &&
          p.x + p.width > obs.x + 4 &&
          p.x < obs.x + obs.width - 4 &&
          p.y + p.height > obs.y + 4 &&
          p.y < obs.y + obs.height
        ) {
          // Playful cartoon bounce back without death
          p.state = 'hit';
          p.stateTimer = 25;
          p.invulnerableTimer = 60; // 1 second invulnerability
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

          if (dist < 42) {
            nearbyPrompt = "Press [E] or tap OPEN to inspect Keepsake";
            activeCanInteract = true;

            // Trigger pickup
            if (keys.interact) {
              col.collected = true;
              keys.interact = false;
              soundManager.playCollect();
              soundManager.playGiftOpen();
              spawnParticles(col.x + 18, hoverY, '#f43f5e', 20);

              const matched = gameCollectibles.find(c => c.id === col.id);
              if (matched) {
                onCollectItem(matched);
              }
            }
          }
        }
      }

      // Puzzle Checkpoints
      for (const cp of s.puzzleCheckpoints) {
        if (!cp.solved) {
          const dist = Math.abs((p.x + p.width / 2) - cp.x);
          if (dist < 60) {
            nearbyPrompt = "Press [E] or tap OPEN for Wedding Riddle";
            activeCanInteract = true;

            if (keys.interact) {
              keys.interact = false;
              const puzzle = gamePuzzles[currentWorld];
              if (puzzle) {
                onOpenPuzzle(puzzle);
              }
            }
          }
        }
      }

      // Exit Gate Interaction
      const gateDist = Math.abs((p.x + p.width / 2) - (s.exitGate.x + s.exitGate.width / 2));
      if (gateDist < 70) {
        if (s.exitGate.isWeddingGate) {
          nearbyPrompt = "Press [E] or tap OPEN to unlock Grand Wedding Gate!";
          activeCanInteract = true;
          if (keys.interact) {
            keys.interact = false;
            p.state = 'cheer';
            onReachGate();
          }
        } else {
          nearbyPrompt = `Press [E] or tap OPEN to advance to World ${currentWorld + 1}`;
          activeCanInteract = true;
          if (keys.interact) {
            keys.interact = false;
            soundManager.playGateOpen();
            onNextWorld(currentWorld + 1);
          }
        }
      }

      setInteractPrompt(nearbyPrompt);
      setCanInteract(activeCanInteract);

      // Smooth Camera Tracking (Interpolate target towards player)
      const viewportWidth = canvas.width;
      const targetCamX = p.x - viewportWidth * 0.38;
      const clampedCamX = Math.max(0, Math.min(s.worldWidth - viewportWidth, targetCamX));
      s.camera.x += (clampedCamX - s.camera.x) * 0.1;

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.15; // gravity
        pt.alpha -= 1 / pt.life;
        if (pt.alpha <= 0) {
          s.particles.splice(i, 1);
        }
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

      // 1. SKY GRADIENT (Distinct per world!)
      let skyGradient = ctx.createLinearGradient(0, 0, 0, h);
      if (currentWorld === 1) {
        // Bright Sunny Day
        skyGradient.addColorStop(0, '#bae6fd');
        skyGradient.addColorStop(0.65, '#e0f2fe');
        skyGradient.addColorStop(1, '#fef9c3');
      } else if (currentWorld === 2) {
        // Magical Twilight Forest
        skyGradient.addColorStop(0, '#7c3aed');
        skyGradient.addColorStop(0.4, '#c084fc');
        skyGradient.addColorStop(0.8, '#fbcfe8');
        skyGradient.addColorStop(1, '#fed7aa');
      } else {
        // Golden Romantic Sunset
        skyGradient.addColorStop(0, '#fb7185');
        skyGradient.addColorStop(0.35, '#f43f5e');
        skyGradient.addColorStop(0.7, '#fbbf24');
        skyGradient.addColorStop(1, '#fef3c7');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, w, h);

      // 2. PARALLAX DISTANT HILLS & MOUNTAINS
      ctx.save();
      ctx.translate(-camX * 0.25, 0);
      ctx.fillStyle = currentWorld === 1 ? '#86efac' : currentWorld === 2 ? '#6b21a8' : '#fda4af';
      ctx.beginPath();
      ctx.moveTo(-100, h);
      ctx.bezierCurveTo(200, 320, 500, 420, 800, 340);
      ctx.bezierCurveTo(1100, 260, 1400, 380, 1800, 310);
      ctx.lineTo(2000, h);
      ctx.fill();
      ctx.restore();

      // 3. CLOUDS
      ctx.save();
      ctx.translate(-camX * 0.5, 0);
      for (const cl of s.clouds) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(cl.x, cl.y, 25 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 22 * cl.scale, cl.y - 10 * cl.scale, 30 * cl.scale, 0, Math.PI * 2);
        ctx.arc(cl.x + 50 * cl.scale, cl.y, 24 * cl.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Main Game World Layer (Shifted by camera)
      ctx.save();
      ctx.translate(-camX, 0);

      // 4. PLATFORMS & GROUND
      for (const plat of s.platforms) {
        if (plat.type === 'ground') {
          // Lush grass top
          ctx.fillStyle = currentWorld === 1 ? '#4ade80' : currentWorld === 2 ? '#15803d' : '#f59e0b';
          ctx.fillRect(plat.x, plat.y, plat.width, 16);

          // Earth / Soil below
          const soilGrad = ctx.createLinearGradient(0, plat.y + 16, 0, plat.y + plat.height);
          soilGrad.addColorStop(0, currentWorld === 2 ? '#3b0764' : '#78350f');
          soilGrad.addColorStop(1, currentWorld === 2 ? '#1e1b4b' : '#451a03');
          ctx.fillStyle = soilGrad;
          ctx.fillRect(plat.x, plat.y + 16, plat.width, plat.height - 16);

          // Decorative grass blades
          ctx.fillStyle = currentWorld === 1 ? '#22c55e' : currentWorld === 2 ? '#166534' : '#d97706';
          for (let gx = 0; gx < plat.width; gx += 28) {
            ctx.beginPath();
            ctx.moveTo(gx, plat.y);
            ctx.lineTo(gx + 6, plat.y - 8);
            ctx.lineTo(gx + 12, plat.y);
            ctx.fill();
          }
        } else {
          // Floating wooden/grass/cloud platforms
          if (plat.type === 'cloud') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 12);
            ctx.fill();
            ctx.fillStyle = '#fbcfe8';
            ctx.fillRect(plat.x + 8, plat.y + plat.height - 4, plat.width - 16, 4);
          } else {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
            ctx.fill();
            // Grass topper on platform
            ctx.fillStyle = '#86efac';
            ctx.fillRect(plat.x, plat.y, plat.width, 6);
          }
        }
      }

      // 5. JUMP PADS (Bouncy Spring Mushrooms)
      for (const pad of s.jumpPads) {
        const squash = pad.bounceTimer > 0 ? 0.7 : 1;
        // Mushroom Stem
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(pad.x + 14, pad.y + 8, 16, 12);
        // Mushroom Cap (Red with white spots)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.ellipse(pad.x + 22, pad.y + 8, 22, 10 * squash, 0, 0, Math.PI * 2);
        ctx.fill();
        // White spots
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pad.x + 14, pad.y + 6, 3, 0, Math.PI * 2);
        ctx.arc(pad.x + 22, pad.y + 4, 3.5, 0, Math.PI * 2);
        ctx.arc(pad.x + 30, pad.y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. OBSTACLES (Funny Garden Snails or Hedgehogs)
      for (const obs of s.obstacles) {
        if (obs.type === 'snail') {
          // Snail Shell (Spiral orange)
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();
          // Snail Body (Cream)
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(obs.x + 16 + (obs.vx > 0 ? 4 : -4), obs.y + 20, 16, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          // Eyestalks
          ctx.fillStyle = '#fef08a';
          const headX = obs.vx > 0 ? obs.x + 28 : obs.x + 4;
          ctx.fillRect(headX - 1, obs.y + 6, 3, 8);
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(headX, obs.y + 6, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Hedgehog / Spiky round cutie
          ctx.fillStyle = '#7c2d12';
          ctx.beginPath();
          ctx.arc(obs.x + 16, obs.y + 14, 12, 0, Math.PI * 2);
          ctx.fill();
          // Face
          ctx.fillStyle = '#fed7aa';
          const faceX = obs.vx > 0 ? obs.x + 24 : obs.x + 8;
          ctx.beginPath();
          ctx.arc(faceX, obs.y + 15, 6, 0, Math.PI * 2);
          ctx.fill();
          // Tiny eye
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
          // Sparkle halo
          ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
          ctx.beginPath();
          ctx.arc(col.x + 18, hoverY + 18, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '28px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(col.icon, col.x + 18, hoverY + 24);
        }
      }

      // 8. PUZZLE CHECKPOINT SIGNPOST
      for (const cp of s.puzzleCheckpoints) {
        // Wooden Post
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cp.x - 4, cp.y + 20, 8, 60);

        // Sign Board
        ctx.fillStyle = cp.solved ? '#10b981' : '#f59e0b';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cp.x - 36, cp.y - 12, 72, 36, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cp.solved ? '✨ SOLVED' : '🧩 RIDDLE', cp.x, cp.y + 12);
      }

      // 9. EXIT GATE / GRAND WEDDING GATE
      const gate = s.exitGate;
      if (gate.isWeddingGate) {
        // Grand Majestic Wedding Gate in World 3
        // Stone Columns
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;

        // Left Column
        ctx.fillRect(gate.x, gate.y, 22, gate.height);
        ctx.strokeRect(gate.x, gate.y, 22, gate.height);

        // Right Column
        ctx.fillRect(gate.x + gate.width - 22, gate.y, 22, gate.height);
        ctx.strokeRect(gate.x + gate.width - 22, gate.y, 22, gate.height);

        // Golden Floral Arch Top
        ctx.beginPath();
        ctx.arc(gate.x + gate.width / 2, gate.y + 10, gate.width / 2, Math.PI, 0);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 8;
        ctx.stroke();

        // Golden Gate Doors with Heart Motif
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(gate.x + 22, gate.y + 20, gate.width - 44, gate.height - 20);

        // Heart Emblem
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💍', gate.x + gate.width / 2, gate.y + 70);
        ctx.font = 'bold 12px serif';
        ctx.fillStyle = '#78350f';
        ctx.fillText('JULIAN & SOPHIA', gate.x + gate.width / 2, gate.y + 105);
        ctx.fillText('OCT 2026', gate.x + gate.width / 2, gate.y + 125);
      } else {
        // Standard Level Transition Arch
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.roundRect(gate.x, gate.y, gate.width, gate.height, [20, 20, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '22px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🚪', gate.x + gate.width / 2, gate.y + 60);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`WORLD ${currentWorld + 1}`, gate.x + gate.width / 2, gate.y + 90);
      }

      // 10. PLAYER CHARACTER "BELLO"
      // Yellow cute explorer with goggles and blue overalls
      const px = p.x;
      const py = p.y;
      const pw = p.width;
      const ph = p.height;
      const isHit = p.state === 'hit';
      const isJump = p.state === 'jump';
      const isCheer = p.state === 'cheer';

      // Comic squish/stretch scale
      let scaleX = 1;
      let scaleY = 1;
      if (isJump) {
        scaleX = 0.88;
        scaleY = 1.15;
      } else if (p.isGrounded && Math.abs(p.vx) > 0.5) {
        // Waddle bounce while running
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

      // Feet (Tiny black shoes)
      ctx.fillStyle = '#1c1917';
      const stepOffset = p.state === 'walk' ? Math.sin(Date.now() / 90) * 4 : 0;
      ctx.beginPath();
      ctx.ellipse(-10, ph / 2 - 2 + stepOffset, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(10, ph / 2 - 2 - stepOffset, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Yellow pill shape)
      ctx.fillStyle = isHit ? '#fde047' : '#facc15';
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph - 6, 18);
      ctx.fill();

      // Denim Overalls (Blue pants & straps)
      ctx.fillStyle = '#2563eb';
      // Pants lower half
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

      // Hands / Arms
      ctx.fillStyle = '#facc15';
      if (isCheer) {
        // Hands up high in celebration!
        ctx.fillRect(-pw / 2 - 4, -ph / 2 + 2, 6, 14);
        ctx.fillRect(pw / 2 - 2, -ph / 2 + 2, 6, 14);
      } else {
        ctx.fillRect(-pw / 2 - 3, -6 + stepOffset, 5, 14);
        ctx.fillRect(pw / 2 - 2, -6 - stepOffset, 5, 14);
      }

      // Goggles Strap (Black band wrapping head)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-pw / 2, -18, pw, 6);

      // Goggles Silver Frame
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(2, -15, 11, 0, Math.PI * 2);
      ctx.fill();
      // Goggle Lens (White reflection)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(2, -15, 9, 0, Math.PI * 2);
      ctx.fill();

      // Pupil & Eyes
      if (isHit) {
        // Funny comic 'X' or spiral dizzy eye on hit!
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-2, -19); ctx.lineTo(6, -11);
        ctx.moveTo(6, -19); ctx.lineTo(-2, -11);
        ctx.stroke();
      } else if (p.blinkTimer > 170) {
        // Blinking line
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-3, -15); ctx.lineTo(7, -15);
        ctx.stroke();
      } else {
        // Big happy cartoon eye looking forward
        ctx.fillStyle = '#854d0e'; // Brown hazel eye
        ctx.beginPath();
        ctx.arc(3, -15, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a'; // Pupil
        ctx.beginPath();
        ctx.arc(3.5, -15, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // White twinkle highlight
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4.5, -16.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mouth
      ctx.fillStyle = '#991b1b';
      if (isCheer || isJump) {
        // Big open joyful smile :D
        ctx.beginPath();
        ctx.arc(3, -4, 5, 0, Math.PI);
        ctx.fill();
      } else if (isHit) {
        // Wavy comic mouth ~
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -3);
        ctx.quadraticCurveTo(2, -6, 6, -3);
        ctx.stroke();
      } else {
        // Cute subtle grin :)
        ctx.beginPath();
        ctx.arc(2, -5, 3.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }

      ctx.restore();

      // 11. PARTICLES (Sparks, hearts, confetti)
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
  }, [currentWorld, onCollectItem, onOpenPuzzle, onReachGate, onNextWorld]);

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

  return (
    <div ref={containerRef} className="relative w-full h-[520px] sm:h-[580px] bg-sky-200 overflow-hidden select-none">
      {/* 2D HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block focus:outline-none"
        tabIndex={0}
      />

      {/* TOP GAME HUD / STATUS BAR */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 flex items-center justify-between pointer-events-none z-20">
        {/* Left: World Indicator & Keepsakes count */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* World Badge */}
          <div className="bg-stone-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full border border-white/20 shadow-md flex items-center gap-2 text-xs sm:text-sm font-bold">
            <span className="text-amber-400">
              {currentWorld === 1 ? '🌻' : currentWorld === 2 ? '🌲' : '💍'}
            </span>
            <span>
              World {currentWorld}: {currentWorld === 1 ? 'Sunny Meadow' : currentWorld === 2 ? 'Adventure Trail' : 'Wedding Path'}
            </span>
          </div>

          {/* Keepsakes Inventory Button */}
          <button
            id="game-open-inventory-btn"
            onClick={() => {
              soundManager.playClick();
              onOpenInventory();
            }}
            className="bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 text-xs sm:text-sm transition-transform active:scale-95"
            title="Open Wedding Keepsakes Backpack"
          >
            <Backpack className="w-4 h-4 text-stone-900" />
            <span>{collectedIds.length}/{gameCollectibles.length}</span>
          </button>
        </div>

        {/* Right: Skip Adventure Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
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

      {/* Desktop Key Controls Reminder Hint */}
      <div className="hidden sm:flex absolute bottom-3 left-4 pointer-events-none z-10 items-center gap-2 bg-stone-900/50 backdrop-blur-xs text-white/90 text-[11px] px-3 py-1.5 rounded-xl border border-white/10">
        <span className="font-bold text-amber-300">Controls:</span>
        <span>[A/D or ◄/►] Move</span>
        <span>•</span>
        <span>[Space / W] Jump</span>
        <span>•</span>
        <span>[E / Enter] Open &amp; Interact</span>
      </div>

      {/* Interactive Action Prompt Banner */}
      {interactPrompt && (
        <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none z-20">
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
