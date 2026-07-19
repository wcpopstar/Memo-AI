// ?v= — версія для скидання кешу браузера.
// ВАЖЛИВО: змінюйте це число в index.html І в усіх імпортах нижче
// після кожного оновлення коду, інакше браузер підтягне старі модулі.
import * as db from './db.js?v=7';
import { schedule, previewInterval } from './srs.js?v=7';
import { parseApkg } from './apkg.js?v=7';
import { generateCards, generateAdaptiveBatch } from './ai.js?v=7';
import { gradeWord, estimateLevel, profileStats, buildQueue, neededNewWords } from './adaptive.js?v=7';
import { SHARED_GROQ_KEY, SHARED_GEMINI_KEY } from './config.js?v=7';
import { t, applyI18n, getLang, setLang, getSavedLang, UI_LANGS, UI_LANG_IN_ENGLISH } from './i18n.js?v=7';
import { STUDY_LANGS, getStudyLang, LEGACY_LANG_NAMES } from './langs.js?v=7';
import { hasWordbank, loadWordbank, pickWords } from './wordbank.js?v=7';
import {
  RESULT, checkAnswer, pickMode,
  speechAvailable, listenOnce, bestSpeechResult,
} from './exercise.js?v=7';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// --- Налаштування ---
const settings = {
  get provider() { return localStorage.getItem('memo-provider') || 'gemini'; },
  set provider(v) { localStorage.setItem('memo-provider', v); },
  get geminiKey() { return localStorage.getItem('memo-gemini-key') || ''; },
  set geminiKey(v) { localStorage.setItem('memo-gemini-key', v); },
  get groqKey() { return localStorage.getItem('memo-groq-key') || ''; },
  set groqKey(v) { localStorage.setItem('memo-groq-key', v); },
  get apiKey() { return localStorage.getItem('memo-api-key') || ''; },
  set apiKey(v) { localStorage.setItem('memo-api-key', v); },
  get newLimit() { return Number(localStorage.getItem('memo-new-limit')) || 20; },
  set newLimit(v) { localStorage.setItem('memo-new-limit', String(v)); },
  // Ключ активного провайдера (для безплатних — запасний спільний ключ з config.js)
  get activeKey() {
    if (this.provider === 'anthropic') return this.apiKey;
    if (this.provider === 'gemini') return this.geminiKey || SHARED_GEMINI_KEY;
    return this.groqKey || SHARED_GROQ_KEY;
  },
};

// --- Toast ---
let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

// --- Модальні вікна (заміна prompt/confirm — вони блокуються
//     у вбудованих браузерах Telegram/Instagram та частині мобільних) ---
function modal({ title, withInput = false, value = '', okText }) {
  return new Promise(resolve => {
    const overlay = $('#modal-overlay');
    const input = $('#modal-input');
    $('#modal-title').textContent = title;
    $('#modal-ok').textContent = okText || t('modal.ok');
    input.classList.toggle('hidden', !withInput);
    input.value = value;
    overlay.classList.remove('hidden');
    if (withInput) setTimeout(() => input.focus(), 50);

    const close = (result) => {
      overlay.classList.add('hidden');
      $('#modal-ok').removeEventListener('click', onOk);
      $('#modal-cancel').removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onBackdrop);
      input.removeEventListener('keydown', onKey);
      resolve(result);
    };
    const onOk = () => close(withInput ? input.value.trim() : true);
    const onCancel = () => close(null);
    const onBackdrop = (e) => { if (e.target === overlay) close(null); };
    const onKey = (e) => { if (e.key === 'Enter') onOk(); };

    $('#modal-ok').addEventListener('click', onOk);
    $('#modal-cancel').addEventListener('click', onCancel);
    overlay.addEventListener('click', onBackdrop);
    input.addEventListener('keydown', onKey);
  });
}

// --- Навігація ---
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === id));
  if (id === 'screen-decks') renderDecks();
  if (id === 'screen-add' || id === 'screen-ai') fillDeckSelects();
  if (id === 'screen-ai') {
    renderAdaptiveProfile();
  }
}

