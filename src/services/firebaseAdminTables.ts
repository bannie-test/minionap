import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, FIREBASE_CONSOLE_URL } from './firebase';
import { RSVPRecord, WishRecord, WeddingScheduleItem } from '../types';
import { gameCollectibles, allGamePuzzles, weddingSchedule, fourSeasons } from '../config/weddingData';

export { FIREBASE_CONSOLE_URL };

export interface AdminPlayerProgress {
  id: string;
  playerName: string;
  currentWorld: number;
  seasonName: string;
  keepsakesCount: string; // e.g. "8/8, 4/4"
  solvedQuizzesCount: number;
  invitationUnlocked: boolean;
  lastPlayedAt: string;
}

export interface AdminKeepsakeItem {
  id: string;
  title: string;
  icon: string;
  category: string;
  world: number;
  seasonName: string;
  description: string;
  rewardType: string;
  rewardSnippet: string;
  sourceQuizId: string;
}

export interface AdminQuizItem {
  id: string;
  world: number;
  seasonName: string;
  category: string;
  question: string;
  correctAnswer: string;
  options: string[];
  rewardCollectibleId: string;
}

export interface AdminTimelineEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  attire: string;
  description: string;
}

// Collections in Firestore
const COL_RSVPS = 'wedding_rsvps';
const COL_WISHES = 'wedding_wishes';
const COL_PROGRESS = 'player_progress';
const COL_KEEPSAKES = 'wedding_keepsakes';
const COL_QUIZZES = 'wedding_quizzes';
const COL_TIMELINE = 'wedding_timeline';

// Sync player progress to Firestore
export async function syncPlayerProgressToFirestore(
  playerName: string,
  currentWorld: number,
  collectedIds: string[],
  solvedPuzzleIds: string[],
  invitationUnlocked: boolean
): Promise<void> {
  if (!playerName || !playerName.trim()) return;
  const cleanName = playerName.trim();
  const docId = cleanName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const season = fourSeasons.find(s => s.id === currentWorld)?.name || `Season ${currentWorld}`;

  const validKeepsakes = Array.from(new Set(collectedIds.filter(id => gameCollectibles.some(c => c.id === id))));
  const keepsakesPart = `${Math.min(validKeepsakes.length, 8)}/8`;
  // Categories completed
  const completedCats = ['love_lore', 'daily_habits', 'adventures', 'celebration'].filter(cat => {
    const catItems = gameCollectibles.filter(g => g.category === cat);
    return catItems.length > 0 && catItems.every(g => validKeepsakes.includes(g.id));
  }).length;
  const categoriesPart = `${completedCats}/4`;

  const record: AdminPlayerProgress = {
    id: docId,
    playerName: cleanName,
    currentWorld,
    seasonName: season,
    keepsakesCount: `${keepsakesPart}, ${categoriesPart}`,
    solvedQuizzesCount: solvedPuzzleIds.length,
    invitationUnlocked,
    lastPlayedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, COL_PROGRESS, docId), record, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Note: progress saved locally (database offline or syncing)', err);
  }
}

// Seed static catalog tables to Firestore if not already present
export async function seedCatalogTablesToFirestore(): Promise<void> {
  try {
    // 1. Keepsakes Table
    const keepsakeSnap = await getDocs(collection(db, COL_KEEPSAKES));
    if (keepsakeSnap.empty) {
      for (const item of gameCollectibles) {
        const season = fourSeasons.find(s => s.id === item.world)?.name || `World ${item.world}`;
        const data: AdminKeepsakeItem = {
          id: item.id,
          title: item.title,
          icon: item.icon,
          category: item.category,
          world: item.world,
          seasonName: season,
          description: item.description,
          rewardType: item.rewardContent?.type || 'memory',
          rewardSnippet: (item.rewardContent?.text || '').slice(0, 100),
          sourceQuizId: item.sourceQuizId || 'world_exploration'
        };
        await setDoc(doc(db, COL_KEEPSAKES, item.id), data);
      }
    }

    // 2. Trivia Quizzes Table
    const quizSnap = await getDocs(collection(db, COL_QUIZZES));
    if (quizSnap.empty) {
      for (const puz of allGamePuzzles) {
        const season = fourSeasons.find(s => s.id === (puz.world ?? 1))?.name || `World ${puz.world ?? 1}`;
        const answerText = puz.options[puz.correctAnswer] || String(puz.correctAnswer);
        const data: AdminQuizItem = {
          id: puz.id,
          world: puz.world ?? 1,
          seasonName: season,
          category: puz.category,
          question: puz.question,
          correctAnswer: answerText,
          options: puz.options,
          rewardCollectibleId: puz.rewardCollectibleId || ''
        };
        await setDoc(doc(db, COL_QUIZZES, puz.id), data);
      }
    }

    // 3. Wedding Timeline Events Table
    const timelineSnap = await getDocs(collection(db, COL_TIMELINE));
    if (timelineSnap.empty) {
      for (let i = 0; i < weddingSchedule.length; i++) {
        const evt = weddingSchedule[i];
        const data: AdminTimelineEvent = {
          id: `schedule_event_${i + 1}`,
          time: evt.time,
          title: evt.title,
          location: evt.location,
          attire: 'Formal / Tuscan Elegance',
          description: evt.description
        };
        await setDoc(doc(db, COL_TIMELINE, data.id), data);
      }
    }
  } catch (err) {
    console.warn('[Firestore] Catalog initialization notice:', err);
  }
}

