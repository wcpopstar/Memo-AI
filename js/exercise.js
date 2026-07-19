// Типи вправ в адаптивному режимі та перевірка написання.
//
//  'classic' — показати слово, згадати переклад («Знаю» / «Не знаю»)
//  'spell'   — показано переклад, треба написати слово мовою вивчення
//  'speak'   — показано переклад, треба продиктувати слово вголос
//
// Результат перевірки:
//  'correct' — усе правильно (зокрема артикль) → зелений
//  'partial' — саме слово правильне, але артикль не той або відсутній → жовтий
//  'wrong'   — помилка → червоний

export const RESULT = { CORRECT: 'correct', PARTIAL: 'partial', WRONG: 'wrong' };

// Прибираємо регістр, пунктуацію та зайві пробіли; діакритику лишаємо
// (в нідерландській/німецькій вона змістотворча: één ≠ een).
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s'’-]/gu, ' ')
    .replace(/[’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Слово без артикля: 'de hond' → 'hond'
function stripArticle(text, articles) {
  if (!articles.length) return text;
  const parts = text.split(' ');
  if (parts.length > 1 && articles.includes(parts[0])) return parts.slice(1).join(' ');
  return text;
}

export function hasArticle(text, articles) {
  if (!articles.length) return false;
  const parts = normalize(text).split(' ');
  return parts.length > 1 && articles.includes(parts[0]);
}

// Відстань Левенштейна — щоб одна описка не зараховувалась як груба помилка
// (використовуємо лише для дуже близьких варіантів у розпізнаванні мовлення).
function levenshtein(a, b) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(
        prev[j] + 1,
        prev[j - 1] + 1,
        diag + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
      diag = tmp;
    }
  }
  return prev[a.length];
}

/**
 * Перевірка написаної/продиктованої відповіді.
 * @param {string} input   що ввів користувач
 * @param {string} target  правильне слово (може бути з артиклем)
 * @param {string[]} articles артиклі мови вивчення
 * @param {boolean} fuzzy  дозволити 1 описку (для розпізнавання мовлення)
 */
export function checkAnswer(input, target, articles = [], fuzzy = false) {
  const arts = articles.map(a => a.toLowerCase());
  const a = normalize(input);
  const b = normalize(target);
  if (!a) return RESULT.WRONG;
  if (a === b) return RESULT.CORRECT;

  const aBase = stripArticle(a, arts);
  const bBase = stripArticle(b, arts);

  // Саме слово збіглося, різниця лише в артиклі
  if (aBase && aBase === bBase) return RESULT.PARTIAL;

  if (fuzzy) {
    const tolerance = bBase.length >= 6 ? 2 : 1;
    if (levenshtein(a, b) <= tolerance) return RESULT.CORRECT;
    if (aBase && levenshtein(aBase, bBase) <= tolerance) return RESULT.PARTIAL;
  }
  return RESULT.WRONG;
}

/**
 * Який тип вправи показати для слова.
 * Нові слова (їх ще жодного разу не бачили) — завжди класика: написати чи
 * продиктувати те, чого ще не знаєш, неможливо.
 */
export function pickMode(word, { speechAvailable = false, rand = Math.random } = {}) {
  const seen = (word.known || 0) + (word.unknown || 0);
  if (seen === 0) return 'classic';

  const r = rand();
  if (r < 0.3) return 'spell';
  if (speechAvailable && r < 0.45) return 'speak';
  return 'classic';
}

// --- Розпізнавання мовлення (Web Speech API) ---
const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

export const speechAvailable = () => Boolean(SR);

/**
 * Слухає один вислів і повертає розпізнаний текст.
 * @returns {Promise<string>}
 * @throws {Error} з .code: 'unsupported' | 'denied' | 'nothing'
 */
export function listenOnce(locale) {
  return new Promise((resolve, reject) => {
    if (!SR) {
      const e = new Error('speech recognition unsupported');
      e.code = 'unsupported';
      return reject(e);
    }
    const rec = new SR();
    rec.lang = locale;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    let settled = false;

    rec.onresult = (ev) => {
      settled = true;
      const alts = Array.from(ev.results[0] || []).map(a => a.transcript);
      resolve(alts);
    };
    rec.onerror = (ev) => {
      settled = true;
      const e = new Error(ev.error || 'speech error');
      e.code = ev.error === 'not-allowed' || ev.error === 'service-not-allowed'
        ? 'denied' : 'nothing';
      reject(e);
    };
    rec.onend = () => {
      if (settled) return;
      const e = new Error('nothing heard');
      e.code = 'nothing';
      reject(e);
    };

    try {
      rec.start();
    } catch (err) {
      const e = new Error(String(err));
      e.code = 'nothing';
      reject(e);
    }
  });
}

// З кількох варіантів розпізнавання беремо найкращий результат
export function bestSpeechResult(alternatives, target, articles) {
  let best = { result: RESULT.WRONG, text: alternatives[0] || '' };
  const rank = { [RESULT.CORRECT]: 2, [RESULT.PARTIAL]: 1, [RESULT.WRONG]: 0 };
  for (const alt of alternatives) {
    const r = checkAnswer(alt, target, articles, true);
    if (rank[r] > rank[best.result]) best = { result: r, text: alt };
  }
  return best;
}
