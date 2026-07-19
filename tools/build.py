#!/usr/bin/env python3
"""
Сборка словаря нидерландского для приложения «Мемо».

Источники:
  freq_nl.txt   — частотность по субтитрам OpenSubtitles (hermitdave/FrequencyWords, MIT)
  nl_full.jsonl — извлечение английского Викисловаря (kaikki.org / wiktextract, CC-BY-SA)

Что берём:
  • артикль существительного — из грамматического рода Викисловаря (neuter → het, иначе de)
  • английское значение — первый gloss
  • пример предложения — из Викисловаря, если он короткий

Уровень CEFR проставляется по рангу частотности — это эвристика,
а не официальная разметка (см. LEVELS ниже).
"""
import json, re, sys, unicodedata
import collections
from collections import OrderedDict
from stoplist import FUNCTION_WORDS
from overrides import BLACKLIST, FIXES

FREQ = 'freq_nl.txt'
WIKT = 'nl_full.jsonl'
OUT = 'nl.json'

# Части речи, годные для словарных карточек.
# Служебные слова (предлоги, союзы, местоимения) учат в контексте, не карточками.
KEEP_POS = {'noun', 'verb', 'adj', 'adv'}

# Если у слова есть хоть одна статья с такой частью речи — это служебное слово
# или имя собственное. Даже если рядом есть омоним-существительное, в карточке
# оно собьёт с толку: пользователь знает это слово в другом значении.
BLOCK_POS = {'pron', 'det', 'prep', 'conj', 'article', 'particle', 'postp',
             'circumpos', 'contraction', 'num', 'prep_phrase', 'phrase',
             'proverb', 'name', 'prefix', 'suffix', 'interfix', 'circumfix',
             'character', 'symbol', 'punct'}

# Порог по счётчику ОТОБРАННЫХ слов (не по сырому рангу: в частотный список
# входят служебные слова и словоформы, которых в карточках нет).
# Границы примерно соответствуют принятым объёмам словаря по CEFR.
LEVELS = [(500, 'A1'), (1500, 'A2'), (3000, 'B1'), (4200, 'B2')]
LEVEL_REST = 'C1'
LIMIT = 5000  # сколько слов оставить всего

# Пометы, по которым значение отбрасываем: устаревшее, диалектное, редкое и т.п.
# Значения вида «хороший человек», «номинализация от…» — это не слово,
# а грамматическая производная. В карточке она бесполезна.
NOMINALIZATION_RE = re.compile(
    r'^(a |an |the )?(nominalization|nominalisation)\b'
    r'|\b(person|one) who\b'
    r'|^(a |an )?\w+ person\b'
    r'|^Translated into\b'
    r'|^(a |an |the )?(male|female) (person|human)\b',
    re.I)

BAD_TAGS = {
    'obsolete', 'archaic', 'dialectal', 'rare', 'dated', 'poetic',
    'informal-nonstandard', 'nonstandard', 'misspelling', 'alt-of',
    'abbreviation', 'initialism', 'vulgar', 'offensive', 'slur',
}

# Слова, которые не нужны в словаре для изучения
SKIP_WORDS = FUNCTION_WORDS


def level_for(index):
    for limit, lvl in LEVELS:
        if index <= limit:
            return lvl
    return LEVEL_REST


