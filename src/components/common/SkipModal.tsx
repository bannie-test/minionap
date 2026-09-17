import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Play, Sparkles, X } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface SkipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSkip: () => void;
}

export const SkipModal: React.FC<SkipModalProps> = ({ isOpen, onClose, onConfirmSkip }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl border border-amber-100 text-center"
        >
          <button
            id="close-skip-modal-btn"
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
            😄
          </div>

          <h3 className="text-2xl font-bold text-stone-800 mb-2 font-display">
            No time for an adventure?
          </h3>
          <p className="text-stone-600 mb-6 text-sm sm:text-base leading-relaxed">
            That's totally okay! You can jump straight into Julian &amp; Sophia's wedding invitation, schedule, RSVP, and wishes wall.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="confirm-skip-to-invitation-btn"
              onClick={() => {
                soundManager.playClick();
                soundManager.crossfadeTo('wedding');
                onConfirmSkip();
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-medium shadow-md hover:from-rose-600 hover:to-amber-700 transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>View Wedding Invitation</span>
            </button>

            <button
              id="cancel-skip-keep-playing-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium transition-colors active:scale-95"
            >
              <Play className="w-4 h-4 fill-stone-700" />
              <span>Keep Playing</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