$$('.nav-btn').forEach(btn =>
  btn.addEventListener('click', () => showScreen(btn.dataset.screen)));
document.addEventListener('click', (e) => {
  const back = e.target.closest('[data-back]');
  if (back) showScreen(back.dataset.back);
  // Посилання «Налаштування» живе в тексті, який перемальовується при
  // зміні мови, тому слухаємо його делеговано, а не по id.
  if (e.target.id === 'link-settings') {
    e.preventDefault();
    showScreen('screen-settings');
  }
});

// --- Колоди ---
async function renderDecks() {
  const decks = await db.getDecks();
  const list = $('#deck-list');
  list.innerHTML = '';
  $('#decks-empty').classList.toggle('hidden', decks.length > 0);

  for (const deck of decks) {
    const stats = await db.deckStats(deck.id, settings.newLimit);
    const el = document.createElement('div');
    el.className = 'deck-item';
    el.innerHTML = `
      <div class="deck-info">
        <div class="deck-name"></div>
        <div class="deck-stats">
          <span class="due"></span>
          <span class="new"></span>
          <span class="all"></span>
        </div>
      </div>
      <button class="deck-delete">🗑️</button>`;
    el.querySelector('.deck-name').textContent = deck.name;
    el.querySelector('.due').textContent = t('decks.due', { n: stats.due });
    el.querySelector('.new').textContent = t('decks.fresh', { n: stats.fresh });
    el.querySelector('.all').textContent = t('decks.total', { n: stats.total });
    el.querySelector('.deck-delete').title = t('decks.delete');
    el.querySelector('.deck-info').addEventListener('click', () => startStudy(deck));
    el.querySelector('.deck-delete').addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await modal({
        title: t('decks.deleteAsk', { name: deck.name }),
        okText: t('decks.delete'),
      });
      if (!ok) return;
      await db.deleteDeck(deck.id);
      renderDecks();
      toast(t('decks.deleted'));
    });
    list.appendChild(el);
  }
}

$('#btn-new-deck').addEventListener('click', async () => {
  const name = await modal({
    title: t('decks.newAsk'), withInput: true, okText: t('decks.create'),
  });
  if (!name) return;
  await db.createDeck(name);
  renderDecks();
  toast(t('decks.created'));
});

// --- Імпорт .apkg ---
$('#btn-import').addEventListener('click', () => $('#file-apkg').click());
$('#file-apkg').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  toast(t('decks.importing'));
  try {
    const { name, cards } = await parseApkg(file);
    const deckId = await db.createDeck(name);
    await db.addCards(cards.map(c => db.newCard(deckId, c.front, c.back)));
    renderDecks();
    toast(t('decks.imported', { name, n: cards.length }));
  } catch (err) {
    console.error(err);
    toast(t('decks.importError', { msg: err.message }));
  }
});

// --- Селекти колод ---
async function fillDeckSelects() {
  const decks = await db.getDecks();
  for (const sel of [$('#add-deck-select'), $('#ai-deck-select')]) {
    const prev = sel.value;
    sel.innerHTML = '';
    if (!decks.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = t('decks.none');
      sel.appendChild(opt);
      continue;
    }
    for (const d of decks) {
      const opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.name;
      sel.appendChild(opt);
    }
    if (prev) sel.value = prev;
  }
}

// --- Додавання картки ---
$('#btn-add-card').addEventListener('click', async () => {
  const deckId = Number($('#add-deck-select').value);
  const front = $('#add-front').value.trim();
  const back = $('#add-back').value.trim();
  if (!deckId) return toast(t('add.needDeck'));
  if (!front || !back) return toast(t('add.needBoth'));
  await db.addCard(db.newCard(deckId, front, back));
  $('#add-front').value = '';
  $('#add-back').value = '';
  toast(t('add.added'));
});

// --- Навчання ---
let studyQueue = [];
let currentCard = null;
let studyTotal = 0;    // скільки унікальних карток у сесії
let studyDone = 0;     // скільки вивчено (без «Знову»-повторів)

