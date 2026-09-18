/**
 * Special Guest Database Table Service
 * 
 * Manages the persistent table of special/VIP guests who have privilege to see
 * and solve the hidden wedding trivia quizzes along the 4 Seasons adventure.
 * 
 * Table Name: 'special_guest_roster'
 */

export interface SpecialGuestEntry {
  id: string;
  name: string;
  role: string;
  canAccessQuizzes: boolean;
  note?: string;
  createdAt: string;
}

const STORAGE_KEY = 'wedding_special_guests_table';

// Default seeded database table records
const DEFAULT_SPECIAL_GUESTS: SpecialGuestEntry[] = [
  {
    id: 'guest_vip_001',
    name: 'Banbanus',
    role: 'Honored VIP',
    canAccessQuizzes: true,
    note: 'Special member quiz privilege',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_002',
    name: 'banbanus911',
    role: 'Honored VIP',
    canAccessQuizzes: true,
    note: 'VIP account identifier',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_003',
    name: 'Julian Alexander',
    role: 'Groom',
    canAccessQuizzes: true,
    note: 'The Groom',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_004',
    name: 'Sophia Claire',
    role: 'Bride',
    canAccessQuizzes: true,
    note: 'The Bride',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_005',
    name: 'Julian',
    role: 'Groom',
    canAccessQuizzes: true,
    note: 'Groom short name',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_006',
    name: 'Sophia',
    role: 'Bride',
    canAccessQuizzes: true,
    note: 'Bride short name',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'guest_vip_007',
    name: 'Maya',
    role: 'Maid of Honor',
    canAccessQuizzes: true,
    note: 'Wedding party',
    createdAt: '2026-09-16T12:00:00.000Z'
  },
  {
    id: 'guest_vip_008',
    name: 'Marcus',
    role: 'Best Man',
    canAccessQuizzes: true,
    note: 'Wedding party',
    createdAt: '2026-09-16T12:00:00.000Z'
  },
  {
    id: 'guest_vip_009',
    name: 'Eleanor',
    role: 'Family VIP',
    canAccessQuizzes: true,
    note: 'Honored family member',
    createdAt: '2026-09-16T12:00:00.000Z'
  },
  {
    id: 'guest_vip_010',
    name: 'VIP Guest',
    role: 'VIP',
    canAccessQuizzes: true,
    note: 'General VIP access token',
    createdAt: '2026-09-17T09:00:00.000Z'
  },
  {
    id: 'guest_vip_011',
    name: 'Waffles',
    role: 'Ring Bearer (Pup)',
    canAccessQuizzes: true,
    note: 'Golden Retriever ring bearer',
    createdAt: '2026-09-17T09:00:00.000Z'
  }
];

// In-memory cached table for fast 60FPS sync lookups
let cachedGuestTable: SpecialGuestEntry[] = [];

/**
 * Initialize and load database table
 */
export function getSpecialGuestsTable(): SpecialGuestEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedGuestTable = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read special guests table from storage', err);
  }

  // Seed default table
  cachedGuestTable = [...DEFAULT_SPECIAL_GUESTS];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedGuestTable));
  } catch {}
  return cachedGuestTable;
}

/**
 * Save table changes to storage
 */
export function saveSpecialGuestsTable(table: SpecialGuestEntry[]): void {
  cachedGuestTable = table;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
  } catch (err) {
    console.warn('Failed to write special guests table to storage', err);
  }
}

/**
 * Check if a player name exists in the database table and has quiz access enabled.
 * Case-insensitive, trimmed, and handles exact match or token containment.
 */
export function checkSpecialGuestInDb(name: string): boolean {
  if (!name || !name.trim()) return false;
  if (cachedGuestTable.length === 0) {
    getSpecialGuestsTable();
  }

  const cleanInput = name.trim().toLowerCase();

  return cachedGuestTable.some(entry => {
    if (!entry.canAccessQuizzes) return false;
    const cleanEntryName = entry.name.trim().toLowerCase();
    
    // Direct match
    if (cleanInput === cleanEntryName) return true;

    // Full name match (e.g. input "Julian Alexander" matches "Julian" or vice-versa)
    if (cleanInput.includes(cleanEntryName) || cleanEntryName.includes(cleanInput)) {
      // Avoid false positive on very short 1-2 character tokens
      if (cleanEntryName.length >= 3 && cleanInput.length >= 3) {
        return true;
      }
    }
    return false;
  });
}

/**
 * Add a new special guest to the database table
 */
export function addSpecialGuestToDb(
  name: string,
  role: string = 'VIP Guest',
  note: string = ''
): SpecialGuestEntry {
  const currentTable = getSpecialGuestsTable();
  const newEntry: SpecialGuestEntry = {
    id: `guest_vip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: name.trim(),
    role: role.trim() || 'VIP Guest',
    canAccessQuizzes: true,
    note: note.trim(),
    createdAt: new Date().toISOString()
  };

  const updatedTable = [newEntry, ...currentTable];
  saveSpecialGuestsTable(updatedTable);
  return newEntry;
}

/**
 * Delete a guest entry from the database table
 */
export function deleteSpecialGuestFromDb(id: string): boolean {
  const currentTable = getSpecialGuestsTable();
  const filtered = currentTable.filter(entry => entry.id !== id);
  if (filtered.length !== currentTable.length) {
    saveSpecialGuestsTable(filtered);
    return true;
  }
  return false;
}

/**
 * Toggle quiz permission for a guest in the database table
 */
export function toggleQuizAccessInDb(id: string): boolean {
  const currentTable = getSpecialGuestsTable();
  let toggled = false;
  const updated = currentTable.map(entry => {
    if (entry.id === id) {
      toggled = true;
      return { ...entry, canAccessQuizzes: !entry.canAccessQuizzes };
    }
    return entry;
  });

  if (toggled) {
    saveSpecialGuestsTable(updated);
  }
  return toggled;
}

/**
 * Reset database table back to initial seed data
 */
export function resetSpecialGuestsTable(): SpecialGuestEntry[] {
  const fresh = [...DEFAULT_SPECIAL_GUESTS];
  saveSpecialGuestsTable(fresh);
  return fresh;
}

// Pre-initialize cache on load
getSpecialGuestsTable();
