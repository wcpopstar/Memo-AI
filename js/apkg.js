// Імпорт колод Anki (.apkg — одна колода, .colpkg — уся колекція)
// Обидва формати — zip-архів із базою SQLite. Можливі варіанти всередині:
//   collection.anki21b — нові версії Anki (SQLite, стиснений zstd) — СПРАВЖНЯ база
//   collection.anki21  — старіший формат (звичайний SQLite)
//   collection.anki2   — найстаріший формат; у нових експортах це ЗАГЛУШКА
//                        з однією карткою «оновіть Anki» — її треба ігнорувати,
//                        якщо поруч є anki21b.
// Використовуємо JSZip + sql.js (WASM) з index.html та fzstd для zstd.

let _sqlPromise = null;
function getSQL() {
  if (!_sqlPromise) {
    _sqlPromise = initSqlJs({
      locateFile: f => `https://cdn.jsdelivr.net/npm/sql.js@1.10.2/dist/${f}`,
    });
  }
  return _sqlPromise;
}

let _fzstdPromise = null;
function getFzstd() {
  if (!_fzstdPromise) {
    _fzstdPromise = import('https://cdn.jsdelivr.net/npm/fzstd@0.1.1/+esm');
  }
  return _fzstdPromise;
}

// БЕЗПЕКА: вміст .apkg — ненадійне джерело (файл могли завантажити звідки завгодно).
// Використовуємо DOMParser: він створює інертний документ, де скрипти не виконуються
// і зовнішні ресурси не завантажуються. Присвоєння element.innerHTML тут було б
// небезпечним — конструкції на кшталт <img src=x onerror=...> можуть спрацювати.
const _parser = new DOMParser();

function stripHtml(html) {
  const cleaned = String(html)
    .replace(/\[sound:[^\]]*\]/g, '')
    .replace(/<br\s*\/?>/gi, '\n');
  const doc = _parser.parseFromString(cleaned, 'text/html');
  // Прибираємо вміст тегів, який не є видимим текстом
  doc.querySelectorAll('script, style, img').forEach(el => el.remove());
  return (doc.body.textContent || '').trim();
}

// Заглушка з нових експортів: одна нотатка з проханням оновити Anki
function isUpdateStub(cards) {
  return (
    cards.length <= 2 &&
    cards.some(c => /update to the latest version of anki|новіш(ої|у) версі/i.test(c.front + ' ' + c.back))
  );
}

async function readDatabase(zip) {
  // 1. Нова база (zstd) — пріоритет
  const zstdFile = zip.file('collection.anki21b');
  if (zstdFile) {
    const compressed = await zstdFile.async('uint8array');
    const { decompress } = await getFzstd();
    return decompress(compressed);
  }
  // 2. Старіші формати
  const dbFile = zip.file('collection.anki21') || zip.file('collection.anki2');
  if (dbFile) return dbFile.async('uint8array');
  throw new Error('У файлі не знайдено базу даних Anki.');
}

// Повертає { name, cards: [{front, back}] }
export async function parseApkg(file) {
  const zip = await JSZip.loadAsync(file);
  const buf = await readDatabase(zip);
  const SQL = await getSQL();
  const db = new SQL.Database(buf);

  try {
    // Нотатки: поля розділені символом \x1f; беремо перше як перед, решту — як зад
    const res = db.exec('SELECT flds FROM notes');
    const cards = [];
    if (res.length) {
      for (const row of res[0].values) {
        const fields = String(row[0]).split('\x1f');
        const front = stripHtml(fields[0] || '');
        const back = stripHtml(fields.slice(1).join('\n') || '');
        if (front) cards.push({ front, back });
      }
    }

    if (isUpdateStub(cards)) {
      throw new Error(
        'Схоже, це файл-заглушка з нової версії Anki. Спробуйте ще раз — ' +
        'якщо не допоможе, переекспортуйте колоду з увімкненою опцією ' +
        '«Support older Anki versions».'
      );
    }
    if (!cards.length) throw new Error('У колоді не знайдено карток.');

    const name = file.name.replace(/\.(apkg|colpkg)$/i, '');
    return { name, cards };
  } finally {
    db.close();
  }
}