async function startStudy(deck) {
  studyQueue = await db.getDueCards(deck.id, settings.newLimit);
  if (!studyQueue.length) {
    toast(t('study.nothing'));
    return;
  }
  // Перемішуємо
  studyQueue.sort(() => Math.random() - 0.5);
  studyTotal = studyQueue.length;
  studyDone = 0;
  $('#study-deck-name').textContent = deck.name;
  showScreen('screen-study');
  nextCard();
}

function nextCard() {
  currentCard = studyQueue.shift() || null;

  if (!currentCard) {
    $('#study-card').classList.add('hidden');
    $('#study-controls').classList.add('hidden');
    $('#study-done').classList.remove('hidden');
    $('#study-counter').textContent = '';
    return;
  }

  $('#study-card').classList.remove('hidden');
  $('#study-controls').classList.remove('hidden');
  $('#study-done').classList.add('hidden');

  $('#card-front').textContent = currentCard.front;
  $('#card-back').textContent = currentCard.back;
  $('#card-back').classList.add('hidden');
  $('#btn-show-answer').classList.remove('hidden');
  $('#answer-buttons').classList.add('hidden');
  const left = studyQueue.length + 1; // поточна картка + черга
  $('#study-counter').textContent =
    t('study.counter', { done: studyDone, total: studyTotal, left });
}

$('#btn-show-answer').addEventListener('click', () => {
  $('#card-back').classList.remove('hidden');
  $('#btn-show-answer').classList.add('hidden');
  $('#answer-buttons').classList.remove('hidden');
  $('#ivl-again').textContent = previewInterval(currentCard, 0);
  $('#ivl-hard').textContent = previewInterval(currentCard, 1);
  $('#ivl-good').textContent = previewInterval(currentCard, 2);
  $('#ivl-easy').textContent = previewInterval(currentCard, 3);
});

$$('#answer-buttons .btn').forEach(btn =>
  btn.addEventListener('click', async () => {
    const grade = Number(btn.dataset.grade);
    const updated = schedule(currentCard, grade);
    await db.updateCard(updated);
    if (grade === 0) {
      // "Знову" — повернути в кінець поточної сесії, картка ще не вивчена
      studyQueue.push(updated);
    } else {
      studyDone += 1;
    }
    nextCard();
  }));

// --- AI генерація ---
$('#ai-count').addEventListener('input', (e) => {
  $('#ai-count-label').textContent = e.target.value;
});

$('#btn-ai-generate').addEventListener('click', async () => {
  const apiKey = settings.activeKey;
  const deckId = Number($('#ai-deck-select').value);
  const topic = $('#ai-topic').value.trim();
  const langMeta = getStudyLang($('#ai-lang').value);
  const level = $('#ai-level').value;
  const count = Number($('#ai-count').value);

  if (!apiKey) { showScreen('screen-settings'); return toast(t('ai.needKey')); }
  if (!deckId) return toast(t('add.needDeck'));
  if (!topic) return toast(t('gen.needTopic'));

  const btn = $('#btn-ai-generate');
  const status = $('#ai-status');
  btn.disabled = true;
  status.classList.remove('hidden', 'error');
  status.textContent = t('gen.working');
  $('#ai-preview').innerHTML = '';

  try {
    // Розумний підбір: не дублювати наявні слова, закріплювати складні
    const existing = await db.getCardsByDeck(deckId);
    const avoidWords = existing.map(c => c.front).slice(0, 200);
    const focusWords = existing
      .filter(c => (c.lapses || 0) >= 2 || (!c.isNew && c.ease <= 2.1))
      .sort((a, b) => (b.lapses || 0) - (a.lapses || 0))
      .slice(0, 15)
      .map(c => c.front);

    const cards = await generateCards({
      provider: settings.provider, apiKey,
      topic, level, count,
      language: langMeta.english,
      nativeLanguage: UI_LANG_IN_ENGLISH[getLang()],
      articles: langMeta.requireArticle ? langMeta.articles : [],
      avoidWords, focusWords,
    });
    await db.addCards(cards.map(c =>
      db.newCard(deckId, c.word, `${c.translation}\n\n${c.example}`)));

    status.textContent = t('gen.ready', { n: cards.length });
    const preview = $('#ai-preview');
    for (const c of cards) {
      const el = document.createElement('div');
      el.className = 'ai-card';
      const b = document.createElement('b'); b.textContent = c.word;
      const tr = document.createElement('span'); tr.className = 'tr'; tr.textContent = ` — ${c.translation}`;
      const ex = document.createElement('div'); ex.className = 'ex'; ex.textContent = c.example;
      el.append(b, tr, ex);
      preview.appendChild(el);
    }
  } catch (err) {
    console.error(err);
    status.classList.add('error');
    status.textContent = err.status === 401 ? t('ai.badKey') : t('ai.error', { msg: err.message });
  } finally {
    btn.disabled = false;
  }
});

