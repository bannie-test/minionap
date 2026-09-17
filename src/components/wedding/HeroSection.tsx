import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, Calendar, MapPin, ChevronDown, Gamepad2, Sparkles } from 'lucide-react';
import { weddingConfig } from '../../config/weddingData';
import { soundManager } from '../../audio/soundManager';

interface HeroSectionProps {
  onReplayGame: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onReplayGame }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date(weddingConfig.couple.weddingDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    soundManager.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 overflow-hidden bg-gradient-to-b from-amber-50/70 via-rose-50/40 to-stone-50">
      {/* Delicate floating background decorative elements */}
      <div className="absolute top-10 left-10 text-rose-200/50 text-7xl select-none font-serif">❦</div>
      <div className="absolute bottom-12 right-12 text-amber-200/50 text-7xl select-none font-serif">❧</div>

      {/* Top Banner Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100/70 border border-rose-200/80 text-rose-800 text-xs sm:text-sm uppercase tracking-widest font-semibold mb-6 shadow-xs"
      >
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
        <span>We Are Getting Married</span>
        <Sparkles className="w-3.5 h-3.5 text-rose-500" />
      </motion.div>

      {/* Couple Names */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif text-stone-900 tracking-tight leading-none mb-3">
          <span>{weddingConfig.couple.groom}</span>
          <span className="block my-2 text-rose-500 font-script text-3xl sm:text-5xl md:text-6xl">&amp;</span>
          <span>{weddingConfig.couple.bride}</span>
        </h1>

        <p className="text-stone-500 italic text-sm sm:text-base md:text-lg max-w-md mx-auto mb-8 font-serif">
          "{weddingConfig.couple.tagline}"
        </p>
      </motion.div>

      {/* Date & Location Pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-stone-700 text-sm sm:text-base font-medium mb-10 bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-stone-200/60"
      >
        <div className="flex items-center gap-2 text-stone-800">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>{weddingConfig.couple.weddingDateDisplay}</span>
        </div>
        <span className="hidden sm:inline text-stone-300">•</span>
        <div className="flex items-center gap-2 text-stone-800">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>{weddingConfig.couple.locationDisplay}</span>
        </div>
      </motion.div>

      {/* Countdown Timer Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md w-full mx-auto mb-10"
      >
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Minutes', value: timeLeft.minutes },
          { label: 'Seconds', value: timeLeft.seconds }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center"
          >
            <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 leading-none mb-1">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-stone-500">
              {item.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="flex flex-wrap items-center justify-center gap-4"
      >
        <button
          id="hero-rsvp-btn"
          onClick={() => scrollToSection('rsvp')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-md hover:shadow-lg transition-all active:scale-95 text-sm sm:text-base"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span>RSVP Attendance</span>
        </button>

        <button
          id="hero-wishes-btn"
          onClick={() => scrollToSection('wishes')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-amber-50 text-stone-800 font-medium border border-stone-300 shadow-xs transition-all active:scale-95 text-sm sm:text-base"
        >
          <span>Leave a Wish</span>
          <span className="text-rose-500">❤️</span>
        </button>

        {/* Replay Adventure Button */}
        <button
          id="hero-replay-game-btn"
          onClick={onReplayGame}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-amber-100/90 hover:bg-amber-200 text-amber-900 font-semibold text-xs sm:text-sm border border-amber-300 transition-all active:scale-95"
          title="Play the 2D Adventure Game again"
        >
          <Gamepad2 className="w-4 h-4 text-amber-700" />
          <span>Replay Adventure Game</span>
        </button>
      </motion.div>

      {/* Bottom Scroll Cue */}
      <div className="mt-12 flex flex-col items-center gap-1 text-stone-400">
        <span className="text-xs uppercase tracking-widest font-semibold">Scroll to explore</span>
        <button
          onClick={() => scrollToSection('story')}
          className="p-1 rounded-full text-stone-400 hover:text-stone-700 transition animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