def load_tatoeba(path, needed):
    """Проход по корпусу Tatoeba. Возвращает:

      best      слово → короткое предложение с этим словом
      best_np   слово → предложение, где слово стоит с артиклем («de hond»)
      noun_hits слово → сколько раз встретилось как «de/het слово»

    noun_hits — проверка того, что существительное действительно употребимо.
    У многих глагольных форм есть омоним-существительное («wacht» — и «ждёт»,
    и «караул»); если сочетание с артиклем в корпусе не встречается,
    существительное маргинальное и в карточки не годится.
    """
    best, best_np = {}, {}
    noun_hits = collections.Counter()
    token = re.compile(r"[a-zà-ÿA-ZÀ-Ÿ']+")
    for line in open(path, encoding='utf-8'):
        parts = line.rstrip('\n').split('\t')
        if len(parts) != 3:
            continue
        text = parts[2].strip()
        words = [t.lower() for t in token.findall(text)]
        # Сочетания «артикль + существительное»
        for a, b in zip(words, words[1:]):
            if a in ('de', 'het') and b in needed:
                noun_hits[b] += 1
                if 25 <= len(text) <= 70:
                    cur = best_np.get(b)
                    if cur is None or len(text) < len(cur):
                        best_np[b] = text
        if not (25 <= len(text) <= 70):
            continue
        for w in set(words):
            if w not in needed:
                continue
            cur = best.get(w)
            if cur is None or len(text) < len(cur):
                best[w] = text
    return best, best_np, noun_hits


def clean_gloss(g):
    """Чистим значение: убираем пометы в скобках и служебные хвосты."""
    g = re.sub(r'\([^)]*\)', '', g)          # (transitive), (of a person) …
    g = re.sub(r'\[[^\]]*\]', '', g)
    # В Викисловаре встречаются незакрытые скобки: после удаления пар
    # остаётся одиночная. Отрезаем хвост от неё — там всегда уточнение.
    g = re.split(r'[()\[\]]', g)[0]
    g = re.sub(r'\s+([,;])', r'\1', g)       # «director , manager» → «director, manager»
    g = re.sub(r'\s+', ' ', g).strip(' ,;:.')
    return g


def pick_sense(entry):
    """Первое пригодное значение: возвращает (gloss, tags) или None."""
    for s in entry.get('senses', []):
        tags = set(s.get('tags', []))
        if tags & BAD_TAGS or 'form-of' in tags or s.get('form_of'):
            continue
        glosses = s.get('glosses') or []
        if not glosses:
            continue
        g = clean_gloss(glosses[0])
        # Служебные строки Викисловаря вида "plural of hond"
        # «inflection of ramen», «third-person singular present indicative of zijn»
        if not g or re.search(
                r'\b(inflection|plural|singular|participle|form|indicative|subjunctive'
                r'|imperative|infinitive|gerund|comparative|superlative) of \b', g):
            continue
        if NOMINALIZATION_RE.search(g):
            continue
        if re.match(r'^(first|second|third)-person\b', g):
            continue
        if len(g) > 60:
            g = g.split(',')[0].strip()
        if not g:
            continue
        return g, tags
    return None


GENDER_RE = re.compile(r"^\S+(?:\s+\S+)?\s+([nmfc])\b")


def pick_article(entry):
    """de / het из строки заголовка Викисловаря.

    Заголовок выглядит как «raam n or f or m (plural ramen…)» или «hond m (…)».
    Берём ПЕРВУЮ пометку рода: у слов с колебанием рода она соответствует
    литературной норме (raam n → het raam). Агрегировать пометки всех значений
    нельзя — тогда het raam превращается в de raam.
    """
    for h in entry.get('head_templates', []) or []:
        m = GENDER_RE.match((h.get('expansion') or '').strip())
        if m:
            return 'het' if m.group(1) == 'n' else 'de'
    return None


def pick_example(entry, word):
    """Короткий пример из Викисловаря, содержащий само слово."""
    best = None
    for s in entry.get('senses', []):
        for ex in s.get('examples', []) or []:
            text = (ex.get('text') or '').strip()
            if not text or len(text) > 90 or '\n' in text:
                continue
            if word.lower() not in text.lower():
                continue
            if best is None or len(text) < len(best):
                best = text
    return best


