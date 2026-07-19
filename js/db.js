// Локальна база даних (IndexedDB): колоди та картки

const DB_NAME = 'memo-anki';
const DB_VERSION = 2;

let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('decks')) {
        db.createObjectStore('decks', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cards')) {
        const cards = db.createObjectStore('cards', { keyPath: 'id', autoIncrement: true });
        cards.createIndex('deckId', 'deckId');
      }
      // Слова адаптивного AI-режиму (окремо від колод)
      if (!db.objectStoreNames.contains('aiwords')) {
        const w = db.createObjectStore('aiwords', { keyPath: 'id', autoIncrement: true });
        w.createIndex('lang', 'lang');
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const s = t.objectStore(store);
    const result = fn(s);
    t.oncomplete = () => resolve(result?.result ?? result);
    t.onerror = () => reject(t.error);
  }));
}

// --- Колоди ---
export const createDeck = (name) => tx('decks', 'readwrite', s => s.add({ name, createdAt: Date.now() }));
export const getDecks = () => tx('decks', 'readonly', s => s.getAll());
export const deleteDeck = async (deckId) => {
  await tx('decks', 'readwrite', s => s.delete(deckId));
  const cards = await getCardsByDeck(deckId);
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const t = db.transaction('cards', 'readwrite');
    cards.forEach(c => t.objectStore('cards').delete(c.id));
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
};

// --- Картки ---
// Нова картка: due = зараз (нова), стан SM-2 порожній
export function newCard(deckId, front, back) {
  return {
    deckId, front, back,
    reps: 0, interval: 0, ease: 2.5, lapses: 0,
    due: Date.now(),
    isNew: true,
    createdAt: Date.now(),
  };
}

export const addCard = (card) => tx('cards', 'readwrite', s => s.add(card));

export async function addCards(cards) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction('cards', 'readwrite');
    cards.forEach(c => t.objectStore('cards').add(c));
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
}

export const updateCard = (card) => tx('cards', 'readwrite', s => s.put(card));

export const getCardsByDeck = (deckId) => tx('cards', 'readonly', s => s.index('deckId').getAll(deckId));

// «Learn ahead» — як в Anki: картки в процесі вивчення (натиснули «Знову»)
// показуються, навіть якщо їхні 10 хвилин ще не минули. Інакше користувач
// виходить із колоди і картка «зникає» на 10 хв — це збиває з пантелику.
const LEARN_AHEAD = 20 * 60 * 1000;

const isLearning = (c) => !c.isNew && c.interval === 0;
export function isCardDue(c, now = Date.now()) {
  if (c.isNew) return false;
  return isLearning(c) ? c.due <= now + LEARN_AHEAD : c.due <= now;
}

// Картки до повторення: прострочені + ті, що вивчаються + нові (з лімітом нових)
export async function getDueCards(deckId, newLimit = 20) {
  const all = await getCardsByDeck(deckId);
  const now = Date.now();
  const due = all.filter(c => isCardDue(c, now));
  const fresh = all.filter(c => c.isNew).slice(0, newLimit);
  return [...due, ...fresh];
}

// --- Слова адаптивного AI-режиму ---
export function newAiWord(lang, { word, translation, example, level }) {
  return {
    lang, word, translation, example: example || '', level: level || 'A2',
    known: 0, unknown: 0, streak: 0, mastered: false,
    due: Date.now(), lastSeen: 0, createdAt: Date.now(),
  };
}

export const getAiWords = (lang) =>
  tx('aiwords', 'readonly', s => s.index('lang').getAll(lang));

export const updateAiWord = (w) => tx('aiwords', 'readwrite', s => s.put(w));

export async function addAiWords(words) {
  const dbi = await openDB();
  return new Promise((resolve, reject) => {
    const t = dbi.transaction('aiwords', 'readwrite');
    words.forEach(w => t.objectStore('aiwords').add(w));
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
}

export async function clearAiWords(lang) {
  const words = await getAiWords(lang);
  const dbi = await openDB();
  return new Promise((resolve, reject) => {
    const t = dbi.transaction('aiwords', 'readwrite');
    words.forEach(w => t.objectStore('aiwords').delete(w.id));
    t.oncomplete = resolve;
    t.onerror = () => reject(t.error);
  });
}

// Одноразова міграція: раніше мова слова зберігалась українською назвою
// («нідерландська»), тепер — кодом ISO («nl»). Прогрес користувача не втрачаємо.
export async function migrateLangCodes(legacyMap) {
  if (localStorage.getItem('memo-lang-migrated')) return;
  const dbi = await openDB();
  const all = await tx('aiwords', 'readonly', s => s.getAll());
  const stale = all.filter(w => legacyMap[w.lang]);
  if (stale.length) {
    await new Promise((resolve, reject) => {
      const tr = dbi.transaction('aiwords', 'readwrite');
      stale.forEach(w => tr.objectStore('aiwords').put({ ...w, lang: legacyMap[w.lang] }));
      tr.oncomplete = resolve;
      tr.onerror = () => reject(tr.error);
    });
  }
  // Рівні зберігались у ключах memo-ai-level-<назва мови>
  for (const [name, code] of Object.entries(legacyMap)) {
    const old = localStorage.getItem(`memo-ai-level-${name}`);
    if (old) {
      localStorage.setItem(`memo-ai-level-${code}`, old);
      localStorage.removeItem(`memo-ai-level-${name}`);
    }
  }
  const savedLang = localStorage.getItem('memo-ai-lang');
  if (savedLang && legacyMap[savedLang]) {
    localStorage.setItem('memo-ai-lang', legacyMap[savedLang]);
  }
  localStorage.setItem('memo-lang-migrated', '1');
}

export async function deckStats(deckId, newLimit = 20) {
  const all = await getCardsByDeck(deckId);
  const now = Date.now();
  return {
    total: all.length,
    due: all.filter(c => isCardDue(c, now)).length,
    fresh: Math.min(all.filter(c => c.isNew).length, newLimit),
  };
}