// =====================================================================
// АДАПТИВНИЙ AI-РЕЖИМ
// =====================================================================
let adaptiveQueue = [];
let adaptiveCurrent = null;
let adaptiveMode = 'classic';     // 'classic' | 'spell' | 'speak'
let adaptiveSession = { right: 0, partial: 0, wrong: 0, levelBefore: null };
// Скільки разів слово вже поверталось у цій сесії (щоб не крутилось нескінченно)
let adaptiveRepeats = new Map();
const MAX_REPEATS = 2;

const adaptiveLang = () => $('#adaptive-lang').value;
const adaptiveLangMeta = () => getStudyLang(adaptiveLang());
const levelKey = (lang) => `memo-ai-level-${lang}`;
const getLevel = (lang) => localStorage.getItem(levelKey(lang)) || 'A2';
const setLevel = (lang, lvl) => localStorage.setItem(levelKey(lang), lvl);

// Обидва селекти мов вивчення заповнюємо з одного джерела (langs.js),
// назви — поточною мовою інтерфейсу, значення — стабільні коди.
function fillLangSelects() {
  for (const sel of [$('#ai-lang'), $('#adaptive-lang')]) {
    const prev = sel.value;
    sel.innerHTML = '';
    for (const l of STUDY_LANGS) {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = t(`lang.${l.code}`);
      sel.appendChild(opt);
    }
    const saved = localStorage.getItem('memo-ai-lang');
    sel.value = prev || saved || STUDY_LANGS[0].code;
  }
}

// Селект «звідки брати слова» — ховаємо для мов без словника
function renderSourceField() {
  const lang = adaptiveLang();
  const field = $('#field-word-source');
  const sel = $('#adaptive-source');
  field.classList.toggle('hidden', !hasWordbank(lang));
  sel.value = wordSource(lang);
  // Попередження про ключ потрібне лише в режимі AI
  $('#ai-no-key').classList.toggle(
    'hidden', wordSource(lang) !== 'ai' || !!settings.activeKey);
}

$('#adaptive-source').addEventListener('change', (e) => {
  localStorage.setItem(sourceKey(adaptiveLang()), e.target.value);
  renderSourceField();
});

async function renderAdaptiveProfile() {
  renderSourceField();
  const lang = adaptiveLang();
  const words = await db.getAiWords(lang);
  const box = $('#adaptive-profile');
  const hasData = words.some(w => w.known + w.unknown > 0);

  $('#btn-adaptive-reset').classList.toggle('hidden', !words.length);
  box.classList.toggle('hidden', !hasData);
  if (!hasData) return;

  const s = profileStats(words);
  box.innerHTML = `
    <div class="row"><span class="k1"></span><span class="lvl"></span></div>
    <div class="row"><span class="k2"></span><span class="acc"></span></div>
    <div class="row"><span class="k3"></span><span class="mas"></span></div>
    <div class="row"><span class="k4"></span><span class="str"></span></div>`;
  box.querySelector('.k1').textContent = t('ai.level');
  box.querySelector('.k2').textContent = t('ai.accuracy');
  box.querySelector('.k3').textContent = t('ai.mastered');
  box.querySelector('.k4').textContent = t('ai.struggling');
  box.querySelector('.lvl').textContent = getLevel(lang);
  box.querySelector('.acc').textContent = s.accuracy === null ? '—' : s.accuracy + '%';
  box.querySelector('.mas').textContent = t('ai.masteredOf', { n: s.mastered, total: s.total });
  box.querySelector('.str').textContent = String(s.struggling);
}

