// Інтервальне повторення — алгоритм SM-2 (як в Anki)
// grade: 0 = Знову, 1 = Важко, 2 = Добре, 3 = Легко

import { t } from './i18n.js?v=7';

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

export function schedule(card, grade) {
  const c = { ...card };

  if (grade === 0) {
    // Знову: скидання, повтор через 10 хвилин
    c.reps = 0;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
    c.lapses = (c.lapses || 0) + 1;
    c.due = Date.now() + 10 * MIN;
    c.isNew = false;
    return c;
  }

  c.ease = Math.max(1.3, c.ease + [0, -0.15, 0, 0.15][grade]);

  if (c.reps === 0) {
    c.interval = grade === 3 ? 4 : 1;
  } else if (c.reps === 1) {
    c.interval = grade === 3 ? 7 : grade === 1 ? 3 : 6;
  } else {
    const factor = grade === 1 ? 1.2 : grade === 3 ? c.ease * 1.3 : c.ease;
    c.interval = Math.max(c.interval + 1, Math.round(c.interval * factor));
  }

  c.reps += 1;
  c.due = Date.now() + c.interval * DAY;
  c.isNew = false;
  return c;
}

// Підпис інтервалу для кнопки ("10 хв", "3 д", "1.2 міс")
export function previewInterval(card, grade) {
  if (grade === 0) return t('ivl.min', { n: 10 });
  const next = schedule(card, grade);
  const d = next.interval;
  if (d < 30) return t('ivl.day', { n: d });
  if (d < 365) return t('ivl.month', { n: (d / 30).toFixed(1).replace('.0', '') });
  return t('ivl.year', { n: (d / 365).toFixed(1).replace('.0', '') });
}
