import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, X, Check } from 'lucide-react';
import { Collectible } from '../types';
import { soundManager } from '../audio/soundManager';

interface GiftModalProps {
  collectible: Collectible | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ collectible, isOpen, onClose }) => {
  if (!isOpen || !collectible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-rose-100 overflow-hidden text-center"
        >
          {/* Top Decorative Sparkles */}
          <div className="bg-gradient-to-b from-rose-100/70 to-white pt-8 pb-4 px-6 relative">
            <button
              id="close-gift-modal-x"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon Container */}
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-300 via-rose-300 to-amber-200 flex items-center justify-center text-4xl shadow-lg ring-4 ring-white">
                {collectible.icon}
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 text-amber-500"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200/60 px-3 py-1 rounded-full">
              Found Something Special!
            </span>

            <h3 className="text-2xl font-bold text-stone-900 mt-2 font-display">
              {collectible.title}
            </h3>
            <p className="text-stone-500 text-xs mt-1">
              {collectible.description}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 pt-2">
            {collectible.rewardContent && (
              <div className="bg-amber-50/60 rounded-2xl p-5 border border-amber-200/50 mb-6 text-left shadow-inner">
                {collectible.rewardContent.date && (
                  <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
                    {collectible.rewardContent.date}
                  </div>
                )}
                <h4 className="text-base font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{collectible.rewardContent.title}</span>
                </h4>
                <p className="text-stone-600 text-sm leading-relaxed italic">
                  "{collectible.rewardContent.text}"
                </p>
              </div>
            )}

            <button
              id="gift-modal-collect-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Save to Keepsakes &amp; Continue</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
