// Мови вивчення. Код мови — стабільний ключ (зберігається в базі та
// localStorage), назва береться зі словника i18n (`lang.<code>`).
//
//  articles — означені/неозначені артиклі. Потрібні для вправи «напиши слово»:
//             якщо слово написане правильно, але без артикля (або з чужим) —
//             відповідь зараховується як «майже» (жовтий), а не помилка.
//  requireArticle — чи є артикль частиною словникової форми. У нідерландській
//             de/het треба вчити разом зі словом (це рід), в англійській — ні,
//             тому там артикля ані вимагаємо, ані підказуємо.
//  speech   — локаль для розпізнавання мовлення (Web Speech API).

export const STUDY_LANGS = [
  { code: 'en', english: 'English',    articles: ['the', 'a', 'an'],                    speech: 'en-US', requireArticle: false },
  { code: 'nl', english: 'Dutch',      articles: ['de', 'het', 'een'],                  speech: 'nl-NL', requireArticle: true },
  { code: 'de', english: 'German',     articles: ['der', 'die', 'das', 'ein', 'eine'],  speech: 'de-DE', requireArticle: true },
  { code: 'pl', english: 'Polish',     articles: [],                                    speech: 'pl-PL', requireArticle: false },
  { code: 'es', english: 'Spanish',    articles: ['el', 'la', 'los', 'las', 'un', 'una'], speech: 'es-ES', requireArticle: true },
  { code: 'fr', english: 'French',     articles: ['le', 'la', 'les', 'un', 'une', "l'"], speech: 'fr-FR', requireArticle: true },
  { code: 'it', english: 'Italian',    articles: ['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una'], speech: 'it-IT', requireArticle: true },
  { code: 'cs', english: 'Czech',      articles: [],                                    speech: 'cs-CZ', requireArticle: false },
  { code: 'ja', english: 'Japanese',   articles: [],                                    speech: 'ja-JP', requireArticle: false },
  { code: 'ko', english: 'Korean',     articles: [],                                    speech: 'ko-KR', requireArticle: false },
];

const BY_CODE = Object.fromEntries(STUDY_LANGS.map(l => [l.code, l]));

export const getStudyLang = (code) => BY_CODE[code] || BY_CODE.en;

// Старі записи в базі зберігали мову українською назвою.
// Одноразово переводимо їх на коди (див. db.migrateLangCodes).
export const LEGACY_LANG_NAMES = {
  'англійська': 'en',
  'нідерландська': 'nl',
  'німецька': 'de',
  'польська': 'pl',
  'іспанська': 'es',
  'французька': 'fr',
  'італійська': 'it',
  'чеська': 'cs',
  'японська': 'ja',
  'корейська': 'ko',
};
