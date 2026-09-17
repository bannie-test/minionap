import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bus, Hotel, Car, HelpCircle, ChevronDown } from 'lucide-react';
import { weddingFAQ } from '../../config/weddingData';
import { soundManager } from '../../audio/soundManager';

export const InfoSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    soundManager.playClick();
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <section id="info" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
          Guest Guide
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-3">
          Travel &amp; Accommodations
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          Helpful recommendations for your trip to California wine country.
        </p>
      </div>

      {/* 3 Information Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200/80">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 mb-4">
            <Hotel className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
            Hotel Room Blocks
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-3">
            We have reserved discounted room blocks at <strong>The Lodge at Sonoma Resort</strong> and <strong>El Dorado Hotel &amp; Kitchen</strong>.
          </p>
          <span className="text-xs font-semibold text-rose-600">
            Mention "Julian &amp; Sophia Wedding"
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200/80">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
            <Bus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
            Complimentary Shuttles
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-3">
            Shuttles depart the partner hotels at 2:15 PM for the ceremony and provide continuous round-trips from the reception until 1:00 AM.
          </p>
          <span className="text-xs font-semibold text-emerald-600">
            Zero driving stress!
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-stone-200/80">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 mb-4">
            <Car className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">
            Valet &amp; Parking
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-3">
            Complimentary valet parking is provided at both venues. Cars may safely remain overnight at Villa Bella Vista until 11 AM Sunday morning.
          </p>
          <span className="text-xs font-semibold text-stone-500">
            Overnight parking permitted
          </span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-serif font-bold text-stone-900 text-center mb-6">
          Frequently Asked Questions
        </h3>

        <div className="space-y-3">
          {weddingFAQ.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs"
            >
              <button
                id={`faq-toggle-${idx}`}
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left font-medium text-stone-800 text-sm sm:text-base hover:bg-stone-50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${
                    openFaq === idx ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="px-5 pb-5 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
