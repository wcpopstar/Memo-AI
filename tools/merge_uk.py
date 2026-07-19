#!/usr/bin/env python3
"""
Вливает украинские переводы в собранный словарь.

Переводы лежат отдельно от build.py намеренно: build.py пересобирает
словарь из внешних источников и затирает результат, а переводы —
ручная работа, которую терять нельзя. Поэтому порядок такой:

    python3 build.py          # пересобрать из Викисловаря/Tatoeba
    python3 merge_uk.py       # добавить украинский обратно

Формат tools/uk/*.tsv:  слово<TAB>переклад
Слово должно совпадать с полем "w" в словаре, включая артикль.
"""
import json
import glob
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, '..', 'data', 'nl.json')


def load_translations():
    """Читает все tools/uk/*.tsv в один словарь."""
    out = {}
    for path in sorted(glob.glob(os.path.join(HERE, 'uk', '*.tsv'))):
        for n, line in enumerate(open(path, encoding='utf-8'), 1):
            line = line.rstrip('\n')
            if not line.strip():
                continue
            parts = line.split('\t')
            if len(parts) != 2 or not parts[1].strip():
                print(f'  ⚠️  {os.path.basename(path)}:{n} — строка не разобрана: {line!r}')
                continue
            word, uk = parts[0].strip(), parts[1].strip()
            if word in out and out[word] != uk:
                print(f'  ⚠️  дубликат «{word}»: «{out[word]}» / «{uk}»')
            out[word] = uk
    return out


def main():
    data = json.load(open(DATA, encoding='utf-8'))
    uk = load_translations()

    applied = 0
    unused = set(uk)
    for entry in data['words']:
        t = uk.get(entry['w'])
        if t:
            entry['t']['uk'] = t
            applied += 1
            unused.discard(entry['w'])

    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))

    # Отчёт по покрытию: где украинского нет, приложение покажет английский
    by_level = {}
    for e in data['words']:
        lvl = e['l']
        got, total = by_level.get(lvl, (0, 0))
        by_level[lvl] = (got + ('uk' in e['t']), total + 1)

    print(f'переводов в tools/uk: {len(uk)}')
    print(f'проставлено в словарь: {applied}')
    if unused:
        print(f'не нашли слово в словаре ({len(unused)}): {sorted(unused)[:10]}')
    print('покрытие по уровням:')
    for lvl in ('A1', 'A2', 'B1', 'B2', 'C1'):
        if lvl in by_level:
            got, total = by_level[lvl]
            print(f'  {lvl}: {got}/{total} ({got * 100 // total}%)')
    return 0 if not unused else 1


if __name__ == '__main__':
    sys.exit(main())
