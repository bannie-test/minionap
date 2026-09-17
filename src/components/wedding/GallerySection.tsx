import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, ZoomIn } from 'lucide-react';
import { galleryImages } from '../../config/weddingData';
import { GalleryImage } from '../../types';
import { soundManager } from '../../audio/soundManager';

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'engagement', label: 'Engagement' },
    { id: 'travel', label: 'Adventures' },
    { id: 'memories', label: 'Memories' }
  ];

  const filtered = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-3">
          Moments in Time
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-3">
          Photo Gallery
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          Glimpses of quiet smiles, sunset laughter, and the milestones that paved the way to our wedding day.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map((img, idx) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.06 }}
            onClick={() => {
              soundManager.playClick();
              setActiveImage(img);
            }}
            className="group relative rounded-3xl overflow-hidden shadow-sm bg-white border-4 border-white cursor-pointer aspect-[4/3]"
          >
            <img
              src={img.url}
              alt={img.caption}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Hover Caption Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-amber-300 mb-1">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Click to expand</span>
              </span>
              <p className="text-sm font-medium font-serif leading-snug">
                {img.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
            >
              <button
                id="close-lightbox-btn"
                onClick={() => {
                  soundManager.playClick();
                  setActiveImage(null);
                }}
                className="absolute top-4 right-4 z-10 bg-stone-900/80 text-white p-2 rounded-full hover:bg-stone-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-[16/10] w-full bg-stone-950 flex items-center justify-center">
                <img
                  src={activeImage.url}
                  alt={activeImage.caption}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>

              <div className="p-5 text-center bg-stone-900 text-white">
                <p className="text-base font-serif italic text-amber-200">
                  "{activeImage.caption}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