$('#adaptive-lang').addEventListener('change', () => {
  localStorage.setItem('memo-ai-lang', adaptiveLang());
  $('#ai-lang').value = adaptiveLang();
  renderAdaptiveProfile();
});

// Перемикання підрежимів (адаптивний ↔ генератор у колоду)
function showAiSub(sub) {
  const adaptive = sub === 'adaptive';
  $('#ai-adaptive').classList.toggle('hidden', !adaptive);
  $('#ai-generator').classList.toggle('hidden', adaptive);
  $('#ai-title').dataset.i18n = adaptive ? 'ai.titleAdaptive' : 'ai.titleGenerator';
  $('#ai-title').textContent = t($('#ai-title').dataset.i18n);
}
$('#link-generator').addEventListener('click', (e) => { e.preventDefault(); showAiSub('generator'); fillDeckSelects(); });
$('#link-adaptive').addEventListener('click', (e) => { e.preventDefault(); showAiSub('adaptive'); });

function showAdaptiveView(view) {
  $('#adaptive-setup').classList.toggle('hidden', view !== 'setup');
  $('#adaptive-session').classList.toggle('hidden', view !== 'session');
  $('#adaptive-done').classList.toggle('hidden', view !== 'done');
  if (view !== 'session') $('#ai-session-counter').textContent = '';
}

// Джерело слів: вбудований словник чи AI.
// Словник доступний не для всіх мов, тому вибір може бути примусовим.
const sourceKey = (lang) => `memo-source-${lang}`;
function wordSource(lang) {
  if (!hasWordbank(lang)) return 'ai';
  return localStorage.getItem(sourceKey(lang)) || 'bank';
}

// Довантаження нових слів зі словника
async function fetchFromWordbank(lang, words, need) {
  const bank = await loadWordbank(lang);
  const fresh = pickWords(bank, {
    level: getLevel(lang),
    count: Math.max(need, 12),
    exclude: new Set(words.map(w => w.word.toLowerCase())),
    uiLang: getLang(),
  });
  if (!fresh.length) return words;        // словник вичерпано
  await db.addAiWords(fresh.map(c => db.newAiWord(lang, c)));
  return db.getAiWords(lang);
}

// Довантаження нових слів від AI, якщо чергу вичерпано
async function fetchAdaptiveWords(lang, words) {
  const need = neededNewWords(words);
  if (!need) return words;

  if (wordSource(lang) === 'bank') return fetchFromWordbank(lang, words, need);

  const meta = getStudyLang(lang);
  const level = getLevel(lang);
  const profile = { level, ...profileStats(words) };
  const topic = $('#adaptive-topic').value.trim();

  const fresh = await generateAdaptiveBatch({
    provider: settings.provider,
    apiKey: settings.activeKey,
    profile,
    language: meta.english,
    nativeLanguage: UI_LANG_IN_ENGLISH[getLang()],
    articles: meta.requireArticle ? meta.articles : [],
    topic,
    count: Math.max(need, 10),
    avoidWords: words.map(w => w.word),
    focusWords: words.filter(w => w.unknown >= 2 && !w.mastered).map(w => w.word),
  });

  // Не додаємо дублікати (AI міг проігнорувати список)
  const have = new Set(words.map(w => w.word.toLowerCase()));
  const toAdd = fresh
    .filter(c => !have.has(c.word.toLowerCase()))
    .map(c => db.newAiWord(lang, c));

  if (toAdd.length) await db.addAiWords(toAdd);
  return db.getAiWords(lang);
}