// Fetch or subscribe to all tables
export function subscribeToPlayerProgress(callback: (list: AdminPlayerProgress[]) => void) {
  return onSnapshot(
    collection(db, COL_PROGRESS),
    (snap) => {
      const list = snap.docs.map(d => d.data() as AdminPlayerProgress);
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Progress snapshot fallback', err);
      // Fallback to local memory / storage
      try {
        const saved = localStorage.getItem('wedding_player_name');
        if (saved) {
          callback([{
            id: 'local_player',
            playerName: saved,
            currentWorld: 1,
            seasonName: 'Winter Wonderland',
            keepsakesCount: '8/8, 4/4',
            solvedQuizzesCount: 8,
            invitationUnlocked: true,
            lastPlayedAt: new Date().toISOString()
          }]);
        }
      } catch {}
    }
  );
}

export function subscribeToKeepsakesTable(callback: (list: AdminKeepsakeItem[]) => void) {
  return onSnapshot(
    collection(db, COL_KEEPSAKES),
    (snap) => {
      if (!snap.empty) {
        callback(snap.docs.map(d => d.data() as AdminKeepsakeItem));
      } else {
        // Fallback to static catalog
        callback(gameCollectibles.map(item => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          category: item.category,
          world: item.world,
          seasonName: fourSeasons.find(s => s.id === item.world)?.name || `World ${item.world}`,
          description: item.description,
          rewardType: item.rewardContent?.type || 'memory',
          rewardSnippet: item.rewardContent?.text || '',
          sourceQuizId: item.sourceQuizId || 'world_exploration'
        })));
      }
    },
    () => {
      // Fallback
      callback(gameCollectibles.map(item => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        category: item.category,
        world: item.world,
        seasonName: fourSeasons.find(s => s.id === item.world)?.name || `World ${item.world}`,
        description: item.description,
        rewardType: item.rewardContent?.type || 'memory',
        rewardSnippet: item.rewardContent?.text || '',
        sourceQuizId: item.sourceQuizId || 'world_exploration'
      })));
    }
  );
}

export function subscribeToQuizzesTable(callback: (list: AdminQuizItem[]) => void) {
  return onSnapshot(
    collection(db, COL_QUIZZES),
    (snap) => {
      if (!snap.empty) {
        callback(snap.docs.map(d => d.data() as AdminQuizItem));
      } else {
        callback(allGamePuzzles.map(p => ({
          id: p.id,
          world: p.world ?? 1,
          seasonName: fourSeasons.find(s => s.id === (p.world ?? 1))?.name || `World ${p.world ?? 1}`,
          category: p.category,
          question: p.question,
          correctAnswer: p.options[p.correctAnswer] || String(p.correctAnswer),
          options: p.options,
          rewardCollectibleId: p.rewardCollectibleId || ''
        })));
      }
    },
    () => {
      callback(allGamePuzzles.map(p => ({
        id: p.id,
        world: p.world ?? 1,
        seasonName: fourSeasons.find(s => s.id === (p.world ?? 1))?.name || `World ${p.world ?? 1}`,
        category: p.category,
        question: p.question,
        correctAnswer: p.options[p.correctAnswer] || String(p.correctAnswer),
        options: p.options,
        rewardCollectibleId: p.rewardCollectibleId || ''
      })));
    }
  );
}

export function subscribeToTimelineTable(callback: (list: AdminTimelineEvent[]) => void) {
  return onSnapshot(
    collection(db, COL_TIMELINE),
    (snap) => {
      if (!snap.empty) {
        callback(snap.docs.map(d => d.data() as AdminTimelineEvent));
      } else {
        callback(weddingSchedule.map((evt, idx) => ({
          id: `schedule_event_${idx + 1}`,
          time: evt.time,
          title: evt.title,
          location: evt.location,
          attire: 'Formal / Tuscan Elegance',
          description: evt.description
        })));
      }
    },
    () => {
      callback(weddingSchedule.map((evt, idx) => ({
        id: `schedule_event_${idx + 1}`,
        time: evt.time,
        title: evt.title,
        location: evt.location,
        attire: 'Formal / Tuscan Elegance',
        description: evt.description
      })));
    }
  );
}
