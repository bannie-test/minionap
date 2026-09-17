import React, { useState, useEffect } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { PuzzleModal } from './game/PuzzleModal';
import { GiftModal } from './game/GiftModal';
import { InventoryDrawer } from './game/InventoryDrawer';
import { GateTransitionOverlay } from './game/GateTransitionOverlay';
import { SkipModal } from './components/common/SkipModal';
import { LandingIntroModal } from './components/common/LandingIntroModal';
import { AudioPlayerBar } from './components/common/AudioPlayerBar';
import { HeroSection } from './components/wedding/HeroSection';
import { StorySection } from './components/wedding/StorySection';
import { DetailsSection } from './components/wedding/DetailsSection';
import { ScheduleSection } from './components/wedding/ScheduleSection';
import { DressCodeSection } from './components/wedding/DressCodeSection';
import { GallerySection } from './components/wedding/GallerySection';
import { InfoSection } from './components/wedding/InfoSection';
import { RsvpSection } from './components/wedding/RsvpSection';
import { WishesSection } from './components/wedding/WishesSection';
import { AdminModal } from './components/wedding/AdminModal';
import { Collectible, Puzzle, WishRecord, RSVPRecord } from './types';
import { initialWishes, weddingConfig } from './config/weddingData';
import { soundManager } from './audio/soundManager';
import { Heart, Gamepad2, Shield, ArrowUp } from 'lucide-react';

