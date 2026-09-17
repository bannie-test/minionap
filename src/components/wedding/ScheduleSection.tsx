import React from 'react';
import { motion } from 'motion/react';
import { weddingSchedule } from '../../config/weddingData';

export const ScheduleSection: React.FC = () => {
  return (
    <section id="schedule" className="py-20 px-4 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-3">
          The Day's Flow
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-3">
          Wedding Schedule
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          From the first welcoming glass to the sparkler grand exit under the stars.
        </p>
      </div>

      <div className="space-y-4">
        {weddingSchedule.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-stone-200/80 hover:border-amber-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            {/* Time Badge */}
            <div className="flex items-center gap-4 sm:w-48">
              <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900 font-serif font-bold text-sm sm:text-base whitespace-nowrap">
                {item.time}
              </span>
            </div>

            {/* Event Description */}
            <div className="flex-1">
              <h3 className="text-lg font-serif font-bold text-stone-900 mb-0.5">
                {item.title}
              </h3>
              <p className="text-xs font-semibold text-rose-600 mb-1">
                📍 {item.location}
              </p>
              <p className="text-stone-600 text-xs sm:text-sm">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