def main():
    # 1. Частотность: слово → ранг
    rank = OrderedDict()
    for i, line in enumerate(open(FREQ, encoding='utf-8'), 1):
        parts = line.split()
        if len(parts) == 2:
            rank.setdefault(parts[0], i)

    # 2. Викисловарь: слово → лучшая словарная статья
    entries = {}
    blocked = set()
    total = 0
    for line in open(WIKT, encoding='utf-8'):
        total += 1
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        if d.get('lang_code') != 'nl':
            continue
        w = d.get('word', '')
        if not w or not re.fullmatch(r"[a-zà-ÿA-ZÀ-Ÿ' -]+", w) or w not in rank:
            continue
        if d.get('pos') in BLOCK_POS:
            blocked.add(w)
            continue
        if d.get('pos') not in KEEP_POS:
            continue
        # Существительные приоритетнее (у них есть артикль, они полезнее),
        # но только если у существительного есть годное значение: иначе
        # «lekker» стало бы «протечкой» вместо прилагательного «вкусный».
        prev = entries.get(w)
        if prev is None:
            entries[w] = d
        elif d['pos'] == 'noun' and prev['pos'] != 'noun':
            if pick_sense(d):
                entries[w] = d

    # 3. Примеры из Tatoeba — только для слов, которые реально могут попасть
    tatoeba, tatoeba_np, noun_hits = load_tatoeba('nld.tsv', set(entries.keys()))
    MIN_NOUN_HITS = 2  # сколько раз «de/het слово» должно встретиться в корпусе

    # 4. Сборка
    words = []
    seen = set()
    no_article = 0
    from_tatoeba = 0
    marginal = 0
    for w, r in rank.items():
        if len(words) >= LIMIT:
            break
        if w in SKIP_WORDS or w in seen:
            continue
        if w in blocked or w in BLACKLIST:
            continue
        e = entries.get(w)
        if not e:
            continue
        sense = pick_sense(e)
        if not sense:
            continue
        gloss, _ = sense
        display = w
        if e['pos'] == 'noun':
            art = pick_article(e)
            if not art:
                no_article += 1
                continue  # существительное без надёжного рода не берём
            if noun_hits[w] < MIN_NOUN_HITS:
                marginal += 1
                continue  # как существительное в живой речи почти не встречается
            display = f'{art} {w}'
        item = {'w': display, 't': {'en': gloss}, 'l': level_for(len(words) + 1), 'p': e['pos']}
        ex = pick_example(e, w)
        if not ex:
            # У существительного пример с артиклем нагляднее и подтверждает род
            ex = tatoeba_np.get(w) if e['pos'] == 'noun' else None
            ex = ex or tatoeba.get(w)
            if ex:
                from_tatoeba += 1
        if ex:
            item['e'] = ex
        fix = FIXES.get(w)
        if fix:
            item['t']['en'] = fix['t']
        words.append(item)
        seen.add(w)

    out = {
        'lang': 'nl',
        'generated': True,
        'sources': [
            {'name': 'English Wiktionary via kaikki.org (wiktextract)', 'license': 'CC BY-SA 4.0'},
            {'name': 'OpenSubtitles frequency list (hermitdave/FrequencyWords)', 'license': 'MIT'},
            {'name': 'Tatoeba example sentences', 'license': 'CC BY 2.0 FR'},
        ],
        'words': words,
    }
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))

    by_level = {}
    for x in words:
        by_level[x['l']] = by_level.get(x['l'], 0) + 1
    by_pos = {}
    for x in words:
        by_pos[x['p']] = by_pos.get(x['p'], 0) + 1
    print(f'строк в Викисловаре: {total}')
    print(f'слов в словаре: {len(words)}')
    print(f'исключено как служебные/имена: {len(blocked & set(rank))}')
    print(f'существительных отброшено (нет надёжного рода): {no_article}')
    print(f'существительных отброшено (маргинальные омонимы): {marginal}')
    print(f'с примером: {sum(1 for x in words if "e" in x)} (из них Tatoeba: {from_tatoeba})')
    print('по уровням:', dict(sorted(by_level.items())))
    print('по частям речи:', dict(sorted(by_pos.items(), key=lambda kv: -kv[1])))


if __name__ == '__main__':
    main()
