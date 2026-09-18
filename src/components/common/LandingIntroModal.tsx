import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, FastForward, Heart, Sparkles, User, AlertCircle, Crown, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import { isSpecialGuest, specialGuestList } from '../../config/weddingData';

interface LandingIntroModalProps {
  isOpen: boolean;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onPlay: () => void;
  onSkip: () => void;
}

export const LandingIntroModal: React.FC<LandingIntroModalProps> = ({
  isOpen,
  playerName,
  onPlayerNameChange,
  onPlay,
  onSkip
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartPlay = () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your name to start the journey!');
      soundManager.playWrong();
      return;
    }
    setErrorMsg(null);
    soundManager.ensureContext();
    soundManager.playClick();
    soundManager.startMusic('game');
    onPlay();
  };

  const handleStartSkip = () => {
    soundManager.ensureContext();
    soundManager.playClick();
    soundManager.crossfadeTo('wedding');
    onSkip();
  };

  const displayName = playerName.trim() || 'Your Name';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-7 sm:p-9 text-center overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Minion Character Avatar with Live Floating Name Tag */}
          <div className="relative inline-block mb-3">
            {/* Live Name Tag Floating Above Minion */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 text-amber-300 border border-amber-400 rounded-full text-xs font-bold shadow-md mb-2"
            >
              <span>⭐</span>
              <span className="truncate max-w-[160px] tracking-wide">{displayName}</span>
            </motion.div>

            {/* Minion Character Body */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.1 }}
              className="w-24 h-28 mx-auto bg-amber-400 rounded-3xl border-4 border-amber-500 shadow-xl flex flex-col items-center justify-between p-2 relative overflow-hidden"
            >
              {/* Aviator Goggles */}
              <div className="w-full h-5 bg-stone-800 rounded-full flex items-center justify-center mt-2 relative">
                <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-slate-400 shadow-inner flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-stone-900" />
                  </div>
                </div>
              </div>
              {/* Cute Smile */}
              <div className="w-4 h-2 border-b-2 border-stone-900 rounded-full" />
              {/* Denim Overalls */}
              <div className="w-full h-8 bg-blue-600 rounded-b-2xl flex items-center justify-around px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              </div>
            </motion.div>
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 inline-block mb-2">
            The 4 Seasons Wedding Adventure
          </span>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-1.5">
            Welcome, Honored Guest!
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-serif italic mb-5 max-w-sm mx-auto">
            Travel through Winter, Spring, Summer, and Autumn to reach the Grand Wedding Gate of Julian &amp; Sophia!
          </p>

          {/* Name Input Field - REQUIRED */}
          <div className="max-w-sm mx-auto mb-4 text-left">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Enter Your Name to Begin *</span>
              </label>

              {isSpecialGuest(playerName) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                  <Crown className="w-3 h-3 text-amber-700 fill-amber-500" />
                  <span>VIP Quiz Member</span>
                </span>
              )}
            </div>

            <input
              id="player-name-input"
              type="text"
              required
              autoFocus
              maxLength={24}
              placeholder="e.g. Your name or family name"
              value={playerName}
              onChange={(e) => {
                onPlayerNameChange(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartPlay();
              }}
              className={`w-full px-4 py-2.5 rounded-xl border-2 outline-none text-stone-900 text-sm font-semibold text-center transition ${
                isSpecialGuest(playerName)
                  ? 'border-amber-500 bg-amber-50/90 shadow-sm ring-2 ring-amber-200'
                  : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 bg-amber-50/40'
              }`}
            />
            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            {/* Secret VIP recognition - only shown if their entered name matches the database table */}
            {isSpecialGuest(playerName) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2.5 p-2 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 flex items-center gap-2 text-stone-800 text-xs shadow-xs"
              >
                <Crown className="w-4 h-4 text-amber-600 fill-amber-400 flex-shrink-0" />
                <span><strong>Special Member Recognized!</strong> Secret wedding trivia quizzes unlocked along your path!</span>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="landing-play-adventure-btn"
              onClick={handleStartPlay}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-sm sm:text-base shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>START 4-SEASONS QUEST</span>
            </button>

            <button
              id="landing-skip-adventure-btn"
              onClick={handleStartSkip}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs sm:text-sm transition active:scale-95"
            >
              <FastForward className="w-4 h-4 text-stone-500" />
              <span>SKIP TO INVITATION</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-5">
            🎵 Click to enable sound &amp; joyful music • Gates allow back-and-forth travel
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
