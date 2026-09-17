import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, FastForward, Heart, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface LandingIntroModalProps {
  isOpen: boolean;
  onPlay: () => void;
  onSkip: () => void;
}

export const LandingIntroModal: React.FC<LandingIntroModalProps> = ({
  isOpen,
  onPlay,
  onSkip
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-8 sm:p-10 text-center overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

          {/* Little Yellow Explorer Preview Avatar */}
          <div className="relative inline-block mb-4">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
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
              {/* Smile */}
              <div className="w-4 h-2 border-b-2 border-stone-900 rounded-full" />
              {/* Denim Overalls */}
              <div className="w-full h-8 bg-blue-600 rounded-b-2xl flex items-center justify-around px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              </div>
            </motion.div>
          </div>

          <span className="text-xs uppercase tracking-widest font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block mb-2">
            An Interactive Journey
          </span>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-2">
            Something Important
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-serif italic mb-8 max-w-sm mx-auto">
            ...is waiting at the end of this whimsical adventure. Join Bello on a quest for keepsakes leading to a magical celebration!
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="landing-play-adventure-btn"
              onClick={() => {
                soundManager.ensureContext();
                soundManager.playClick();
                soundManager.startMusic('game');
                onPlay();
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-base shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>PLAY ADVENTURE</span>
            </button>

            <button
              id="landing-skip-adventure-btn"
              onClick={() => {
                soundManager.ensureContext();
                soundManager.playClick();
                soundManager.crossfadeTo('wedding');
                onSkip();
              }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition active:scale-95"
            >
              <FastForward className="w-4 h-4 text-stone-500" />
              <span>SKIP ADVENTURE</span>
            </button>
          </div>

          <p className="text-[11px] text-stone-400 mt-6">
            🎵 Click PLAY or SKIP to enable sound &amp; joyful music
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
