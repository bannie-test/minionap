import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Send, Sparkles, Lock, Shield, Database, Code, CheckCircle, Copy } from 'lucide-react';
import { WishRecord } from '../../types';
import { soundManager } from '../../audio/soundManager';
import { firebaseWishesGuide } from '../../services/firebaseWishes';

interface WishesSectionProps {
  wishes: WishRecord[];
  playerName?: string;
  onSubmitWish: (guestName: string, message: string, isPrivate: boolean) => void;
  onLikeWish: (id: string) => void;
  onOpenAdmin: () => void;
}

export const WishesSection: React.FC<WishesSectionProps> = ({
  wishes,
  playerName = '',
  onSubmitWish,
  onLikeWish,
  onOpenAdmin
}) => {
  const [name, setName] = useState(playerName);
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submittedAlert, setSubmittedAlert] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (playerName && !name) {
      setName(playerName);
    }
  }, [playerName]);

  const approvedWishes = wishes.filter(w => w.isApproved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    soundManager.playCorrect();
    onSubmitWish(name.trim(), message.trim(), isPrivate);
    setMessage('');
    setIsPrivate(false);
    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 5000);
  };

  const copyFirebaseCode = () => {
    navigator.clipboard.writeText(firebaseWishesGuide.sampleCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <section id="wishes" className="py-20 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs uppercase tracking-widest font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 inline-block mb-3">
          Guest Book &amp; Blessings
        </span>
        <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-3">
          Leave Us a Little Love
        </h2>
        <p className="text-stone-600 text-sm sm:text-base italic font-serif">
          Your heartfelt words and blessings will become a cherished part of our wedding memories.
        </p>
      </div>

      {/* Submission Form Card */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 mb-16">
        {submittedAlert ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center text-rose-900"
          >
            <span className="text-3xl mb-2 block">💌</span>
            <h4 className="font-bold font-serif text-lg mb-1">Thank you so much!</h4>
            <p className="text-xs sm:text-sm text-rose-700">
              Your lovely wish has been received and added to our memories!
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Your Name *
              </label>
              <input
                id="wish-input-name"
                type="text"
                required
                placeholder="e.g. Grandma Rose &amp; Uncle Leo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Your Wedding Wish or Message *
              </label>
              <textarea
                id="wish-input-message"
                rows={3}
                required
                placeholder="Wishing you both endless joy, laughter, and magical adventures together..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-900 text-sm resize-none"
              />
            </div>

            {/* Private name checkbox */}
            <div className="flex items-center gap-2">
              <input
                id="wish-input-private"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-stone-300"
              />
              <label htmlFor="wish-input-private" className="text-xs text-stone-600 cursor-pointer">
                Keep my name private (display as "A Happy Well-Wisher")
              </label>
            </div>

            <button
              type="submit"
              id="submit-wish-btn"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md transition active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span>Send Wedding Wish ❤️</span>
            </button>
          </form>
        )}
      </div>

      {/* Animated Wishing Wall / Floating Cards */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-serif text-stone-900">
            Our Wishes Wall
          </h3>
          <p className="text-xs sm:text-sm text-stone-500">
            Messages of love from our beloved friends and family
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {approvedWishes.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-stone-200/80 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <p className="text-stone-700 text-sm sm:text-base font-serif italic leading-relaxed mb-4">
                "{item.message}"
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-xs font-bold text-stone-900">
                  — {item.isPrivateName ? 'A Happy Well-Wisher' : item.guestName}
                </span>

                {/* Heart Reaction Like Button */}
                <button
                  id={`like-wish-${item.id}`}
                  onClick={() => {
                    soundManager.playCollect();
                    onLikeWish(item.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition active:scale-90"
                  title="Like this wish"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{item.likes}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Firebase Firestore Database Architecture Showcase Card */}
      <div className="mb-12 bg-gradient-to-r from-amber-50 to-rose-50 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/30 flex items-center justify-center text-amber-800">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg flex items-center gap-2">
                <span>Google Firebase Firestore Database</span>
                <span className="text-[10px] font-sans uppercase font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                  Recommended Architecture
                </span>
              </h4>
              <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
                Real-time synchronized guest blessings, atomic like counters, and robust security rules.
              </p>
            </div>
          </div>

          <button
            id="open-firebase-guide-btn"
            onClick={() => setShowFirebaseModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex-shrink-0"
          >
            <Code className="w-4 h-4" />
            <span>View Firebase Setup Guide</span>
          </button>
        </div>
      </div>

      {/* Discreet Admin Moderation trigger */}
      <div className="text-center pt-8 border-t border-stone-200/60 flex flex-wrap items-center justify-center gap-4">
        <button
          id="open-admin-panel-btn"
          onClick={() => {
            soundManager.playClick();
            onOpenAdmin();
          }}
          className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-700 transition"
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Organizer Admin Dashboard &amp; RSVP Moderation</span>
        </button>

        <span className="text-stone-300">•</span>

        <button
          onClick={() => setShowFirebaseModal(true)}
          className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-semibold transition"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Firebase Database Schema</span>
        </button>
      </div>

      {/* Firebase Firestore Setup Modal */}
      <AnimatePresence>
        {showFirebaseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      Firebase Firestore Wishes Database
                    </h3>
                    <p className="text-xs text-stone-500">
                      How to store, sync, and secure wedding wishes in Google Firebase
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowFirebaseModal(false)}
                  className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Collection Schema */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                  <span>1. Firestore Collection Schema</span>
                  <code className="text-stone-900 font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded">
                    wedding_wishes
                  </code>
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-stone-100 p-2 font-bold text-stone-700">
                    <span>Field</span>
                    <span>Type</span>
                    <span>Description</span>
                  </div>
                  {firebaseWishesGuide.fields.map((f, i) => (
                    <div key={i} className="grid grid-cols-3 p-2 border-t border-stone-200 text-stone-600">
                      <span className="font-mono text-stone-900 font-semibold">{f.field}</span>
                      <span className="text-amber-700">{f.type}</span>
                      <span>{f.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Firestore Security Rules */}
              <div className="mb-6">
                <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-800 mb-2">
                  2. Security Rules (firestore.rules)
                </h4>
                <pre className="bg-stone-900 text-emerald-300 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {firebaseWishesGuide.firestoreRules}
                </pre>
              </div>

              {/* Step 3: TypeScript / JS SDK Snippet */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-800">
                    3. Live Sync &amp; Submission SDK Code
                  </h4>
                  <button
                    onClick={copyFirebaseCode}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                  >
                    {copiedCode ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="bg-stone-950 text-stone-200 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed max-h-64">
                  {firebaseWishesGuide.sampleCodeSnippet}
                </pre>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-200">
                <button
                  onClick={() => setShowFirebaseModal(false)}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800"
                >
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
