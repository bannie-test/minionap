import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';
import { weddingConfig } from '../../config/weddingData';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="dresscode" className="py-20 px-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-amber-50/70 via-white to-rose-50/50 rounded-3xl p-8 sm:p-12 border border-stone-200/80 shadow-sm text-center">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200 inline-block mb-3">
          Attire Guide
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-2">
          {weddingConfig.dressCode.theme}
        </h2>
        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto mb-8 font-serif">
          {weddingConfig.dressCode.description}
        </p>

        {/* Color Swatches */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest font-bold text-stone-500 mb-4">
            Suggested Color Palette
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {weddingConfig.dressCode.colors.map((c, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-md ring-4 ring-white border border-stone-200/60 mb-2 transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex})`}
                />
                <span className="text-xs font-bold text-stone-800">{c.name}</span>
                <span className="text-[10px] text-stone-500">{c.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lawn & Footwear Friendly Note */}
        <div className="max-w-lg mx-auto bg-white/80 p-4 rounded-2xl border border-stone-200/70 text-xs text-stone-600 flex items-start gap-3 text-left">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{weddingConfig.dressCode.notes}</span>
        </div>
      </div>
    </section>
  );
};
