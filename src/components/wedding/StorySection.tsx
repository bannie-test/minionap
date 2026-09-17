import React from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, MapPin } from 'lucide-react';
import { storyMilestones } from '../../config/weddingData';

export const StorySection: React.FC = () => {
  return (
    <section id="story" className="py-20 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-3">
          Our Journey
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-4">
          How Our Story Began
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          From a rainy coffee shop corner in San Francisco to the sun-drenched vineyards of Sonoma, every chapter brought us closer to forever.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Central Connecting Line */}
        <div className="hidden md:block absolute left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-rose-200 via-amber-200 to-rose-300 -translate-x-1/2" />

        <div className="space-y-12 md:space-y-16">
          {storyMilestones.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Timeline Center Node */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white border-2 border-rose-400 shadow-md items-center justify-center text-rose-500 z-10">
                  <Heart className="w-4 h-4 fill-rose-500" />
                </div>

                {/* Content Card */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7 }}
                  className="w-full md:w-[46%] bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                      {item.year}
                    </span>
                    {item.tag && (
                      <span className="text-xs font-semibold text-stone-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-4">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{item.subtitle}</span>
                  </div>

                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>

                {/* Image Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7 }}
                  className="w-full md:w-[46%]"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-md border-4 border-white aspect-[4/3] group">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
