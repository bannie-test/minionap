import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Sparkles } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MobileControlsProps {
  onPressLeft: (active: boolean) => void;
  onPressRight: (active: boolean) => void;
  onPressJump: () => void;
  onPressAction: () => void;
  canInteract: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onPressLeft,
  onPressRight,
  onPressJump,
  onPressAction,
  canInteract
}) => {
  return (
    <div className="md:hidden fixed bottom-4 inset-x-0 px-4 flex items-end justify-between pointer-events-none z-30 select-none">
      {/* Direction Pad (Left & Right) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="mobile-btn-left"
          onTouchStart={(e) => { e.preventDefault(); onPressLeft(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onPressLeft(false); }}
          onMouseDown={() => onPressLeft(true)}
          onMouseUp={() => onPressLeft(false)}
          onMouseLeave={() => onPressLeft(false)}
          className="w-14 h-14 rounded-full bg-stone-900/60 active:bg-stone-900/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20 active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        <button
          id="mobile-btn-right"
          onTouchStart={(e) => { e.preventDefault(); onPressRight(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onPressRight(false); }}
          onMouseDown={() => onPressRight(true)}
          onMouseUp={() => onPressRight(false)}
          onMouseLeave={() => onPressRight(false)}
          className="w-14 h-14 rounded-full bg-stone-900/60 active:bg-stone-900/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20 active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Action and Jump Buttons */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Interact Action Button (Highlights when near gift / puzzle / gate) */}
        {canInteract && (
          <button
            id="mobile-btn-action"
            onTouchStart={(e) => { e.preventDefault(); onPressAction(); }}
            onClick={onPressAction}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 active:scale-95 text-stone-950 font-bold flex flex-col items-center justify-center shadow-lg border border-white/40 animate-bounce transition-transform"
            aria-label="Interact"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-tighter">OPEN</span>
          </button>
        )}

        {/* Jump Button */}
        <button
          id="mobile-btn-jump"
          onTouchStart={(e) => { e.preventDefault(); onPressJump(); }}
          onClick={onPressJump}
          className="w-16 h-16 rounded-full bg-rose-500/80 active:bg-rose-600 backdrop-blur-md text-white flex flex-col items-center justify-center shadow-xl border border-white/30 active:scale-95 transition-transform"
          aria-label="Jump"
        >
          <ArrowUp className="w-8 h-8" />
          <span className="text-[10px] font-bold tracking-wider -mt-1 uppercase">JUMP</span>
        </button>
      </div>
    </div>
  );
};
