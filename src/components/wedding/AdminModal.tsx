import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Check,
  Trash2,
  ShieldCheck,
  Download,
  Users,
  MessageSquare,
  Gift,
  HelpCircle,
  Calendar,
  Gamepad2,
  Search,
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';
import { WishRecord, RSVPRecord } from '../../types';
import { soundManager } from '../../audio/soundManager';
import {
  AdminKeepsakeItem,
  AdminQuizItem,
  AdminTimelineEvent,
  AdminPlayerProgress,
  subscribeToKeepsakesTable,
  subscribeToQuizzesTable,
  subscribeToTimelineTable,
  subscribeToPlayerProgress,
  seedCatalogTablesToFirestore,
  FIREBASE_CONSOLE_URL
} from '../../services/firebaseAdminTables';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishes: WishRecord[];
  onApproveWish: (id: string) => void;
  onRejectWish: (id: string) => void;
  onDeleteWish: (id: string) => void;
  rsvps: RSVPRecord[];
}

type AdminTab = 'rsvps' | 'wishes' | 'keepsakes' | 'quizzes' | 'timeline' | 'progress';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  wishes,
  onApproveWish,
  onRejectWish,
  onDeleteWish,
  rsvps
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('rsvps');
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore Tables Data
  const [keepsakesTable, setKeepsakesTable] = useState<AdminKeepsakeItem[]>([]);
  const [quizzesTable, setQuizzesTable] = useState<AdminQuizItem[]>([]);
  const [timelineTable, setTimelineTable] = useState<AdminTimelineEvent[]>([]);
  const [progressTable, setProgressTable] = useState<AdminPlayerProgress[]>([]);

  // Subscribe to Firestore Tables on open
  useEffect(() => {
    if (!isOpen) return;

    // Seed catalog tables to Firestore if database is empty
    seedCatalogTablesToFirestore();

    const unsubKeepsakes = subscribeToKeepsakesTable((items) => setKeepsakesTable(items));
    const unsubQuizzes = subscribeToQuizzesTable((items) => setQuizzesTable(items));
    const unsubTimeline = subscribeToTimelineTable((items) => setTimelineTable(items));
    const unsubProgress = subscribeToPlayerProgress((items) => setProgressTable(items));

    return () => {
      unsubKeepsakes();
      unsubQuizzes();
      unsubTimeline();
      unsubProgress();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Stats
  const totalAttending = rsvps
    .filter(r => r.attendance === 'attending')
    .reduce((sum, r) => sum + r.guestCount, 0);
  const totalDeclined = rsvps.filter(r => r.attendance === 'declined').length;
  const pendingWishesCount = wishes.filter(w => !w.isApproved).length;

  // CSV Exporters
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    soundManager.playClick();
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRsvps = () => {
    const headers = ['Name', 'Email', 'Attendance', 'Guest Count', 'Dietary Requirements', 'Message', 'Submitted At'];
    const rows = rsvps.map(r => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.attendance}"`,
      r.guestCount,
      `"${(r.dietaryRequirements || '').replace(/"/g, '""')}"`,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${r.createdAt}"`
    ]);
    downloadCsv('Wedding_RSVP_List.csv', headers, rows);
  };

  const handleExportWishes = () => {
    const headers = ['ID', 'Guest Name', 'Private', 'Message', 'Approved', 'Likes', 'Submitted At'];
    const rows = wishes.map(w => [
      `"${w.id}"`,
      `"${w.guestName.replace(/"/g, '""')}"`,
      w.isPrivateName ? 'Yes' : 'No',
      `"${w.message.replace(/"/g, '""')}"`,
      w.isApproved ? 'Approved' : 'Pending',
      w.likes,
      `"${w.createdAt}"`
    ]);
    downloadCsv('Wedding_Guest_Wishes.csv', headers, rows);
  };

  const handleExportKeepsakes = () => {
    const headers = ['Item ID', 'Title', 'Category', 'Season', 'Reward Type', 'Description', 'Quiz ID'];
    const rows = keepsakesTable.map(k => [
      `"${k.id}"`,
      `"${k.title.replace(/"/g, '""')}"`,
      `"${k.category}"`,
      `"${k.seasonName}"`,
      `"${k.rewardType}"`,
      `"${k.description.replace(/"/g, '""')}"`,
      `"${k.sourceQuizId}"`
    ]);
    downloadCsv('Wedding_Keepsakes_Catalog.csv', headers, rows);
  };

  const handleExportQuizzes = () => {
    const headers = ['Quiz ID', 'Season', 'Category', 'Question', 'Correct Answer', 'Options', 'Reward Item'];
    const rows = quizzesTable.map(q => [
      `"${q.id}"`,
      `"${q.seasonName}"`,
      `"${q.category}"`,
      `"${q.question.replace(/"/g, '""')}"`,
      `"${q.correctAnswer.replace(/"/g, '""')}"`,
      `"${q.options.join(' | ').replace(/"/g, '""')}"`,
      `"${q.rewardCollectibleId}"`
    ]);
    downloadCsv('Wedding_Trivia_Quizzes.csv', headers, rows);
  };

  const handleExportTimeline = () => {
    const headers = ['Event ID', 'Time', 'Title', 'Location', 'Attire', 'Description'];
    const rows = timelineTable.map(t => [
      `"${t.id}"`,
      `"${t.time}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.location.replace(/"/g, '""')}"`,
      `"${t.attire.replace(/"/g, '""')}"`,
      `"${t.description.replace(/"/g, '""')}"`
    ]);
    downloadCsv('Wedding_Timeline_Schedule.csv', headers, rows);
  };

  const handleExportProgress = () => {
    const headers = ['Player ID', 'Guest Name', 'Season', 'Keepsakes (Part 1, Part 2)', 'Quizzes Solved', 'Invitation Unlocked', 'Last Active'];
    const rows = progressTable.map(p => [
      `"${p.id}"`,
      `"${p.playerName.replace(/"/g, '""')}"`,
      `"${p.seasonName}"`,
      `"${p.keepsakesCount}"`,
      p.solvedQuizzesCount,
      p.invitationUnlocked ? 'Yes' : 'No',
      `"${p.lastPlayedAt}"`
    ]);
    downloadCsv('Guest_Player_Progress.csv', headers, rows);
  };

  // Filtered queries
  const q = searchQuery.toLowerCase().trim();

  const filteredRsvps = rsvps.filter(r =>
    !q || r.guestName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.dietaryRequirements && r.dietaryRequirements.toLowerCase().includes(q))
  );

  const filteredWishes = wishes.filter(w =>
    !q || w.guestName.toLowerCase().includes(q) || w.message.toLowerCase().includes(q)
  );

  const filteredKeepsakes = keepsakesTable.filter(k =>
    !q || k.title.toLowerCase().includes(q) || k.category.toLowerCase().includes(q) || k.seasonName.toLowerCase().includes(q) || k.description.toLowerCase().includes(q)
  );

  const filteredQuizzes = quizzesTable.filter(pz =>
    !q || pz.question.toLowerCase().includes(q) || pz.correctAnswer.toLowerCase().includes(q) || pz.seasonName.toLowerCase().includes(q)
  );

  const filteredTimeline = timelineTable.filter(t =>
    !q || t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
  );

  const filteredProgress = progressTable.filter(p =>
    !q || p.playerName.toLowerCase().includes(q) || p.seasonName.toLowerCase().includes(q)
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                  <span>Wedding Organizer Admin Panel</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Manage database tables for RSVPs, wishes, keepsakes, quizzes, timeline &amp; guest progress
                </p>
              </div>
            </div>

            <button
              id="close-admin-modal-btn"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="p-2 text-stone-400 hover:text-white rounded-full hover:bg-stone-800 transition"
              title="Close Admin Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-stone-100/90 border-b border-stone-200 p-3 text-center gap-2 text-xs">
            <div className="bg-white/70 py-2 rounded-xl border border-stone-200/60">
              <span className="text-lg font-bold text-emerald-700 block">{totalAttending}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Guests Attending</span>
            </div>
            <div className="bg-white/70 py-2 rounded-xl border border-stone-200/60">
              <span className="text-lg font-bold text-stone-700 block">{totalDeclined}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Responses Declined</span>
            </div>
            <div className="bg-white/70 py-2 rounded-xl border border-stone-200/60">
              <span className="text-lg font-bold text-amber-600 block">{pendingWishesCount}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Pending Wishes</span>
            </div>
            <div className="bg-white/70 py-2 rounded-xl border border-stone-200/60">
              <span className="text-lg font-bold text-indigo-600 block">{progressTable.length}</span>
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Active Guest Players</span>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex border-b border-stone-200 px-4 sm:px-6 pt-3 gap-2 sm:gap-4 overflow-x-auto bg-stone-50/50">
            <button
              id="admin-tab-rsvps"
              onClick={() => { soundManager.playClick(); setActiveTab('rsvps'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'rsvps'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>RSVPs ({rsvps.length})</span>
            </button>

            <button
              id="admin-tab-wishes"
              onClick={() => { soundManager.playClick(); setActiveTab('wishes'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'wishes'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Guest Wishes ({wishes.length})</span>
            </button>

            <button
              id="admin-tab-keepsakes"
              onClick={() => { soundManager.playClick(); setActiveTab('keepsakes'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'keepsakes'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Keepsakes Catalog ({keepsakesTable.length})</span>
            </button>

            <button
              id="admin-tab-quizzes"
              onClick={() => { soundManager.playClick(); setActiveTab('quizzes'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'quizzes'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Trivia Quizzes ({quizzesTable.length})</span>
            </button>

            <button
              id="admin-tab-timeline"
              onClick={() => { soundManager.playClick(); setActiveTab('timeline'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Timeline Schedule ({timelineTable.length})</span>
            </button>

            <button
              id="admin-tab-progress"
              onClick={() => { soundManager.playClick(); setActiveTab('progress'); setSearchQuery(''); }}
              className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-1.5 border-b-2 whitespace-nowrap transition ${
                activeTab === 'progress'
                  ? 'border-indigo-500 text-indigo-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Guest Progress ({progressTable.length})</span>
            </button>
          </div>

          {/* Search & Export Toolbar */}
          <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/80">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-300 text-xs text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'rsvps' && (
                <button
                  id="export-rsvp-csv-btn"
                  onClick={handleExportRsvps}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export RSVPs to CSV</span>
                </button>
              )}

              {activeTab === 'wishes' && (
                <button
                  id="export-wishes-csv-btn"
                  onClick={handleExportWishes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Wishes to CSV</span>
                </button>
              )}

              {activeTab === 'keepsakes' && (
                <button
                  id="export-keepsakes-csv-btn"
                  onClick={handleExportKeepsakes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Keepsakes CSV</span>
                </button>
              )}

              {activeTab === 'quizzes' && (
                <button
                  id="export-quizzes-csv-btn"
                  onClick={handleExportQuizzes}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Quizzes CSV</span>
                </button>
              )}

              {activeTab === 'timeline' && (
                <button
                  id="export-timeline-csv-btn"
                  onClick={handleExportTimeline}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Timeline CSV</span>
                </button>
              )}

              {activeTab === 'progress' && (
                <button
                  id="export-progress-csv-btn"
                  onClick={handleExportProgress}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Progress CSV</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* 1. RSVPS TABLE */}
            {activeTab === 'rsvps' && (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Guest Name</th>
                      <th className="p-3">Attendance</th>
                      <th className="p-3">Count</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Dietary / Allergies</th>
                      <th className="p-3">Message</th>
                      <th className="p-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredRsvps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 italic">
                          No RSVP records match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredRsvps.map((r) => (
                        <tr key={r.id} className="hover:bg-stone-50">
                          <td className="p-3 font-semibold text-stone-900">{r.guestName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                              r.attendance === 'attending' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                            }`}>
                              {r.attendance}
                            </span>
                          </td>
                          <td className="p-3 font-bold">{r.guestCount}</td>
                          <td className="p-3 text-stone-500">{r.email}</td>
                          <td className="p-3 text-stone-600">{r.dietaryRequirements || '—'}</td>
                          <td className="p-3 text-stone-600 italic truncate max-w-xs">{r.message || '—'}</td>
                          <td className="p-3 text-stone-400 text-[10px] whitespace-nowrap">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. WISHES TABLE */}
            {activeTab === 'wishes' && (
              <div className="space-y-3">
                {filteredWishes.length === 0 ? (
                  <p className="text-center text-stone-400 py-12 text-sm italic">
                    No wishes found.
                  </p>
                ) : (
                  filteredWishes.map((wish) => (
                    <div
                      key={wish.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        wish.isApproved
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-stone-900 text-sm">
                            {wish.guestName}
                          </span>
                          {wish.isPrivateName && (
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full font-semibold">
                              Requested Private
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            wish.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {wish.isApproved ? 'Approved' : 'Pending Review'}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-auto">
                            {wish.createdAt ? new Date(wish.createdAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-stone-700 text-xs sm:text-sm italic">
                          "{wish.message}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!wish.isApproved ? (
                          <button
                            id={`approve-wish-${wish.id}`}
                            onClick={() => {
                              soundManager.playCorrect();
                              onApproveWish(wish.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        ) : (
                          <button
                            id={`unapprove-wish-${wish.id}`}
                            onClick={() => {
                              soundManager.playClick();
                              onRejectWish(wish.id);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition"
                          >
                            <span>Unpublish</span>
                          </button>
                        )}

                        <button
                          id={`delete-wish-${wish.id}`}
                          onClick={() => {
                            soundManager.playClick();
                            onDeleteWish(wish.id);
                          }}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 transition"
                          title="Delete Wish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. KEEPSAKES CATALOG TABLE */}
            {activeTab === 'keepsakes' && (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Keepsake Item</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Season</th>
                      <th className="p-3">Reward Type</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Source Quiz ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredKeepsakes.map((k) => (
                      <tr key={k.id} className="hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900 flex items-center gap-2">
                          <span className="text-lg">{k.icon}</span>
                          <span>{k.title}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            {k.category}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-stone-700">{k.seasonName}</td>
                        <td className="p-3 font-mono text-[10px] text-stone-500">{k.rewardType}</td>
                        <td className="p-3 text-stone-600 max-w-sm truncate">{k.description}</td>
                        <td className="p-3 font-mono text-[10px] text-stone-400">{k.sourceQuizId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. TRIVIA QUIZZES TABLE */}
            {activeTab === 'quizzes' && (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Quiz ID</th>
                      <th className="p-3">Season</th>
                      <th className="p-3">Question</th>
                      <th className="p-3">Correct Answer</th>
                      <th className="p-3">Options</th>
                      <th className="p-3">Reward Keepsake</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredQuizzes.map((q) => (
                      <tr key={q.id} className="hover:bg-stone-50">
                        <td className="p-3 font-mono text-[10px] text-stone-500 font-bold">{q.id}</td>
                        <td className="p-3 font-semibold text-stone-800 whitespace-nowrap">{q.seasonName}</td>
                        <td className="p-3 font-medium text-stone-900 max-w-xs">{q.question}</td>
                        <td className="p-3">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                            {q.correctAnswer}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600 text-[11px]">
                          {q.options.join(' • ')}
                        </td>
                        <td className="p-3 font-mono text-[10px] text-stone-500">{q.rewardCollectibleId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. TIMELINE EVENTS TABLE */}
            {activeTab === 'timeline' && (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Attire Guidance</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredTimeline.map((t) => (
                      <tr key={t.id} className="hover:bg-stone-50">
                        <td className="p-3 font-bold text-rose-700 whitespace-nowrap">{t.time}</td>
                        <td className="p-3 font-semibold text-stone-900">{t.title}</td>
                        <td className="p-3 text-stone-600">{t.location}</td>
                        <td className="p-3">
                          <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full text-[10px]">
                            {t.attire}
                          </span>
                        </td>
                        <td className="p-3 text-stone-600 max-w-sm">{t.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 6. GUEST PLAYER PROGRESS TABLE */}
            {activeTab === 'progress' && (
              <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-3">Guest Player</th>
                      <th className="p-3">Current Season</th>
                      <th className="p-3">Keepsakes Display (8/8, 4/4)</th>
                      <th className="p-3">Quizzes Solved</th>
                      <th className="p-3">Invitation Unlocked</th>
                      <th className="p-3">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredProgress.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400 italic">
                          No active player progress records yet. Progress syncs automatically as guests explore!
                        </td>
                      </tr>
                    ) : (
                      filteredProgress.map((p) => (
                        <tr key={p.id} className="hover:bg-stone-50">
                          <td className="p-3 font-bold text-stone-900">{p.playerName}</td>
                          <td className="p-3 font-semibold text-stone-700">{p.seasonName}</td>
                          <td className="p-3">
                            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold font-mono text-[11px]">
                              {p.keepsakesCount}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-stone-800">{p.solvedQuizzesCount}/8</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              p.invitationUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                            }`}>
                              {p.invitationUnlocked ? 'Unlocked' : 'In Progress'}
                            </span>
                          </td>
                          <td className="p-3 text-stone-400 text-[10px] whitespace-nowrap">
                            {p.lastPlayedAt ? new Date(p.lastPlayedAt).toLocaleTimeString() : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer Notice */}
          <div className="p-4 bg-stone-100 border-t border-stone-200 text-stone-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Database tables powered by Cloud Firestore. Special guest list roster is managed directly from database.
            </span>
            <span className="font-semibold text-stone-700">
              Julian &amp; Sophia's Wedding Administration
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
