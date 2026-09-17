import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Clock, Calendar, ExternalLink, Download } from 'lucide-react';
import { weddingConfig } from '../../config/weddingData';
import { soundManager } from '../../audio/soundManager';

export const DetailsSection: React.FC = () => {
  // Generate downloadable .ics calendar file
  const handleDownloadICS = () => {
    soundManager.playClick();
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Julian and Sophia Wedding//EN',
      'BEGIN:VEVENT',
      'UID:wedding-julian-sophia-2026@wedding.com',
      'DTSTAMP:20260917T120000Z',
      'DTSTART:20261024T223000Z',
      'DTEND:20261025T070000Z',
      'SUMMARY:Wedding of Julian Alexander & Sophia Claire',
      `DESCRIPTION:${weddingConfig.ceremony.title} at ${weddingConfig.ceremony.venue} followed by Reception at ${weddingConfig.reception.venue}.`,
      `LOCATION:${weddingConfig.ceremony.venue}, ${weddingConfig.ceremony.address}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Julian_and_Sophia_Wedding.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Wedding+of+Julian+%26+Sophia&dates=20261024T223000Z/20261025T070000Z&details=Julian+Alexander+%26+Sophia+Claire+Wedding+Celebration&location=${encodeURIComponent(weddingConfig.ceremony.venue + ', ' + weddingConfig.ceremony.address)}`;

  return (
    <section id="details" className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
          When &amp; Where
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-3">
          Wedding Details
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          Join us in the picturesque heart of Sonoma Valley as we exchange vows and celebrate beneath the stars.
        </p>

        {/* Add to Calendar Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            id="download-ics-btn"
            onClick={handleDownloadICS}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>Download Calendar Event (.ics)</span>
          </button>
          <a
            id="google-cal-link"
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playClick()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Add to Google Calendar</span>
          </a>
        </div>
      </div>

      {/* Two Venue Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Ceremony Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6">
              💍
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Part One</span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1 mb-2">
              {weddingConfig.ceremony.title}
            </h3>
            <h4 className="text-lg font-semibold text-stone-700 mb-4">
              {weddingConfig.ceremony.venue}
            </h4>

            <div className="space-y-3 text-stone-600 text-sm mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Ceremony Time: </span>
                  <span>{weddingConfig.ceremony.time}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Address: </span>
                  <span>{weddingConfig.ceremony.address}</span>
                </div>
              </div>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-6 italic bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
              "{weddingConfig.ceremony.details}"
            </p>
          </div>

          <a
            id="ceremony-maps-btn"
            href={weddingConfig.ceremony.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playClick()}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-sm transition"
          >
            <span>View Ceremony on Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Reception Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/80 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6">
              🥂
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Part Two</span>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mt-1 mb-2">
              {weddingConfig.reception.title}
            </h3>
            <h4 className="text-lg font-semibold text-stone-700 mb-4">
              {weddingConfig.reception.venue}
            </h4>

            <div className="space-y-3 text-stone-600 text-sm mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Reception Time: </span>
                  <span>{weddingConfig.reception.time}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-stone-800">Address: </span>
                  <span>{weddingConfig.reception.address}</span>
                </div>
              </div>
            </div>

            <p className="text-stone-600 text-sm leading-relaxed mb-6 italic bg-amber-50/40 p-4 rounded-2xl border border-amber-100">
              "{weddingConfig.reception.details}"
            </p>
          </div>

          <a
            id="reception-maps-btn"
            href={weddingConfig.reception.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playClick()}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-sm transition"
          >
            <span>View Reception on Google Maps</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
