// Вбудований словник: слова беруться з файлу в проєкті, а не від AI.
//
// Навіщо: адаптивний режим потребує лише списку слів — рівень, черга повторень
// і перевірка написання рахуються нашим кодом (adaptive.js, srs.js, exercise.js).
// Тому нейромережа тут замінна на звичайні дані: працює офлайн, миттєво,
// без API-ключів і завжди однаково.
//
// Формат data/<код мови>.json:
//   { lang, sources: [...], words: [ { w, t: {en, uk, …}, l, p, e } ] }
//     w — слово (іменники з артиклем: «het huis»)
//     t — переклади за кодом мови інтерфейсу
//     l — рівень CEFR, p — частина мови, e — приклад речення
//
// Слова у файлі впорядковані за частотністю, тому «взяти перші незнайомі»
// означає «дати найкорисніші слова першими».

import { LEVELS } from './adaptive.js?v=7';

// Мови, для яких є словник. Решта — тільки через AI.
export const BANK_LANGS = new Set(['nl']);

export const hasWordbank = (lang) => BANK_LANGS.has(lang);

// Файл завантажується один раз на сесію
const cache = new Map();

export function loadWordbank(lang) {
  if (!hasWordbank(lang)) return Promise.resolve(null);
  if (!cache.has(lang)) {
    const p = fetch(`data/${lang}.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .catch(err => {
        cache.delete(lang); // щоб наступна спроба повторила запит
        throw err;
      });
    cache.set(lang, p);
  }
  return cache.get(lang);
}

// Переклад мовою інтерфейсу; якщо його ще немає — англійською
export const translationFor = (entry, uiLang) => entry.t[uiLang] || entry.t.en || '';

/**
 * Підбір нових слів під рівень користувача.
 * Здебільшого слова його рівня, трохи легших — для впевненості,
 * трохи складніших — щоб перевірити межу знань (та сама логіка, що в промпті AI).
 *
 * @param {object} bank    завантажений словник
 * @param {string} level   рівень користувача
 * @param {number} count   скільки слів потрібно
 * @param {Set<string>} exclude слова (у нижньому регістрі), які вже показувались
 * @param {string} uiLang  мова інтерфейсу — для перекладу
 */
export function pickWords(bank, { level = 'A2', count = 12, exclude = new Set(), uiLang = 'en' }) {
  const i = Math.max(0, LEVELS.indexOf(level));
  const plan = [
    [LEVELS[i], Math.round(count * 0.7)],
    [LEVELS[Math.max(0, i - 1)], Math.round(count * 0.15)],
    [LEVELS[Math.min(LEVELS.length - 1, i + 1)], count],  // добираємо залишок
  ];

  const taken = [];
  const used = new Set(exclude);

  for (const [lvl, want] of plan) {
    if (taken.length >= count) break;
    let n = 0;
    for (const e of bank.words) {
      if (taken.length >= count || n >= want) break;
      if (e.l !== lvl) continue;
      const key = e.w.toLowerCase();
      if (used.has(key)) continue;
      const translation = translationFor(e, uiLang);
      if (!translation) continue;
      used.add(key);
      taken.push({ word: e.w, translation, example: e.e || '', level: e.l });
      n += 1;
    }
  }
  return taken;
}