async function startAdaptive() {
  const lang = adaptiveLang();
  // Ключ потрібен лише коли слова беруться від AI
  if (wordSource(lang) === 'ai' && !settings.activeKey) {
    showScreen('screen-settings');
    return toast(t('ai.needKey'));
  }
  const btn = $('#btn-adaptive-start');
  btn.disabled = true;
  btn.textContent = t('ai.preparing');

  try {
    let words = await db.getAiWords(lang);
    words = await fetchAdaptiveWords(lang, words);
    adaptiveQueue = buildQueue(words);

    if (!adaptiveQueue.length) {
      toast(t('ai.allMastered'));
      return;
    }
    adaptiveSession = { right: 0, partial: 0, wrong: 0, levelBefore: getLevel(lang) };
    adaptiveRepeats = new Map();
    showAdaptiveView('session');
    nextAdaptiveWord();
  } catch (err) {
    console.error(err);
    toast(err.status === 401 ? t('ai.badKey') : t('ai.error', { msg: err.message }));
  } finally {
    btn.disabled = false;
    btn.textContent = t('ai.start');
  }
}

$('#btn-adaptive-start').addEventListener('click', startAdaptive);
$('#btn-adaptive-again').addEventListener('click', startAdaptive);
$('#btn-adaptive-exit').addEventListener('click', () => { showAdaptiveView('setup'); renderAdaptiveProfile(); });

// --- Показ слова: вибір типу вправи ---
function nextAdaptiveWord() {
  adaptiveCurrent = adaptiveQueue.shift() || null;
  if (!adaptiveCurrent) return finishAdaptive();
  adaptiveMode = pickMode(adaptiveCurrent, { speechAvailable: speechAvailable() });
  renderAdaptiveCard();
}

// Зворотна сторона: переклад + приклад
function fillAnswerSide() {
  const answer = $('#adaptive-answer');
  answer.textContent = adaptiveMode === 'classic'
    ? adaptiveCurrent.translation
    : adaptiveCurrent.word;
  if (adaptiveCurrent.example) {
    const ex = document.createElement('span');
    ex.className = 'ex';
    ex.textContent = adaptiveCurrent.example;
    answer.appendChild(ex);
  }
}

function renderAdaptiveCard() {
  const w = adaptiveCurrent;
  const meta = adaptiveLangMeta();

  // Скидаємо стан попереднього слова
  const card = $('#adaptive-card');
  card.classList.remove('r-correct', 'r-partial', 'r-wrong');
  $('#adaptive-feedback').className = 'feedback hidden';
  $('#adaptive-feedback').textContent = '';
  $('#adaptive-answer').classList.add('hidden');
  $('#adaptive-buttons').classList.add('hidden');
  $('#btn-adaptive-next').classList.add('hidden');
  $('#btn-adaptive-reveal').classList.remove('hidden');
  $('#mode-classic').classList.toggle('hidden', adaptiveMode !== 'classic');
  $('#mode-spell').classList.toggle('hidden', adaptiveMode !== 'spell');
  $('#mode-speak').classList.toggle('hidden', adaptiveMode !== 'speak');

  $('#adaptive-level').textContent = w.level;
  const task = $('#adaptive-task');
  task.textContent = '';
  task.classList.toggle('hidden', adaptiveMode === 'classic');

  if (adaptiveMode === 'classic') {
    // Класика: показуємо слово, згадуємо переклад
    $('#adaptive-word').textContent = w.word;
  } else {
    // Написати / продиктувати: показуємо переклад, слово треба відтворити
    task.textContent = t(adaptiveMode === 'spell' ? 'spell.prompt' : 'speak.prompt');
    if (adaptiveMode === 'spell' && meta.requireArticle) {
      const hint = document.createElement('small');
      hint.textContent = t('spell.hintArticle', { articles: meta.articles.slice(0, 2).join(' / ') });
      task.appendChild(hint);
    }
    $('#adaptive-word').textContent = w.translation;

    if (adaptiveMode === 'spell') {
      const input = $('#spell-input');
      input.value = '';
      input.disabled = false;
      input.className = '';
      $('#btn-spell-check').disabled = false;
      setTimeout(() => input.focus(), 60);
    } else {
      const btn = $('#btn-speak');
      btn.disabled = false;
      btn.textContent = t('speak.start');
    }
  }
  fillAnswerSide();
  $('#ai-session-counter').textContent = t('ai.left', { n: adaptiveQueue.length + 1 });
}

