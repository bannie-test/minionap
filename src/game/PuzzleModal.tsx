import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, FastForward, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { Puzzle } from '../types';
import { soundManager } from '../audio/soundManager';

interface PuzzleModalProps {
  puzzle: Puzzle | null;
  isOpen: boolean;
  onSolve: (puzzleId: string) => void;
  onSkip: (puzzleId: string) => void;
  onClose: () => void;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({
  puzzle,
  isOpen,
  onSolve,
  onSkip,
  onClose
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  if (!isOpen || !puzzle) return null;

  const handleSelectOption = (index: number) => {
    soundManager.playClick();
    setSelectedAnswer(index);
    setIsSubmitted(true);
    const correct = index === puzzle.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }
  };

  const handleContinue = () => {
    soundManager.playClick();
    onSolve(puzzle.id);
  };

  const handleSkipPuzzle = () => {
    soundManager.playClick();
    onSkip(puzzle.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border-2 border-amber-200 overflow-hidden text-stone-800"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 px-6 py-4 flex items-center justify-between border-b border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-amber-900 bg-white/60 px-2 py-0.5 rounded-full">
                  {puzzle.category.replace('_', ' ')}
                </span>
                <h3 className="text-lg font-bold text-stone-900 font-display">
                  Wedding Riddle Checkpoint
                </h3>
              </div>
            </div>

            {/* Skip Button */}
            <button
              id="skip-puzzle-btn"
              onClick={handleSkipPuzzle}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 transition shadow-sm"
              title="Skip this puzzle without penalty"
            >
              <FastForward className="w-3.5 h-3.5 text-amber-600" />
              <span>Skip</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <h4 className="text-lg sm:text-xl font-semibold text-stone-800 mb-5 leading-snug">
              {puzzle.question}
            </h4>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {puzzle.options.map((option, idx) => {
                let btnStyle = "border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-stone-800";
                let icon = <span className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-600">{String.fromCharCode(65 + idx)}</span>;

                if (isSubmitted) {
                  if (idx === puzzle.correctAnswer) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-300";
                    icon = <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
                  } else if (selectedAnswer === idx) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-800";
                    icon = <AlertCircle className="w-6 h-6 text-rose-500" />;
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`puzzle-option-${idx}`}
                    disabled={isSubmitted && isCorrect}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all active:scale-[0.99] ${btnStyle}`}
                  >
                    {icon}
                    <span className="text-sm sm:text-base flex-1">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Outcome Feedback */}
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl mb-4 ${
                  isCorrect 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{isCorrect ? '✨' : '🤔'}</span>
                  <div>
                    <h5 className="font-bold text-sm sm:text-base mb-1">
                      {isCorrect ? 'That is spot on!' : 'Are you sure about that?'}
                    </h5>
                    <p className="text-xs sm:text-sm">
                      {isCorrect ? puzzle.explanation : puzzle.funnyReactionWrong || 'Give it another thought or skip ahead!'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <button
                id="puzzle-skip-alt-btn"
                onClick={handleSkipPuzzle}
                className="text-xs text-stone-500 hover:text-stone-700 underline"
              >
                Skip question &amp; continue
              </button>

              {isSubmitted && isCorrect ? (
                <button
                  id="puzzle-continue-btn"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-all active:scale-95"
                >
                  <span>Continue Adventure</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : isSubmitted && !isCorrect ? (
                <button
                  id="puzzle-retry-btn"
                  onClick={() => {
                    soundManager.playClick();
                    setIsSubmitted(false);
                    setSelectedAnswer(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition"
                >
                  <span>Try Again</span>
                </button>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
