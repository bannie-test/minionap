import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart } from 'lucide-react';
import { Collectible } from '../types';
import { gameCollectibles } from '../config/weddingData';
import { soundManager } from '../audio/soundManager';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collectedIds: string[];
  onSelectItem: (item: Collectible) => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  collectedIds,
  onSelectItem
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-sm h-full bg-white shadow-2xl flex flex-col border-l border-stone-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-amber-50/50">
            <div>
              <h3 className="text-xl font-bold text-stone-800 font-display flex items-center gap-2">
                <span>🎒</span>
                <span>Wedding Keepsakes</span>
              </h3>
              <p className="text-xs text-stone-500">
                {collectedIds.length} of {gameCollectibles.length} items collected
              </p>
            </div>
            <button
              id="close-inventory-drawer-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List of items */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {gameCollectibles.map((item) => {
              const isCollected = collectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isCollected) {
                      soundManager.playClick();
                      onSelectItem(item);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    isCollected
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 cursor-pointer shadow-xs'
                      : 'border-dashed border-stone-200 bg-stone-50 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner ${
                      isCollected ? 'bg-amber-200/80 text-amber-900' : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    {isCollected ? item.icon : '❓'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-stone-800 truncate">
                        {isCollected ? item.title : 'Undiscovered Memory'}
                      </h4>
                      <span className="text-[10px] font-semibold text-stone-400 uppercase">
                        World {item.world}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 truncate">
                      {isCollected ? item.description : 'Explore the adventure map to find this keepsake.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
            <p className="text-xs text-stone-500">
              Collect all wedding keepsakes to unlock special memory clues!
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