// --- Запис результату ---
async function submitAdaptiveResult(result) {
  const updated = gradeWord(adaptiveCurrent, result);
  await db.updateAiWord(updated);

  if (result === RESULT.CORRECT) adaptiveSession.right += 1;
  else if (result === RESULT.PARTIAL) adaptiveSession.partial += 1;
  else adaptiveSession.wrong += 1;

  // Неправильні й «майже правильні» повертаємо в цю ж сесію,
  // але не більше MAX_REPEATS разів — інакше слово крутилося б нескінченно.
  if (result !== RESULT.CORRECT) {
    const seen = adaptiveRepeats.get(updated.id) || 0;
    if (seen < MAX_REPEATS) {
      adaptiveRepeats.set(updated.id, seen + 1);
      adaptiveQueue.push(updated);
    }
  }
}

// Показує підсвічений результат і кнопку «Далі»
async function showAdaptiveResult(result, heardText = null) {
  const card = $('#adaptive-card');
  const fb = $('#adaptive-feedback');
  card.classList.add(`r-${result}`);
  fb.className = `feedback ${result}`;

  fb.textContent =
    result === RESULT.CORRECT ? t('spell.correct')
    : result === RESULT.PARTIAL ? t('spell.partial', { answer: adaptiveCurrent.word })
    : t('spell.wrong', { answer: adaptiveCurrent.word });

  if (heardText) {
    const heard = document.createElement('small');
    heard.textContent = t('speak.heard', { text: heardText });
    fb.appendChild(heard);
  }

  $('#adaptive-answer').classList.remove('hidden');
  $('#mode-spell').classList.add('hidden');
  $('#mode-speak').classList.add('hidden');
  $('#btn-adaptive-next').classList.remove('hidden');

  await submitAdaptiveResult(result);
}

$('#btn-adaptive-next').addEventListener('click', nextAdaptiveWord);

// --- Вправа 1: класика ---
$('#btn-adaptive-reveal').addEventListener('click', () => {
  $('#adaptive-answer').classList.remove('hidden');
  $('#btn-adaptive-reveal').classList.add('hidden');
  $('#adaptive-buttons').classList.remove('hidden');
});

$$('#adaptive-buttons .btn').forEach(btn =>
  btn.addEventListener('click', async () => {
    await submitAdaptiveResult(btn.dataset.knows === '1' ? RESULT.CORRECT : RESULT.WRONG);
    nextAdaptiveWord();
  }));

// --- Вправа 2: написати слово по буквах ---
async function checkSpelling() {
  const input = $('#spell-input');
  const value = input.value.trim();
  if (!value) return;
  input.disabled = true;
  $('#btn-spell-check').disabled = true;

  const result = checkAnswer(value, adaptiveCurrent.word, adaptiveLangMeta().articles);
  input.className = `spell-${result}`;
  await showAdaptiveResult(result);
}

$('#btn-spell-check').addEventListener('click', checkSpelling);
$('#spell-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkSpelling();
});
$('#btn-spell-idk').addEventListener('click', () => {
  $('#spell-input').disabled = true;
  showAdaptiveResult(RESULT.WRONG);
});

// --- Вправа 3: продиктувати слово ---
$('#btn-speak').addEventListener('click', async () => {
  const btn = $('#btn-speak');
  const meta = adaptiveLangMeta();
  btn.disabled = true;
  btn.textContent = t('speak.listening');
  try {
    const alternatives = await listenOnce(meta.speech);
    const { result, text } = bestSpeechResult(alternatives, adaptiveCurrent.word, meta.articles);
    await showAdaptiveResult(result, text);
  } catch (err) {
    const key = err.code === 'unsupported' ? 'speak.unsupported'
      : err.code === 'denied' ? 'speak.denied'
      : 'speak.nothing';
    toast(t(key));
    btn.disabled = false;
    btn.textContent = t('speak.retry');
  }
});

