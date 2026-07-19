// Адаптивний AI-режим: оцінка рівня за відповідями + планування показів.
//
// Логіка:
//  • Кожне слово має рівень (A1…C1), який визначив AI.
//  • Користувач відповідає «Знаю» / «Не знаю» — це зберігається назавжди.
//  • Рівень користувача перераховується з точності відповідей по рівнях
//    (детермінована математика, не «на віру» від моделі), а AI отримує
//    цю статистику й підбирає наступну порцію слів під неї.
//  • Слово, яке 3 рази поспіль «Знаю», вважається засвоєним і більше
//    не показується (лише зрідка, для перевірки).

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;

// Інтервали для «Знаю» залежно від серії правильних відповідей
const KNOWN_INTERVALS = [10 * MIN, 1 * DAY, 4 * DAY, 12 * DAY, 30 * DAY];
const MASTERED_STREAK = 3;

// --- Оцінка відповіді ---
// result: 'correct' | 'partial' | 'wrong' (true/false — для сумісності).
// 'partial' — слово написане/сказане правильно, але артикль не той:
// зараховуємо як знання слова, але серію не нарощуємо, бо артикль — частина
// слова, і без нього воно не вважається засвоєним.
export function gradeWord(word, result) {
  const r = result === true ? 'correct' : result === false ? 'wrong' : result;
  const w = { ...word };
  w.lastSeen = Date.now();

  if (r === 'correct') {
    w.known += 1;
    w.streak += 1;
    w.mastered = w.streak >= MASTERED_STREAK;
    const idx = Math.min(w.streak, KNOWN_INTERVALS.length - 1);
    w.due = Date.now() + KNOWN_INTERVALS[idx];
  } else if (r === 'partial') {
    w.known += 1;
    w.mastered = false;
    w.due = Date.now() + 30 * MIN;
  } else {
    w.unknown += 1;
    w.streak = 0;
    w.mastered = false;
    w.due = Date.now() + 3 * MIN; // швидко повернути в цю ж сесію
  }
  return w;
}

// --- Оцінка рівня користувача ---
// Точність по кожному рівню; рівень користувача — найвищий, де він
// упевнено (≥75%) справляється, за наявності достатньої вибірки.
export function estimateLevel(words, fallback = 'A2') {
  const stats = {};
  for (const lvl of LEVELS) stats[lvl] = { seen: 0, right: 0 };

  for (const w of words) {
    const total = w.known + w.unknown;
    if (!total) continue;
    const s = stats[w.level] || stats[fallback];
    s.seen += total;
    s.right += w.known;
  }

  let best = null;
  for (const lvl of LEVELS) {
    const s = stats[lvl];
    if (s.seen >= 4 && s.right / s.seen >= 0.75) best = lvl;
  }

  // Якщо на поточному рівні провалів забагато — знижуємо
  if (!best) {
    for (const lvl of LEVELS) {
      const s = stats[lvl];
      if (s.seen >= 4 && s.right / s.seen < 0.5) {
        const i = LEVELS.indexOf(lvl);
        return LEVELS[Math.max(0, i - 1)];
      }
    }
    return fallback;
  }

  // Впевнено тримає рівень → пропонуємо наступний
  const s = stats[best];
  if (s.seen >= 8 && s.right / s.seen >= 0.9) {
    const i = LEVELS.indexOf(best);
    return LEVELS[Math.min(LEVELS.length - 1, i + 1)];
  }
  return best;
}

// Статистика для показу користувачеві та для промпта AI
export function profileStats(words) {
  const answered = words.filter(w => w.known + w.unknown > 0);
  const right = answered.reduce((n, w) => n + w.known, 0);
  const total = answered.reduce((n, w) => n + w.known + w.unknown, 0);
  return {
    total: words.length,
    answered: answered.length,
    mastered: words.filter(w => w.mastered).length,
    struggling: words.filter(w => w.unknown >= 2 && !w.mastered).length,
    accuracy: total ? Math.round((right / total) * 100) : null,
  };
}

// --- Черга на показ ---
// Спершу прострочені (зокрема ті, що щойно завалили), потім нові.
// Засвоєні слова показуються лише коли реально настав їхній строк.
export function buildQueue(words, limit = 20) {
  const now = Date.now();
  const fresh = words.filter(w => w.known + w.unknown === 0);
  const due = words.filter(w => w.known + w.unknown > 0 && w.due <= now);

  // Складні — першими серед прострочених
  due.sort((a, b) => (b.unknown - b.known) - (a.unknown - a.known));

  return [...due, ...fresh].slice(0, limit);
}

// Скільки нових слів варто замовити в AI
export function neededNewWords(words, target = 12) {
  const now = Date.now();
  const available = words.filter(
    w => w.known + w.unknown === 0 || w.due <= now
  ).length;
  return Math.max(0, target - available);
}