export default function App() {
  // Chapter State: 'game' or 'wedding'
  const [activeChapter, setActiveChapter] = useState<'game' | 'wedding'>('game');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showLandingModal, setShowLandingModal] = useState<boolean>(true);

  // Modals
  const [showSkipModal, setShowSkipModal] = useState<boolean>(false);
  const [showGateTransition, setShowGateTransition] = useState<boolean>(false);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [activeGift, setActiveGift] = useState<Collectible | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Game Progress State
  const [currentWorld, setCurrentWorld] = useState<number>(1);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<string[]>([]);
  const [invitationUnlocked, setInvitationUnlocked] = useState<boolean>(false);

  // Persistent Wishes and RSVPs
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);

  // Load saved session on mount
  useEffect(() => {
    try {
      // Load game progress
      const savedProgress = localStorage.getItem('wedding_game_progress');
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setCurrentWorld(parsed.currentWorld || 1);
        setCollectedIds(parsed.collectedIds || []);
        setSolvedPuzzleIds(parsed.solvedPuzzleIds || []);
        if (parsed.invitationUnlocked) {
          setInvitationUnlocked(true);
        }
      }

      // Load wishes
      const savedWishes = localStorage.getItem('wedding_guest_wishes');
      if (savedWishes) {
        setWishes(JSON.parse(savedWishes));
      } else {
        setWishes(initialWishes);
        localStorage.setItem('wedding_guest_wishes', JSON.stringify(initialWishes));
      }

      // Load RSVPs
      const savedRsvps = localStorage.getItem('wedding_admin_rsvps');
      if (savedRsvps) {
        setRsvps(JSON.parse(savedRsvps));
      } else {
        const demoRsvp: RSVPRecord[] = [
          {
            id: 'rsvp_demo1',
            guestName: 'Eleanor & Marcus Vance',
            email: 'eleanor.vance@example.com',
            attendance: 'attending',
            guestCount: 2,
            dietaryRequirements: 'Vegetarian for Eleanor',
            message: 'Thrilled to witness your special day!',
            createdAt: '2026-09-12T14:30:00'
          },
          {
            id: 'rsvp_demo2',
            guestName: 'David Miller',
            email: 'dave.miller@example.com',
            attendance: 'attending',
            guestCount: 1,
            dietaryRequirements: 'None',
            message: 'Ready to toast the groom!',
            createdAt: '2026-09-15T19:42:00'
          }
        ];
        setRsvps(demoRsvp);
        localStorage.setItem('wedding_admin_rsvps', JSON.stringify(demoRsvp));
      }
    } catch (e) {
      console.warn('Storage restore error', e);
    }
  }, []);

  // Save game progress whenever it changes
  const saveProgress = (newWorld: number, newCollected: string[], newSolved: string[], unlocked: boolean) => {
    try {
      const data = {
        currentWorld: newWorld,
        collectedIds: newCollected,
        solvedPuzzleIds: newSolved,
        invitationUnlocked: unlocked,
        lastPlayedAt: new Date().toISOString()
      };
      localStorage.setItem('wedding_game_progress', JSON.stringify(data));
    } catch {}
  };

  // Handlers for Game Events
  const handleCollectItem = (item: Collectible) => {
    if (!collectedIds.includes(item.id)) {
      const updated = [...collectedIds, item.id];
      setCollectedIds(updated);
      saveProgress(currentWorld, updated, solvedPuzzleIds, invitationUnlocked);
    }
    setActiveGift(item);
  };

  const handleOpenPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
  };

  const handleSolvePuzzle = (puzzleId: string) => {
    if (!solvedPuzzleIds.includes(puzzleId)) {
      const updated = [...solvedPuzzleIds, puzzleId];
      setSolvedPuzzleIds(updated);
      saveProgress(currentWorld, collectedIds, updated, invitationUnlocked);
    }
    setActivePuzzle(null);
  };

  const handleSkipPuzzle = (puzzleId: string) => {
    if (!solvedPuzzleIds.includes(puzzleId)) {
      const updated = [...solvedPuzzleIds, puzzleId];
      setSolvedPuzzleIds(updated);
      saveProgress(currentWorld, collectedIds, updated, invitationUnlocked);
    }
    setActivePuzzle(null);
  };

  const handleNextWorld = (worldNum: number) => {
    setCurrentWorld(worldNum);
    saveProgress(worldNum, collectedIds, solvedPuzzleIds, invitationUnlocked);
  };

  const handleReachGate = () => {
    setInvitationUnlocked(true);
    saveProgress(currentWorld, collectedIds, solvedPuzzleIds, true);
    setShowGateTransition(true);
  };

  const handleGateTransitionComplete = () => {
    setShowGateTransition(false);
    setActiveChapter('wedding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectSkipToInvitation = () => {
    setShowSkipModal(false);
    setShowLandingModal(false);
    setInvitationUnlocked(true);
    saveProgress(currentWorld, collectedIds, solvedPuzzleIds, true);
    setActiveChapter('wedding');
    soundManager.crossfadeTo('wedding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReplayGame = () => {
    soundManager.playClick();
    soundManager.crossfadeTo('game');
    setActiveChapter('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Wishes Handlers
  const handleSubmitWish = (guestName: string, message: string, isPrivate: boolean) => {
    const newWish: WishRecord = {
      id: 'wish_' + Date.now(),
      guestName,
      isPrivateName: isPrivate,
      message,
      createdAt: new Date().toISOString(),
      isApproved: true, // auto-approved in demo for instant feedback, can be moderated in admin
      likes: 1
    };
    const updated = [newWish, ...wishes];
    setWishes(updated);
    try {
      localStorage.setItem('wedding_guest_wishes', JSON.stringify(updated));
    } catch {}
  };

  const handleLikeWish = (id: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, likes: w.likes + 1 } : w);
    setWishes(updated);
    try {
      localStorage.setItem('wedding_guest_wishes', JSON.stringify(updated));
    } catch {}
  };

  const handleApproveWish = (id: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, isApproved: true } : w);
    setWishes(updated);
    try {
      localStorage.setItem('wedding_guest_wishes', JSON.stringify(updated));
    } catch {}
  };

  const handleRejectWish = (id: string) => {
    const updated = wishes.map(w => w.id === id ? { ...w, isApproved: false } : w);
    setWishes(updated);
    try {
      localStorage.setItem('wedding_guest_wishes', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteWish = (id: string) => {
    const updated = wishes.filter(w => w.id !== id);
    setWishes(updated);
    try {
      localStorage.setItem('wedding_guest_wishes', JSON.stringify(updated));
    } catch {}
  };

  const handleRsvpSubmitted = (record: RSVPRecord) => {
    const existingIndex = rsvps.findIndex(r => r.id === record.id || r.email.toLowerCase() === record.email.toLowerCase());
    let updated: RSVPRecord[];
    if (existingIndex >= 0) {
      updated = [...rsvps];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...rsvps];
    }
    setRsvps(updated);
    try {
      localStorage.setItem('wedding_admin_rsvps', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800 font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Top Floating Utility Navigation */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200/80 px-4 py-2.5 flex items-center justify-between transition-colors">
        {/* Left: Couple Monogram or Chapter Label */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (activeChapter === 'wedding') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white font-serif font-bold text-xs shadow-xs">
              J&amp;S
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold font-serif text-stone-900 leading-none block">
                Julian &amp; Sophia
              </span>
              <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider block">
                {activeChapter === 'game' ? '2D Adventure Game' : 'Wedding Celebration'}
              </span>
            </div>
          </button>
        </div>

        {/* Center / Navigation Links (When in Wedding Chapter) */}
        {activeChapter === 'wedding' && (
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-stone-600">
            <a href="#hero" className="hover:text-rose-600 transition">Home</a>
            <a href="#story" className="hover:text-rose-600 transition">Our Story</a>
            <a href="#details" className="hover:text-rose-600 transition">Details</a>
            <a href="#schedule" className="hover:text-rose-600 transition">Schedule</a>
            <a href="#gallery" className="hover:text-rose-600 transition">Gallery</a>
            <a href="#rsvp" className="hover:text-rose-600 transition">RSVP</a>
            <a href="#wishes" className="hover:text-rose-600 transition">Wishes</a>
          </nav>
        )}

        {/* Right Controls: Audio Bar + Chapter Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <AudioPlayerBar currentChapter={activeChapter} />

          {activeChapter === 'wedding' ? (
            <button
              id="header-switch-to-game-btn"
              onClick={handleReplayGame}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs border border-amber-300 transition active:scale-95"
              title="Return to 2D Adventure Game"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Play Game</span>
            </button>
          ) : (
            <button
              id="header-skip-to-invitation-btn"
              onClick={() => setShowSkipModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition active:scale-95"
            >
              <span>Skip Adventure</span>
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1">
        {activeChapter === 'game' ? (
          <div className="w-full flex flex-col items-center justify-center">
            <GameCanvas
              currentWorld={currentWorld}
              collectedIds={collectedIds}
              solvedPuzzleIds={solvedPuzzleIds}
              onCollectItem={handleCollectItem}
              onOpenPuzzle={handleOpenPuzzle}
              onReachGate={handleReachGate}
              onNextWorld={handleNextWorld}
              onOpenInventory={() => setShowInventory(true)}
              onOpenSkipModal={() => setShowSkipModal(true)}
            />

            {/* In-Game World Description & Exploration Cards */}
            <div className="w-full max-w-5xl mx-auto px-4 py-8">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200/90 grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🎮</span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Chapter 1: The Adventure</h4>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Explore 3 worlds, leap over hurdles, solve couple riddles, and discover wedding keepsakes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl">🎁</span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Keepsakes Backpack</h4>
                    <p className="text-stone-500 text-xs mt-0.5">
                      Click the backpack icon anytime to inspect memories, road trip photos, and heirloom rings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-3xl">🌸</span>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">The Grand Gate</h4>
                    <p className="text-stone-500 text-xs mt-0.5">
                      At World 3's end, the golden gate unlocks Julian &amp; Sophia's wedding invitation!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chapter 2: The Interactive Wedding Invitation */
          <div className="w-full">
            <HeroSection onReplayGame={handleReplayGame} />
            <StorySection />
            <DetailsSection />
            <ScheduleSection />
            <DressCodeSection />
            <GallerySection />
            <InfoSection />
            <RsvpSection onRsvpSubmitted={handleRsvpSubmitted} />
            <WishesSection
              wishes={wishes}
              onSubmitWish={handleSubmitWish}
              onLikeWish={handleLikeWish}
              onOpenAdmin={() => setShowAdminModal(true)}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-white py-12 px-4 border-t border-stone-800">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <span className="font-serif text-2xl font-bold tracking-tight block text-amber-200">
              {weddingConfig.couple.groom} &amp; {weddingConfig.couple.bride}
            </span>
            <p className="text-stone-400 text-xs mt-1">
              {weddingConfig.couple.weddingDateDisplay} • {weddingConfig.couple.locationDisplay}
            </p>
            <p className="text-rose-400 text-xs font-semibold mt-1">
              {weddingConfig.couple.hashtag}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {activeChapter === 'wedding' && (
              <button
                onClick={handleReplayGame}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold transition"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Replay 2D Game</span>
              </button>
            )}

            <button
              onClick={() => setShowAdminModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Organizer Admin</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS & OVERLAYS */}
      {/* 1. Landing Introduction Modal */}
      <LandingIntroModal
        isOpen={showLandingModal}
        onPlay={() => setShowLandingModal(false)}
        onSkip={handleDirectSkipToInvitation}
      />

      {/* 2. Skip Adventure Confirmation Modal */}
      <SkipModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirmSkip={handleDirectSkipToInvitation}
      />

      {/* 3. Puzzle Riddle Checkpoint Modal */}
      <PuzzleModal
        puzzle={activePuzzle}
        isOpen={activePuzzle !== null}
        onSolve={handleSolvePuzzle}
        onSkip={handleSkipPuzzle}
        onClose={() => setActivePuzzle(null)}
      />

      {/* 4. Gift / Keepsake Inspect Modal */}
      <GiftModal
        collectible={activeGift}
        isOpen={activeGift !== null}
        onClose={() => setActiveGift(null)}
      />

      {/* 5. Inventory Drawer */}
      <InventoryDrawer
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        collectedIds={collectedIds}
        onSelectItem={(item) => {
          setShowInventory(false);
          setActiveGift(item);
        }}
      />

      {/* 6. Grand Wedding Gate Transition */}
      <GateTransitionOverlay
        isOpen={showGateTransition}
        onComplete={handleGateTransitionComplete}
      />

      {/* 7. Organizer Admin Panel Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        wishes={wishes}
        onApproveWish={handleApproveWish}
        onRejectWish={handleRejectWish}
        onDeleteWish={handleDeleteWish}
        rsvps={rsvps}
      />
    </div>
  );
}