$('#btn-speak-skip').addEventListener('click', () => showAdaptiveResult(RESULT.WRONG));

async function finishAdaptive() {
  const lang = adaptiveLang();
  const words = await db.getAiWords(lang);

  // AI-оцінка рівня за реальними відповідями
  const before = adaptiveSession.levelBefore;
  const after = estimateLevel(words, before);
  setLevel(lang, after);

  const s = profileStats(words);
  const box = $('#adaptive-summary');
  box.innerHTML = '';
  const add = (text, cls) => {
    const p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    box.appendChild(p);
  };
  add(t('ai.summaryAnswers', {
    right: adaptiveSession.right + adaptiveSession.partial,
    wrong: adaptiveSession.wrong,
  }));
  add(after !== before
    ? t('ai.summaryLevelUp', { before, after })
    : t('ai.summaryLevel', { level: after }));
  add(t('ai.summaryStats', {
    mastered: s.mastered, total: s.total, accuracy: s.accuracy ?? '—',
  }), 'hint');

  showAdaptiveView('done');
  renderAdaptiveProfile();
}

$('#btn-adaptive-reset').addEventListener('click', async () => {
  const lang = adaptiveLang();
  const ok = await modal({
    title: t('ai.resetAsk', { lang: t(`lang.${lang}`) }),
    okText: t('ai.resetOk'),
  });
  if (!ok) return;
  await db.clearAiWords(lang);
  localStorage.removeItem(levelKey(lang));
  renderAdaptiveProfile();
  toast(t('ai.resetDone'));
});

// --- Налаштування ---
function fillUiLangSelect() {
  const sel = $('#settings-ui-lang');
  sel.innerHTML = '';
  const auto = document.createElement('option');
  auto.value = '';
  auto.textContent = t('settings.uiLangAuto');
  sel.appendChild(auto);
  for (const [code, name] of Object.entries(UI_LANGS)) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  sel.value = getSavedLang();
}

$('#settings-ui-lang').addEventListener('change', (e) => {
  setLang(e.target.value); // '' = автоматично, за мовою браузера
});

function syncProviderFields() {
  const p = $('#settings-provider').value;
  $('#field-gemini-key').classList.toggle('hidden', p !== 'gemini');
  $('#field-groq-key').classList.toggle('hidden', p !== 'groq');
  $('#field-anthropic-key').classList.toggle('hidden', p !== 'anthropic');
}
$('#settings-provider').value = settings.provider;
$('#settings-gemini-key').value = settings.geminiKey;
$('#settings-groq-key').value = settings.groqKey;
$('#settings-api-key').value = settings.apiKey;
$('#settings-new-limit').value = settings.newLimit;
syncProviderFields();
$('#settings-provider').addEventListener('change', syncProviderFields);
$('#btn-save-settings').addEventListener('click', () => {
  settings.provider = $('#settings-provider').value;
  settings.geminiKey = $('#settings-gemini-key').value.trim();
  settings.groqKey = $('#settings-groq-key').value.trim();
  settings.apiKey = $('#settings-api-key').value.trim();
  settings.newLimit = Math.max(1, Number($('#settings-new-limit').value) || 20);
  toast(t('settings.saved'));
});

// --- Старт ---
// Перемальовуємо все, що будується в JS, коли змінюється мова інтерфейсу
document.addEventListener('i18n:changed', () => {
  fillUiLangSelect();
  fillLangSelects();
  fillDeckSelects();
  renderDecks();
  renderAdaptiveProfile();
});

await db.migrateLangCodes(LEGACY_LANG_NAMES);
applyI18n();   // спричиняє i18n:changed → заповнює селекти й малює колоди
