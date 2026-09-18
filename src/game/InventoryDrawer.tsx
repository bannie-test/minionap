import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, Lock, Gift } from 'lucide-react';
import { Collectible, KeepsakeCategoryId } from '../types';
import { gameCollectibles, KEEPSAKE_CATEGORIES, getCategoryProgress } from '../config/weddingData';
import { soundManager } from '../audio/soundManager';

interface InventoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  collectedIds: string[];
  solvedPuzzleIds?: string[];
  onSelectItem: (item: Collectible) => void;
}

export const InventoryDrawer: React.FC<InventoryDrawerProps> = ({
  isOpen,
  onClose,
  collectedIds,
  solvedPuzzleIds = [],
  onSelectItem
}) => {
  const [selectedCategory, setSelectedCategory] = useState<KeepsakeCategoryId | 'all'>('all');

  if (!isOpen) return null;

  const categoryProgress = getCategoryProgress(collectedIds, solvedPuzzleIds);
  const totalKeepsakes = gameCollectibles.length;
  const unlockedCount = collectedIds.length;

  const filteredItems = selectedCategory === 'all'
    ? gameCollectibles
    : gameCollectibles.filter(item => item.category === selectedCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-stone-200"
        >
          {/* Header */}
          <div className="p-5 border-b border-stone-100 bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-display flex items-center gap-2">
                  <span>🎒</span>
                  <span>Wedding Keepsakes</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  <strong className="text-amber-900 font-bold">{unlockedCount} of {totalKeepsakes}</strong> keepsakes unlocked from seasonal quizzes
                </p>
              </div>
              <button
                id="close-inventory-drawer-btn"
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-white/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Progress Matrix */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryProgress.map((item) => {
                const cat = item.category;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    id={`cat-card-${cat.id}`}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-white ring-2 ring-amber-300 shadow-sm'
                        : 'border-stone-200 bg-white/75 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-[11px] font-bold text-stone-700 font-mono">
                        {item.collectedKeepsakes}/{item.totalKeepsakes}
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-stone-800 truncate mt-1">
                      {cat.name}
                    </div>
                    {/* Small Progress Bar */}
                    <div className="w-full bg-stone-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(item.collectedKeepsakes / item.totalKeepsakes) * 100}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto text-xs bg-stone-50">
            <button
              id="cat-tab-all"
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory('all');
              }}
              className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All ({unlockedCount}/{totalKeepsakes})
            </button>
            {KEEPSAKE_CATEGORIES.map((cat) => {
              const count = collectedIds.filter(id => {
                const item = gameCollectibles.find(c => c.id === id);
                return item?.category === cat.id;
              }).length;
              const total = gameCollectibles.filter(c => c.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  id={`cat-tab-${cat.id}`}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition flex items-center gap-1 ${
                    selectedCategory === cat.id
                      ? 'bg-stone-800 text-white shadow-xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name.split(' ')[0]}</span>
                  <span className="opacity-75 text-[10px]">({count}/{total})</span>
                </button>
              );
            })}
          </div>

          {/* Keepsakes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredItems.map((item) => {
              const isCollected = collectedIds.includes(item.id);
              const cat = KEEPSAKE_CATEGORIES.find(c => c.id === item.category);

              return (
                <div
                  key={item.id}
                  id={`inventory-item-${item.id}`}
                  onClick={() => {
                    if (isCollected) {
                      soundManager.playClick();
                      onSelectItem(item);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isCollected
                      ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-100/60 cursor-pointer shadow-xs'
                      : 'border-dashed border-stone-200 bg-stone-50/70 opacity-65'
                  }`}
                >
                  {/* Keepsake Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner flex-shrink-0 mt-0.5 ${
                      isCollected ? 'bg-amber-200/80 text-amber-900 ring-2 ring-amber-300/60' : 'bg-stone-200 text-stone-400'
                    }`}
                  >
                    {isCollected ? item.icon : <Lock className="w-5 h-5 text-stone-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cat?.badgeColor || 'bg-stone-100 text-stone-600'}`}>
                        {cat?.icon} {cat?.name}
                      </span>
                      <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap">
                        World {item.world}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-stone-900 truncate">
                      {isCollected ? item.title : 'Undiscovered Keepsake'}
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                      {isCollected ? item.description : 'Solve the VIP quiz along the adventure path to unlock this wedding gift.'}
                    </p>

                    {/* Source Quiz Link & Status */}
                    <div className="mt-2 pt-2 border-t border-stone-100/80 flex items-center justify-between text-[11px]">
                      {isCollected ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">Unlocked by Quiz: {item.sourceQuizTitle || 'Seasonal Riddle'}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-stone-400">
                          <Lock className="w-3 h-3 text-stone-400" />
                          <span className="truncate">Quiz: {item.sourceQuizTitle || 'Seasonal Riddle'} (World {item.world})</span>
                        </div>
                      )}

                      {isCollected && (
                        <span className="text-[10px] font-bold text-amber-700 underline flex-shrink-0">
                          Inspect ➜
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Summary */}
          <div className="p-4 border-t border-stone-100 bg-stone-50 text-center">
            <p className="text-xs text-stone-600">
              {unlockedCount === totalKeepsakes ? (
                <span className="text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  All 8 wedding keepsakes unlocked across all 4 categories!
                </span>
              ) : (
                <span>
                  Answer the seasonal riddles on your path to collect all <strong>{totalKeepsakes} keepsakes</strong>!
                </span>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
