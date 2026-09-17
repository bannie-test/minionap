import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Heart, Send, AlertCircle, Edit2 } from 'lucide-react';
import { RSVPRecord } from '../../types';
import { soundManager } from '../../audio/soundManager';

interface RsvpSectionProps {
  onRsvpSubmitted: (rsvp: RSVPRecord) => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({ onRsvpSubmitted }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    attendance: 'attending' as 'attending' | 'declined',
    guestCount: 1,
    dietaryRequirements: '',
    message: ''
  });

  const [existingRsvp, setExistingRsvp] = useState<RSVPRecord | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('wedding_guest_rsvp');
      if (saved) {
        const parsed = JSON.parse(saved);
        setExistingRsvp(parsed);
        setFormData({
          guestName: parsed.guestName || '',
          email: parsed.email || '',
          attendance: parsed.attendance || 'attending',
          guestCount: parsed.guestCount || 1,
          dietaryRequirements: parsed.dietaryRequirements || '',
          message: parsed.message || ''
        });
      }
    } catch {}
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    if (!formData.guestName.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    setErrorMsg(null);

    const record: RSVPRecord = {
      id: existingRsvp ? existingRsvp.id : 'rsvp_' + Date.now(),
      guestName: formData.guestName.trim(),
      email: formData.email.trim(),
      attendance: formData.attendance,
      guestCount: formData.attendance === 'attending' ? Number(formData.guestCount) : 0,
      dietaryRequirements: formData.dietaryRequirements.trim(),
      message: formData.message.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('wedding_guest_rsvp', JSON.stringify(record));
    } catch {}

    soundManager.playCorrect();
    setExistingRsvp(record);
    setIsEditing(false);
    setIsSuccess(true);
    onRsvpSubmitted(record);
  };

  return (
    <section id="rsvp" className="py-20 px-4 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/90">
        <div className="text-center max-w-lg mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-3">
            RSVP
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 mb-2">
            Will You Join Our Celebration?
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-serif italic">
            Kindly respond by <strong>September 1, 2026</strong> so we may reserve your seat at our table.
          </p>
        </div>

        {/* Existing RSVP Completed Confirmation State */}
        {existingRsvp && !isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-8 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-emerald-950 mb-1">
              {existingRsvp.attendance === 'attending' ? 'See You in Sonoma!' : 'Response Received'}
            </h3>

            <p className="text-emerald-800 text-sm mb-4">
              Thank you, <strong>{existingRsvp.guestName}</strong>! Your response (
              <span className="font-semibold underline">
                {existingRsvp.attendance === 'attending' ? `${existingRsvp.guestCount} Guest(s) Attending` : 'Regretfully Declining'}
              </span>
              ) has been saved.
            </p>

            {existingRsvp.message && (
              <div className="bg-white/80 p-3 rounded-xl max-w-md mx-auto mb-6 text-xs text-stone-600 italic">
                "{existingRsvp.message}"
              </div>
            )}

            <button
              id="edit-rsvp-btn"
              onClick={() => {
                soundManager.playClick();
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-900 text-xs font-semibold shadow-2xs transition"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Modify My RSVP Response</span>
            </button>
          </motion.div>
        ) : (
          /* RSVP Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Attendance Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Your Attendance
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  id="rsvp-attending-btn"
                  onClick={() => {
                    soundManager.playClick();
                    setFormData({ ...formData, attendance: 'attending' });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.attendance === 'attending'
                      ? 'border-rose-500 bg-rose-50/70 text-rose-950 ring-2 ring-rose-200 font-semibold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-sm sm:text-base font-bold">
                    <span>🥂</span>
                    <span>Joyfully Accepts</span>
                  </div>
                  <p className="text-xs text-stone-500">I will be there to celebrate with you!</p>
                </button>

                <button
                  type="button"
                  id="rsvp-declined-btn"
                  onClick={() => {
                    soundManager.playClick();
                    setFormData({ ...formData, attendance: 'declined' });
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    formData.attendance === 'declined'
                      ? 'border-stone-700 bg-stone-100 text-stone-900 ring-2 ring-stone-300 font-semibold shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 text-sm sm:text-base font-bold">
                    <span>💌</span>
                    <span>Regretfully Declines</span>
                  </div>
                  <p className="text-xs text-stone-500">Sending love and best wishes from afar.</p>
                </button>
              </div>
            </div>

            {/* Name and Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  id="rsvp-input-name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Email Address *
                </label>
                <input
                  id="rsvp-input-email"
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm"
                />
              </div>
            </div>

            {/* If Attending: Guests & Dietary */}
            {formData.attendance === 'attending' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2 border-t border-stone-100"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Number of Guests (Including Yourself)
                  </label>
                  <select
                    id="rsvp-select-guest-count"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm bg-white"
                  >
                    <option value={1}>1 Guest (Just Me)</option>
                    <option value={2}>2 Guests (Me + Plus One)</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                    <option value={5}>5 Guests (Family)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                    Dietary Requirements or Allergies
                  </label>
                  <input
                    id="rsvp-input-dietary"
                    type="text"
                    placeholder="e.g. Vegetarian, Gluten-Free, Nut allergy, None"
                    value={formData.dietaryRequirements}
                    onChange={(e) => setFormData({ ...formData, dietaryRequirements: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm"
                  />
                </div>
              </motion.div>
            )}

            {/* Note to the Couple */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Note or Song Request for the DJ
              </label>
              <textarea
                id="rsvp-input-message"
                rows={3}
                placeholder="Can't wait to dance! Please play September by Earth, Wind & Fire!"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Cancel editing
                </button>
              )}
              <button
                type="submit"
                id="rsvp-submit-btn"
                className="ml-auto inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Confirm RSVP Response</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
