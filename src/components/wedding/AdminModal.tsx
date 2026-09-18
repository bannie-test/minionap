import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Trash2, ShieldCheck, Download, Users, Heart, MessageSquare, Database, Crown, Plus, RotateCcw } from 'lucide-react';
import { WishRecord, RSVPRecord } from '../../types';
import { soundManager } from '../../audio/soundManager';
import {
  SpecialGuestEntry,
  getSpecialGuestsTable,
  addSpecialGuestToDb,
  deleteSpecialGuestFromDb,
  toggleQuizAccessInDb,
  resetSpecialGuestsTable
} from '../../services/guestDatabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishes: WishRecord[];
  onApproveWish: (id: string) => void;
  onRejectWish: (id: string) => void;
  onDeleteWish: (id: string) => void;
  rsvps: RSVPRecord[];
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  wishes,
  onApproveWish,
  onRejectWish,
  onDeleteWish,
  rsvps
}) => {
  const [activeTab, setActiveTab] = useState<'wishes' | 'rsvps' | 'vip_table'>('wishes');
  const [specialGuests, setSpecialGuests] = useState<SpecialGuestEntry[]>([]);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestRole, setNewGuestRole] = useState('VIP Guest');
  const [newGuestNote, setNewGuestNote] = useState('');

  // Load database table on mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      setSpecialGuests(getSpecialGuestsTable());
    }
  }, [isOpen]);

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    soundManager.playClick();
    addSpecialGuestToDb(newGuestName, newGuestRole, newGuestNote);
    setSpecialGuests(getSpecialGuestsTable());
    setNewGuestName('');
    setNewGuestNote('');
  };

  const handleDeleteGuest = (id: string) => {
    soundManager.playClick();
    deleteSpecialGuestFromDb(id);
    setSpecialGuests(getSpecialGuestsTable());
  };

  const handleToggleAccess = (id: string) => {
    soundManager.playClick();
    toggleQuizAccessInDb(id);
    setSpecialGuests(getSpecialGuestsTable());
  };

  const handleResetTable = () => {
    if (window.confirm('Reset the special guests database table back to original wedding party seed data?')) {
      soundManager.playClick();
      resetSpecialGuestsTable();
      setSpecialGuests(getSpecialGuestsTable());
    }
  };

  if (!isOpen) return null;

  // RSVP summary statistics
  const totalAttending = rsvps
    .filter(r => r.attendance === 'attending')
    .reduce((sum, r) => sum + r.guestCount, 0);
  const totalDeclined = rsvps.filter(r => r.attendance === 'declined').length;
  const pendingWishesCount = wishes.filter(w => !w.isApproved).length;

  // Export RSVPs to CSV
  const handleExportCSV = () => {
    soundManager.playClick();
    const headers = ['Name', 'Email', 'Attendance', 'Guest Count', 'Dietary Requirements', 'Message', 'Submitted At'];
    const rows = rsvps.map(r => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      `"${r.email.replace(/"/g, '""')}"`,
      `"${r.attendance}"`,
      r.guestCount,
      `"${r.dietaryRequirements.replace(/"/g, '""')}"`,
      `"${r.message.replace(/"/g, '""')}"`,
      `"${r.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Wedding_RSVP_List_Julian_Sophia.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
        >
          {/* Header */}
          <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">
                  Wedding Organizer Admin Panel
                </h3>
                <p className="text-xs text-stone-400">
                  Moderation of guest wishes &amp; RSVP management
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
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 bg-stone-100/70 border-b border-stone-200 text-center p-4 gap-2">
            <div>
              <span className="text-xl font-bold text-emerald-700">{totalAttending}</span>
              <p className="text-[11px] font-semibold text-stone-500 uppercase">Guests Attending</p>
            </div>
            <div>
              <span className="text-xl font-bold text-stone-600">{totalDeclined}</span>
              <p className="text-[11px] font-semibold text-stone-500 uppercase">Responses Declined</p>
            </div>
            <div>
              <span className="text-xl font-bold text-amber-600">{pendingWishesCount}</span>
              <p className="text-[11px] font-semibold text-stone-500 uppercase">Pending Wishes</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-200 px-6 pt-3 gap-4">
            <button
              id="admin-tab-wishes"
              onClick={() => { soundManager.playClick(); setActiveTab('wishes'); }}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'wishes'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Guest Wishes ({wishes.length})</span>
            </button>

            <button
              id="admin-tab-rsvps"
              onClick={() => { soundManager.playClick(); setActiveTab('rsvps'); }}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'rsvps'
                  ? 'border-rose-500 text-rose-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>RSVP Records ({rsvps.length})</span>
            </button>

            <button
              id="admin-tab-viptable"
              onClick={() => { soundManager.playClick(); setActiveTab('vip_table'); }}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'vip_table'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Special Names Database Table ({specialGuests.length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'wishes' ? (
              <div className="space-y-3">
                {wishes.length === 0 ? (
                  <p className="text-center text-stone-400 py-12 text-sm italic">
                    No wishes submitted yet.
                  </p>
                ) : (
                  wishes.map((wish) => (
                    <div
                      key={wish.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                        wish.isApproved
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/50 border-amber-200'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
            ) : activeTab === 'rsvps' ? (
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    id="export-rsvp-csv-btn"
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export RSVP Table to CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Guest Name</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Count</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Dietary / Allergies</th>
                        <th className="p-3">Message</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {rsvps.map((r) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Database Table: special_guest_roster */
              <div className="space-y-5">
                {/* Table Description & Controls Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-600 fill-amber-400" />
                      <h4 className="font-bold text-stone-900 text-sm">
                        Database Table: <code className="text-amber-800 font-mono bg-amber-100/80 px-1.5 py-0.5 rounded text-xs">special_guest_roster</code>
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 max-w-xl">
                      Only guests whose entered name matches this database table will have the 8 wedding trivia quizzes appear along their adventure path. For all other guests, quizzes are hidden.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetTable}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 text-xs font-semibold shadow-xs transition"
                    title="Reset to default seed names"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Seed Table</span>
                  </button>
                </div>

                {/* Add New Special Guest Form */}
                <form onSubmit={handleAddGuest} className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Guest Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grandma Rose, Coach Dan"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="w-36">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Role / Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Family, VIP"
                      value={newGuestRole}
                      onChange={(e) => setNewGuestRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Special table seating note"
                      value={newGuestNote}
                      onChange={(e) => setNewGuestNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Database</span>
                  </button>
                </form>

                {/* Special Guests Database Table */}
                <div className="overflow-x-auto border border-stone-200 rounded-2xl shadow-xs">
                  <table className="w-full text-left text-xs text-stone-700">
                    <thead className="bg-stone-100 text-stone-800 uppercase text-[10px] font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-3">Record ID</th>
                        <th className="p-3">Guest Name</th>
                        <th className="p-3">Role / Category</th>
                        <th className="p-3">Quiz Visibility</th>
                        <th className="p-3">Note</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {specialGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-amber-50/30 transition">
                          <td className="p-3 font-mono text-[10px] text-stone-400">{guest.id}</td>
                          <td className="p-3 font-bold text-stone-900 flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span>{guest.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {guest.role}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleToggleAccess(guest.id)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${
                                guest.canAccessQuizzes
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                              }`}
                              title="Click to toggle quiz visibility"
                            >
                              {guest.canAccessQuizzes ? '✓ Quizzes Visible' : '✗ Quizzes Hidden'}
                            </button>
                          </td>
                          <td className="p-3 text-stone-500 italic max-w-[150px] truncate">{guest.note || '—'}</td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                              title="Delete from special guest database"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
