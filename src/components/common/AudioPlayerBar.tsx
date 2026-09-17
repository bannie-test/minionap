import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music, Sparkles } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';

interface AudioPlayerBarProps {
  currentChapter: 'game' | 'wedding';
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ currentChapter }) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Monitor sound manager state periodically
    const checkState = () => {
      setIsMuted(soundManager.getMuted());
      setVolume(soundManager.getVolume());
      setIsPlaying(soundManager.getCurrentTrack() !== 'none');
    };
    const timer = setInterval(checkState, 800);
    return () => clearInterval(timer);
  }, []);

  const handleToggleMute = () => {
    soundManager.ensureContext();
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted && soundManager.getCurrentTrack() === 'none') {
      soundManager.startMusic(currentChapter);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundManager.setVolume(val);
    if (isMuted && val > 0) {
      soundManager.setMuted(false);
      setIsMuted(false);
    }
  };

  return (
    <div 
      className="relative flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/80 shadow-md text-stone-700 transition-all hover:bg-white"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      <button
        id="audio-mute-toggle-btn"
        onClick={handleToggleMute}
        className="flex items-center gap-1.5 text-xs font-semibold focus:outline-none transition-transform active:scale-95"
        title={isMuted ? "Unmute sound & music" : "Mute sound & music"}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-stone-400" />
        ) : (
          <Volume2 className="w-4 h-4 text-rose-500 animate-pulse" />
        )}
        <span className="hidden sm:inline text-xs font-medium text-stone-600">
          {isMuted ? 'Muted' : currentChapter === 'game' ? 'Game Music' : 'Romantic BGM'}
        </span>
      </button>

      {/* Mini Visualizer dots */}
      {!isMuted && isPlaying && (
        <div className="flex items-end gap-0.5 h-3">
          <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:0ms] h-2"></span>
          <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:150ms] h-3"></span>
          <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:300ms] h-1.5"></span>
        </div>
      )}

      {/* Volume Slider Popout */}
      {showVolumeSlider && (
        <div className="flex items-center pl-1 border-l border-stone-200">
          <input
            id="audio-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
            aria-label="Volume slider"
          />
        </div>
      )}
    </div>
  );
};
