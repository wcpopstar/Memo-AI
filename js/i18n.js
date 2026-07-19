// Локалізація інтерфейсу: українська, англійська, нідерландська.
// Мова визначається автоматично з налаштувань браузера/пристрою
// (navigator.languages), користувач може змінити її в Налаштуваннях.

export const UI_LANGS = {
  uk: 'Українська',
  en: 'English',
  nl: 'Nederlands',
};

// Мова перекладу для AI (у промпті — англійською, щоб модель зрозуміла)
export const UI_LANG_IN_ENGLISH = {
  uk: 'Ukrainian',
  en: 'English',
  nl: 'Dutch',
};

const DICT = {
  uk: {
    'app.title': "Мемо — картки для запам'ятовування",
    'app.brand': 'Мемо',

    'nav.decks': 'Колоди',
    'nav.add': 'Додати',
    'nav.ai': 'AI',
    'nav.more': 'Ще',

    'decks.title': '📚 Мої колоди',
    'decks.empty': 'Поки що немає колод.<br>Створіть нову або імпортуйте з Anki.',
    'decks.new': '＋ Нова колода',
    'decks.import': '📥 Імпорт з Anki (.apkg / .colpkg)',
    'decks.due': 'До повторення: {n}',
    'decks.fresh': 'Нові: {n}',
    'decks.total': 'Всього: {n}',
    'decks.delete': 'Видалити',
    'decks.deleteAsk': 'Видалити колоду «{name}» разом з картками?',
    'decks.deleted': 'Колоду видалено',
    'decks.newAsk': 'Назва нової колоди:',
    'decks.create': 'Створити',
    'decks.created': 'Колоду створено ✅',
    'decks.none': '— спершу створіть колоду —',
    'decks.importing': 'Імпортуємо колоду…',
    'decks.imported': 'Імпортовано «{name}»: {n} карток',
    'decks.importError': 'Помилка імпорту: {msg}',

    'study.title': 'Навчання',
    'study.show': 'Показати відповідь',
    'study.again': 'Знову',
    'study.hard': 'Важко',
    'study.good': 'Добре',
    'study.easy': 'Легко',
    'study.done': 'Вітаємо! На сьогодні все.',
    'study.toDecks': 'До колод',
    'study.counter': '{done} / {total} · залишилось {left}',
    'study.nothing': 'У цій колоді немає карток до повторення 🎉',

    'add.title': '✏️ Нова картка',
    'add.deck': 'Колода',
    'add.front': 'Передня сторона',
    'add.frontPh': 'Питання або слово…',
    'add.back': 'Зворотна сторона',
    'add.backPh': 'Відповідь або переклад…',
    'add.submit': 'Додати картку',
    'add.needDeck': 'Спершу створіть колоду',
    'add.needBoth': 'Заповніть обидві сторони картки',
    'add.added': 'Картку додано ✅',

    'ai.titleAdaptive': '🧠 Адаптивний режим',
    'ai.titleGenerator': '✨ Картки в колоду',
    'ai.noKey': 'Щоб користуватися AI, додайте API-ключ у <a href="#" id="link-settings">Налаштуваннях</a>. Через Gemini або Groq це повністю безплатно.',
    'ai.hint': "AI показуватиме слова, а ви відповідатимете «Знаю» / «Не знаю». Він запам'ятає результат, сам визначить ваш рівень і надалі підбиратиме слова під нього: складні — частіше, засвоєні — прибиратиме. Інколи він попросить написати слово по буквах або продиктувати його вголос.",
    'ai.studyLang': 'Мова вивчення',
    'ai.topic': "Тема (необов'язково)",
    'ai.topicPh': 'Напр.: робота, побут — або залиште порожнім',
    'ai.start': '▶️ Почати сесію',
    'ai.preparing': '⏳ AI готує слова…',
    'ai.reset': '🗑️ Скинути прогрес цієї мови',
    'ai.resetAsk': 'Скинути весь прогрес для мови «{lang}»?',
    'ai.resetOk': 'Скинути',
    'ai.resetDone': 'Прогрес скинуто',
    'ai.toGenerator': 'Або згенерувати картки у звичайну колоду →',
    'ai.toAdaptive': '← Повернутися до адаптивного режиму',
    'ai.reveal': 'Показати відповідь',
    'ai.dontKnow': '❌ Не знаю',
    'ai.know': '✅ Знаю',
    'ai.continue': 'Продовжити',
    'ai.finish': 'Завершити',
    'ai.left': 'залишилось {n}',
    'ai.needKey': 'Спершу додайте API-ключ',
    'ai.badKey': 'Невірний API-ключ. Перевірте його в Налаштуваннях.',
    'ai.error': 'Помилка: {msg}',
    'ai.allMastered': 'Усі слова засвоєно! Спробуйте іншу тему.',

    'ai.level': 'Ваш рівень (за відповідями)',
    'ai.accuracy': 'Точність',
    'ai.mastered': 'Засвоєно слів',
    'ai.struggling': 'Проблемних слів',
    'ai.masteredOf': '{n} з {total}',
    'ai.summaryAnswers': 'Відповідей: {right} правильних, {wrong} — ні.',
    'ai.summaryLevelUp': 'Ваш рівень оновлено: {before} → {after} 🎉',
    'ai.summaryLevel': 'Ваш рівень: {level}',
    'ai.summaryStats': 'Засвоєно слів: {mastered} з {total}. Точність: {accuracy}%',

    'spell.prompt': '✍️ Напишіть це слово мовою вивчення',
    'spell.hintArticle': 'Не забудьте артикль ({articles})',
    'spell.placeholder': 'Введіть слово…',
    'spell.check': 'Перевірити',
    'spell.idk': 'Не знаю',
    'spell.correct': '✅ Правильно!',
    'spell.partial': '🟡 Слово вірне, але артикль — ні. Правильно: {answer}',
    'spell.wrong': '❌ Правильна відповідь: {answer}',
    'spell.next': 'Далі',

    'speak.prompt': '🎤 Продиктуйте це слово мовою вивчення',
    'speak.start': '🎤 Говорити',
    'speak.listening': '🔴 Слухаю…',
    'speak.heard': 'Почуто: «{text}»',
    'speak.unsupported': 'Ваш браузер не підтримує розпізнавання мови',
    'speak.denied': 'Немає доступу до мікрофона',
    'speak.nothing': 'Нічого не почули, спробуйте ще раз',
    'speak.retry': '🔄 Ще раз',
    'speak.skip': 'Пропустити',

    'settings.title': '⚙️ Налаштування',
    'settings.uiLang': 'Мова інтерфейсу',
    'settings.uiLangAuto': 'Автоматично (як у браузері)',
    'settings.provider': 'Провайдер AI',
    'settings.providerGemini': 'Google Gemini — безплатно (рекомендовано)',
    'settings.providerGroq': 'Groq — безплатно (Llama)',
    'settings.providerAnthropic': 'Anthropic Claude — платно, якісніше',
    'settings.geminiKey': 'API-ключ Google Gemini',
    'settings.geminiHint': 'Безплатно: зайдіть на aistudio.google.com (через Google-акаунт, без картки) → Get API key → Create API key. Ключ зберігається лише у вашому браузері.',
    'settings.groqKey': 'API-ключ Groq',
    'settings.groqHint': 'Безплатно: зареєструйтеся на console.groq.com (без картки) → API Keys → Create API Key. Ключ зберігається лише у вашому браузері.',
    'settings.anthropicKey': 'API-ключ Anthropic',
    'settings.anthropicHint': 'Платний API: console.anthropic.com. Ключ зберігається лише у вашому браузері.',
    'settings.save': 'Зберегти',
    'settings.saved': 'Налаштування збережено ✅',
    'settings.newLimit': 'Ліміт нових карток на день',
    'settings.footer': 'Мемо — безплатний клон Anki для телефону. Дані зберігаються локально у вашому браузері.',

    'gen.topic': 'Тема',
    'gen.topicPh': 'Напр.: подорожі, їжа, IT-лексика…',
    'gen.level': 'Рівень',
    'gen.count': 'Кількість карток: ',
    'gen.generate': '✨ Згенерувати картки',
    'gen.working': '✨ AI підбирає слова… (до хвилини)',
    'gen.needTopic': 'Вкажіть тему',
    'gen.ready': 'Готово! Додано {n} карток ✅',

    'err.noCards': 'AI не повернув картки. Спробуйте ще раз.',
    'err.empty': 'Порожня відповідь від AI.',
    'err.rateLimit': 'Перевищено безплатний ліміт {provider}. Зачекайте хвилину і спробуйте ще раз.',
    'err.refused': 'Модель відхилила запит. Спробуйте іншу тему.',

    'modal.cancel': 'Скасувати',
    'modal.ok': 'OK',

    'ivl.min': '{n} хв',
    'ivl.day': '{n} д',
    'ivl.month': '{n} міс',
    'ivl.year': '{n} р',

    'lang.en': 'Англійська',
    'lang.nl': 'Нідерландська',
    'lang.de': 'Німецька',
    'lang.pl': 'Польська',
    'lang.es': 'Іспанська',
    'lang.fr': 'Французька',
    'lang.it': 'Італійська',
    'lang.cs': 'Чеська',
    'lang.ja': 'Японська',
    'lang.ko': 'Корейська',
    'lang.uk': 'Українська',
  },

  en: {
    'app.title': 'Memo — flashcards for learning',
    'app.brand': 'Memo',

    'nav.decks': 'Decks',
    'nav.add': 'Add',
    'nav.ai': 'AI',
    'nav.more': 'More',

    'decks.title': '📚 My decks',
    'decks.empty': 'No decks yet.<br>Create one or import from Anki.',
    'decks.new': '＋ New deck',
    'decks.import': '📥 Import from Anki (.apkg / .colpkg)',
    'decks.due': 'Due: {n}',
    'decks.fresh': 'New: {n}',
    'decks.total': 'Total: {n}',
    'decks.delete': 'Delete',
    'decks.deleteAsk': 'Delete deck “{name}” with all its cards?',
    'decks.deleted': 'Deck deleted',
    'decks.newAsk': 'Name of the new deck:',
    'decks.create': 'Create',
    'decks.created': 'Deck created ✅',
    'decks.none': '— create a deck first —',
    'decks.importing': 'Importing deck…',
    'decks.imported': 'Imported “{name}”: {n} cards',
    'decks.importError': 'Import failed: {msg}',

    'study.title': 'Study',
    'study.show': 'Show answer',
    'study.again': 'Again',
    'study.hard': 'Hard',
    'study.good': 'Good',
    'study.easy': 'Easy',
    'study.done': 'Well done! Nothing left for today.',
    'study.toDecks': 'Back to decks',
    'study.counter': '{done} / {total} · {left} left',
    'study.nothing': 'Nothing due in this deck 🎉',

    'add.title': '✏️ New card',
    'add.deck': 'Deck',
    'add.front': 'Front',
    'add.frontPh': 'Question or word…',
    'add.back': 'Back',
    'add.backPh': 'Answer or translation…',
    'add.submit': 'Add card',
    'add.needDeck': 'Create a deck first',
    'add.needBoth': 'Fill in both sides of the card',
    'add.added': 'Card added ✅',

    'ai.titleAdaptive': '🧠 Adaptive mode',
    'ai.titleGenerator': '✨ Cards into a deck',
    'ai.noKey': 'To use AI, add an API key in <a href="#" id="link-settings">Settings</a>. With Gemini or Groq it is completely free.',
    'ai.hint': 'The AI shows you words and you answer “I know” / “I don’t know”. It remembers the result, works out your level and picks words to match: hard ones more often, mastered ones dropped. Sometimes it will ask you to spell a word or say it out loud.',
    'ai.studyLang': 'Language you are learning',
    'ai.topic': 'Topic (optional)',
    'ai.topicPh': 'e.g. work, everyday life — or leave empty',
    'ai.start': '▶️ Start session',
    'ai.preparing': '⏳ AI is preparing words…',
    'ai.reset': '🗑️ Reset progress for this language',
    'ai.resetAsk': 'Reset all progress for “{lang}”?',
    'ai.resetOk': 'Reset',
    'ai.resetDone': 'Progress reset',
    'ai.toGenerator': 'Or generate cards into a normal deck →',
    'ai.toAdaptive': '← Back to adaptive mode',
    'ai.reveal': 'Show answer',
    'ai.dontKnow': '❌ I don’t know',
    'ai.know': '✅ I know it',
    'ai.continue': 'Continue',
    'ai.finish': 'Finish',
    'ai.left': '{n} left',
    'ai.needKey': 'Add an API key first',
    'ai.badKey': 'Invalid API key. Check it in Settings.',
    'ai.error': 'Error: {msg}',
    'ai.allMastered': 'All words mastered! Try another topic.',

    'ai.level': 'Your level (from your answers)',
    'ai.accuracy': 'Accuracy',
    'ai.mastered': 'Words mastered',
    'ai.struggling': 'Difficult words',
    'ai.masteredOf': '{n} of {total}',
    'ai.summaryAnswers': 'Answers: {right} correct, {wrong} wrong.',
    'ai.summaryLevelUp': 'Your level was updated: {before} → {after} 🎉',
    'ai.summaryLevel': 'Your level: {level}',
    'ai.summaryStats': 'Mastered: {mastered} of {total}. Accuracy: {accuracy}%',

    'spell.prompt': '✍️ Spell this word in the language you are learning',
    'spell.hintArticle': 'Don’t forget the article ({articles})',
    'spell.placeholder': 'Type the word…',
    'spell.check': 'Check',
    'spell.idk': 'I don’t know',
    'spell.correct': '✅ Correct!',
    'spell.partial': '🟡 The word is right, the article is not. Correct: {answer}',
    'spell.wrong': '❌ Correct answer: {answer}',
    'spell.next': 'Next',

    'speak.prompt': '🎤 Say this word out loud in the language you are learning',
    'speak.start': '🎤 Speak',
    'speak.listening': '🔴 Listening…',
    'speak.heard': 'Heard: “{text}”',
    'speak.unsupported': 'Your browser does not support speech recognition',
    'speak.denied': 'No access to the microphone',
    'speak.nothing': 'Didn’t catch that, try again',
    'speak.retry': '🔄 Try again',
    'speak.skip': 'Skip',

    'settings.title': '⚙️ Settings',
    'settings.uiLang': 'Interface language',
    'settings.uiLangAuto': 'Automatic (follow browser)',
    'settings.provider': 'AI provider',
    'settings.providerGemini': 'Google Gemini — free (recommended)',
    'settings.providerGroq': 'Groq — free (Llama)',
    'settings.providerAnthropic': 'Anthropic Claude — paid, higher quality',
    'settings.geminiKey': 'Google Gemini API key',
    'settings.geminiHint': 'Free: go to aistudio.google.com (Google account, no card) → Get API key → Create API key. The key is stored only in your browser.',
    'settings.groqKey': 'Groq API key',
    'settings.groqHint': 'Free: sign up at console.groq.com (no card) → API Keys → Create API Key. The key is stored only in your browser.',
    'settings.anthropicKey': 'Anthropic API key',
    'settings.anthropicHint': 'Paid API: console.anthropic.com. The key is stored only in your browser.',
    'settings.save': 'Save',
    'settings.saved': 'Settings saved ✅',
    'settings.newLimit': 'New cards per day limit',
    'settings.footer': 'Memo — a free Anki clone for your phone. Data is stored locally in your browser.',

    'gen.topic': 'Topic',
    'gen.topicPh': 'e.g. travel, food, IT vocabulary…',
    'gen.level': 'Level',
    'gen.count': 'Number of cards: ',
    'gen.generate': '✨ Generate cards',
    'gen.working': '✨ AI is picking words… (up to a minute)',
    'gen.needTopic': 'Enter a topic',
    'gen.ready': 'Done! Added {n} cards ✅',

    'err.noCards': 'The AI returned no cards. Try again.',
    'err.empty': 'Empty response from the AI.',
    'err.rateLimit': 'The free {provider} limit was exceeded. Wait a minute and try again.',
    'err.refused': 'The model declined the request. Try another topic.',

    'modal.cancel': 'Cancel',
    'modal.ok': 'OK',

    'ivl.min': '{n} min',
    'ivl.day': '{n} d',
    'ivl.month': '{n} mo',
    'ivl.year': '{n} y',

    'lang.en': 'English',
    'lang.nl': 'Dutch',
    'lang.de': 'German',
    'lang.pl': 'Polish',
    'lang.es': 'Spanish',
    'lang.fr': 'French',
    'lang.it': 'Italian',
    'lang.cs': 'Czech',
    'lang.ja': 'Japanese',
    'lang.ko': 'Korean',
    'lang.uk': 'Ukrainian',
  },

  nl: {
    'app.title': 'Memo — flashcards om te leren',
    'app.brand': 'Memo',

    'nav.decks': 'Decks',
    'nav.add': 'Toevoegen',
    'nav.ai': 'AI',
    'nav.more': 'Meer',

    'decks.title': '📚 Mijn decks',
    'decks.empty': 'Nog geen decks.<br>Maak er een of importeer uit Anki.',
    'decks.new': '＋ Nieuw deck',
    'decks.import': '📥 Importeren uit Anki (.apkg / .colpkg)',
    'decks.due': 'Te herhalen: {n}',
    'decks.fresh': 'Nieuw: {n}',
    'decks.total': 'Totaal: {n}',
    'decks.delete': 'Verwijderen',
    'decks.deleteAsk': 'Deck “{name}” met alle kaarten verwijderen?',
    'decks.deleted': 'Deck verwijderd',
    'decks.newAsk': 'Naam van het nieuwe deck:',
    'decks.create': 'Aanmaken',
    'decks.created': 'Deck aangemaakt ✅',
    'decks.none': '— maak eerst een deck —',
    'decks.importing': 'Deck importeren…',
    'decks.imported': '“{name}” geïmporteerd: {n} kaarten',
    'decks.importError': 'Import mislukt: {msg}',

    'study.title': 'Leren',
    'study.show': 'Antwoord tonen',
    'study.again': 'Opnieuw',
    'study.hard': 'Moeilijk',
    'study.good': 'Goed',
    'study.easy': 'Makkelijk',
    'study.done': 'Goed gedaan! Voor vandaag ben je klaar.',
    'study.toDecks': 'Terug naar decks',
    'study.counter': '{done} / {total} · nog {left}',
    'study.nothing': 'Niets te herhalen in dit deck 🎉',

    'add.title': '✏️ Nieuwe kaart',
    'add.deck': 'Deck',
    'add.front': 'Voorkant',
    'add.frontPh': 'Vraag of woord…',
    'add.back': 'Achterkant',
    'add.backPh': 'Antwoord of vertaling…',
    'add.submit': 'Kaart toevoegen',
    'add.needDeck': 'Maak eerst een deck',
    'add.needBoth': 'Vul beide kanten van de kaart in',
    'add.added': 'Kaart toegevoegd ✅',

    'ai.titleAdaptive': '🧠 Adaptieve modus',
    'ai.titleGenerator': '✨ Kaarten in een deck',
    'ai.noKey': 'Voeg een API-sleutel toe bij <a href="#" id="link-settings">Instellingen</a> om AI te gebruiken. Met Gemini of Groq is dat helemaal gratis.',
    'ai.hint': 'De AI laat woorden zien en jij antwoordt “Ik weet het” / “Ik weet het niet”. Hij onthoudt het resultaat, bepaalt je niveau en kiest daar woorden bij: moeilijke vaker, beheerste verdwijnen. Soms vraagt hij je een woord te spellen of hardop uit te spreken.',
    'ai.studyLang': 'Taal die je leert',
    'ai.topic': 'Onderwerp (optioneel)',
    'ai.topicPh': 'bijv. werk, dagelijks leven — of laat leeg',
    'ai.start': '▶️ Sessie starten',
    'ai.preparing': '⏳ AI bereidt woorden voor…',
    'ai.reset': '🗑️ Voortgang voor deze taal wissen',
    'ai.resetAsk': 'Alle voortgang voor “{lang}” wissen?',
    'ai.resetOk': 'Wissen',
    'ai.resetDone': 'Voortgang gewist',
    'ai.toGenerator': 'Of genereer kaarten in een gewoon deck →',
    'ai.toAdaptive': '← Terug naar adaptieve modus',
    'ai.reveal': 'Antwoord tonen',
    'ai.dontKnow': '❌ Ik weet het niet',
    'ai.know': '✅ Ik weet het',
    'ai.continue': 'Doorgaan',
    'ai.finish': 'Afronden',
    'ai.left': 'nog {n}',
    'ai.needKey': 'Voeg eerst een API-sleutel toe',
    'ai.badKey': 'Ongeldige API-sleutel. Controleer hem bij Instellingen.',
    'ai.error': 'Fout: {msg}',
    'ai.allMastered': 'Alle woorden beheerst! Probeer een ander onderwerp.',

    'ai.level': 'Jouw niveau (op basis van je antwoorden)',
    'ai.accuracy': 'Nauwkeurigheid',
    'ai.mastered': 'Beheerste woorden',
    'ai.struggling': 'Moeilijke woorden',
    'ai.masteredOf': '{n} van {total}',
    'ai.summaryAnswers': 'Antwoorden: {right} goed, {wrong} fout.',
    'ai.summaryLevelUp': 'Je niveau is bijgewerkt: {before} → {after} 🎉',
    'ai.summaryLevel': 'Jouw niveau: {level}',
    'ai.summaryStats': 'Beheerst: {mastered} van {total}. Nauwkeurigheid: {accuracy}%',

    'spell.prompt': '✍️ Schrijf dit woord in de taal die je leert',
    'spell.hintArticle': 'Vergeet het lidwoord niet ({articles})',
    'spell.placeholder': 'Typ het woord…',
    'spell.check': 'Controleren',
    'spell.idk': 'Ik weet het niet',
    'spell.correct': '✅ Goed!',
    'spell.partial': '🟡 Het woord klopt, het lidwoord niet. Juist: {answer}',
    'spell.wrong': '❌ Juiste antwoord: {answer}',
    'spell.next': 'Volgende',

    'speak.prompt': '🎤 Spreek dit woord hardop uit in de taal die je leert',
    'speak.start': '🎤 Spreken',
    'speak.listening': '🔴 Ik luister…',
    'speak.heard': 'Gehoord: “{text}”',
    'speak.unsupported': 'Je browser ondersteunt spraakherkenning niet',
    'speak.denied': 'Geen toegang tot de microfoon',
    'speak.nothing': 'Niets verstaan, probeer het nog eens',
    'speak.retry': '🔄 Nog eens',
    'speak.skip': 'Overslaan',

    'settings.title': '⚙️ Instellingen',
    'settings.uiLang': 'Taal van de interface',
    'settings.uiLangAuto': 'Automatisch (zoals de browser)',
    'settings.provider': 'AI-provider',
    'settings.providerGemini': 'Google Gemini — gratis (aanbevolen)',
    'settings.providerGroq': 'Groq — gratis (Llama)',
    'settings.providerAnthropic': 'Anthropic Claude — betaald, betere kwaliteit',
    'settings.geminiKey': 'Google Gemini API-sleutel',
    'settings.geminiHint': 'Gratis: ga naar aistudio.google.com (Google-account, geen kaart) → Get API key → Create API key. De sleutel blijft alleen in je browser.',
    'settings.groqKey': 'Groq API-sleutel',
    'settings.groqHint': 'Gratis: registreer op console.groq.com (geen kaart) → API Keys → Create API Key. De sleutel blijft alleen in je browser.',
    'settings.anthropicKey': 'Anthropic API-sleutel',
    'settings.anthropicHint': 'Betaalde API: console.anthropic.com. De sleutel blijft alleen in je browser.',
    'settings.save': 'Opslaan',
    'settings.saved': 'Instellingen opgeslagen ✅',
    'settings.newLimit': 'Limiet nieuwe kaarten per dag',
    'settings.footer': 'Memo — een gratis Anki-kloon voor je telefoon. Gegevens blijven lokaal in je browser.',

    'gen.topic': 'Onderwerp',
    'gen.topicPh': 'bijv. reizen, eten, IT-woordenschat…',
    'gen.level': 'Niveau',
    'gen.count': 'Aantal kaarten: ',
    'gen.generate': '✨ Kaarten genereren',
    'gen.working': '✨ AI kiest woorden… (kan een minuut duren)',
    'gen.needTopic': 'Geef een onderwerp op',
    'gen.ready': 'Klaar! {n} kaarten toegevoegd ✅',

    'err.noCards': 'De AI gaf geen kaarten terug. Probeer het opnieuw.',
    'err.empty': 'Leeg antwoord van de AI.',
    'err.rateLimit': 'De gratis limiet van {provider} is bereikt. Wacht een minuut en probeer opnieuw.',
    'err.refused': 'Het model weigerde het verzoek. Probeer een ander onderwerp.',

    'modal.cancel': 'Annuleren',
    'modal.ok': 'OK',

    'ivl.min': '{n} min',
    'ivl.day': '{n} d',
    'ivl.month': '{n} mnd',
    'ivl.year': '{n} j',

    'lang.en': 'Engels',
    'lang.nl': 'Nederlands',
    'lang.de': 'Duits',
    'lang.pl': 'Pools',
    'lang.es': 'Spaans',
    'lang.fr': 'Frans',
    'lang.it': 'Italiaans',
    'lang.cs': 'Tsjechisch',
    'lang.ja': 'Japans',
    'lang.ko': 'Koreaans',
    'lang.uk': 'Oekraïens',
  },
};

