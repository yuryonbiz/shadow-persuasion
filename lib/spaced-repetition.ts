'use client';

import { techniques } from '@/lib/techniques';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

export type SRCard = {
  techniqueId: string;
  techniqueName: string;
  category: string;
  easeFactor: number; // default 2.5
  interval: number; // days
  repetitions: number;
  nextReviewDate: string; // ISO date string
  lastReviewDate: string | null;
  status: 'not-started' | 'learning' | 'due' | 'mastered';
};

export type SRData = Record<string, SRCard>;

const STORAGE_KEY = 'shadow-sr-data';

/* ────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────── */

function loadData(): SRData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as SRData;
  } catch {
    return {};
  }
}

function saveData(data: SRData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getCardStatus(card: SRCard): SRCard['status'] {
  if (card.repetitions === 0 && !card.lastReviewDate) return 'not-started';
  const today = todayStr();
  if (card.nextReviewDate <= today) return 'due';
  if (card.easeFactor >= 2.5 && card.repetitions >= 5) return 'mastered';
  return 'learning';
}

/* ────────────────────────────────────────────
   SM-2 Algorithm
   ──────────────────────────────────────────── */

/**
 * Update a technique card based on review quality.
 * quality: 0-5 (0 = complete failure, 5 = perfect recall)
 */
export function getNextReview(techniqueId: string, quality: number): SRCard {
  const data = loadData();
  const technique = techniques.find((t) => t.id === techniqueId);

  let card: SRCard = data[techniqueId] || {
    techniqueId,
    techniqueName: technique?.name || techniqueId,
    category: technique?.category || 'Unknown',
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: todayStr(),
    lastReviewDate: null,
    status: 'not-started',
  };

  // Clamp quality to 0-5
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  if (quality < 3) {
    // Failed: reset repetitions
    card.repetitions = 0;
    card.interval = 1;
  } else {
    // Passed
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions += 1;
  }

  // Update ease factor (SM-2 formula)
  card.easeFactor = Math.max(
    1.3,
    card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  card.lastReviewDate = todayStr();
  card.nextReviewDate = addDays(todayStr(), card.interval);
  card.status = getCardStatus(card);

  // Save
  data[techniqueId] = card;
  saveData(data);

  return card;
}

/**
 * Returns all technique cards that are due for review today or earlier.
 */
export function getDueCards(): SRCard[] {
  const data = loadData();
  const today = todayStr();
  const dueCards: SRCard[] = [];

  for (const card of Object.values(data)) {
    if (card.nextReviewDate <= today && card.lastReviewDate !== null) {
      card.status = 'due';
      dueCards.push(card);
    }
  }

  // Sort by earliest due date first
  dueCards.sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  return dueCards;
}

/**
 * Returns all technique cards with their current status.
 * Includes techniques that haven't been started yet.
 */
export function getAllCards(): SRCard[] {
  const data = loadData();
  const cards: SRCard[] = [];

  for (const technique of techniques) {
    const card: SRCard = data[technique.id] || {
      techniqueId: technique.id,
      techniqueName: technique.name,
      category: technique.category,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReviewDate: todayStr(),
      lastReviewDate: null,
      status: 'not-started',
    };
    card.status = getCardStatus(card);
    cards.push(card);
  }

  return cards;
}

/**
 * Get the next upcoming review date across all cards.
 */
export function getNextReviewDate(): string | null {
  const data = loadData();
  const today = todayStr();
  let earliest: string | null = null;

  for (const card of Object.values(data)) {
    if (card.nextReviewDate > today) {
      if (!earliest || card.nextReviewDate < earliest) {
        earliest = card.nextReviewDate;
      }
    }
  }

  return earliest;
}

/**
 * Initialize a technique for spaced repetition tracking.
 */
export function startTracking(techniqueId: string): SRCard {
  const data = loadData();
  const technique = techniques.find((t) => t.id === techniqueId);

  if (data[techniqueId]) {
    return data[techniqueId];
  }

  const card: SRCard = {
    techniqueId,
    techniqueName: technique?.name || techniqueId,
    category: technique?.category || 'Unknown',
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: todayStr(),
    lastReviewDate: todayStr(),
    status: 'learning',
  };

  data[techniqueId] = card;
  saveData(data);
  return card;
}
