import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GateTransitionOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const GateTransitionOverlay: React.FC<GateTransitionOverlayProps> = ({
  isOpen,
  onComplete
}) => {
  useEffect(() => {
    if (!isOpen) return;

    soundManager.playGateOpen();
    soundManager.crossfadeTo('wedding');

    // Shower of rose gold, gold, and pink petals
    const end = Date.now() + 2800;
    const colors = ['#f43f5e', '#fbbf24', '#f472b6', '#fed7aa', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    const timer = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => clearTimeout(timer);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Radiant Golden Glow Beam */}
      <motion.div
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 2.5 }}
        transition={{ duration: 1.8, ease: 'easeOut' }}
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 blur-3xl opacity-80"
      />

      {/* Left Gate Door Swinging Open */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: -85 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'left center' }}
        className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-r-4 border-amber-400 shadow-2xl flex items-center justify-end pr-8"
      >
        <div className="text-amber-400/40 text-7xl font-serif">❦</div>
      </motion.div>

      {/* Right Gate Door Swinging Open */}
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 85 }}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'right center' }}
        className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-stone-900 via-amber-950 to-stone-900 border-l-4 border-amber-400 shadow-2xl flex items-center justify-start pl-8"
      >
        <div className="text-amber-400/40 text-7xl font-serif">❧</div>
      </motion.div>

      {/* Central Floating Golden Ring & Message */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1.2, type: 'spring' }}
        className="relative z-10 text-center px-6 py-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-amber-300 max-w-sm"
      >
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-rose-400 rounded-full flex items-center justify-center text-white shadow-lg">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <p className="text-xs uppercase tracking-widest font-bold text-amber-800">
          The Adventure Has Led Here
        </p>
        <h2 className="text-3xl font-bold font-serif text-stone-900 mt-1 mb-2">
          Welcome to Our Wedding
        </h2>
        <p className="text-stone-600 text-xs italic">
          Julian &amp; Sophia invite you to celebrate love, friendship, and family.
        </p>
      </motion.div>
    </div>
  );
};