const STORE_KEY = 'memo-ui-lang';
const DEFAULT_LANG = 'uk';

// Мова браузера/пристрою: 'nl-BE' → 'nl'. Беремо перший підтримуваний варіант
// зі списку переваг користувача (navigator.languages впорядкований).
export function detectBrowserLang() {
  const prefs = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || ''];
  for (const tag of prefs) {
    const base = String(tag).toLowerCase().split('-')[0];
    if (DICT[base]) return base;
  }
  return DEFAULT_LANG;
}

// '' (порожньо) = «автоматично»
export const getSavedLang = () => localStorage.getItem(STORE_KEY) || '';

let current = getSavedLang() || detectBrowserLang();

export const getLang = () => current;

export function setLang(lang) {
  if (lang && DICT[lang]) {
    localStorage.setItem(STORE_KEY, lang);
    current = lang;
  } else {
    localStorage.removeItem(STORE_KEY);
    current = detectBrowserLang();
  }
  applyI18n();
}

export function t(key, vars) {
  let s = DICT[current]?.[key] ?? DICT[DEFAULT_LANG]?.[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

// Проставляє переклади в розмітку.
//   data-i18n            → textContent
//   data-i18n-html       → innerHTML (тільки для наших власних рядків зі словника)
//   data-i18n-placeholder→ placeholder
//   data-i18n-title      → title
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.documentElement.lang = current;
  document.title = t('app.title');
  document.dispatchEvent(new CustomEvent('i18n:changed'));
}
