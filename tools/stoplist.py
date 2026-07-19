# Служебные слова и словоформы нидерландского, которые не годятся в карточки.
#
# Зачем: частотный список построен по субтитрам, и его верх — это местоимения,
# предлоги и формы глаголов. У многих из них в Викисловаре есть редкий омоним-
# существительное («niet» — не только отрицание, но и «скоба»), и автоматика
# выбирала именно его. Проще исключить их явно.
#
# Побочный эффект: вместе со служебными теряются несколько полезных омонимов
# (het weer «погода», het haar «волосы»), потому что отличить их автоматически
# от наречия «снова» и местоимения «её» нельзя. Их можно вернуть вручную.

FUNCTION_WORDS = set("""
de het een deze dit die dat welke welk elk elke ieder iedere geen alle al
veel weinig sommige zulke mijn jouw uw haar ons onze hun jullie zulk

ik jij je u hij zij ze wij we hen mij me jou hem zich zichzelf
wie iemand niemand iets niets elkaar men er ze

aan achter bij binnen boven buiten door in langs met na naar naast om onder
op over per rond sinds tegen tijdens tot tussen uit van via volgens voor
zonder te ten ter af toe uitgezonderd behalve tegenover jegens

en of maar want dus omdat doordat hoewel terwijl als dan toen zodat tenzij
wanneer hetzij noch

niet wel ook nog alleen altijd nooit soms vaak hier daar waar hoe waarom
nu straks meteen even echt heel erg zeer best misschien natuurlijk gewoon
weer terug samen zo zoals toch immers echter eens ooit ergens nergens overal
enkel slechts vooral bijna helemaal precies ongeveer trouwens gelukkig
eigenlijk zeker vast waarschijnlijk absoluut totaal verder eerder later
graag liever meest minder meer minst hoezo waarheen waarvan waarop hierdoor
daarom daardoor daarna daarvoor hierna hiervoor tenminste althans sowieso

is ben bent was waren geweest heb hebt heeft had hadden gehad
word wordt werd werden geworden kan kun kunt kon konden kunnen
moet moeten moest moesten mag mogen mocht mochten
wil wilt willen wilde wou zal zult zullen zou zouden
ga gaat gaan ging gingen gegaan doe doet doen deed deden gedaan
kom komt komen kwam kwamen gekomen zie ziet zien zag zagen gezien
weet weten wist wisten geweten zeg zegt zeggen zei zeiden gezegd
laat laten liet lieten gelaten neem neemt nemen nam namen genomen
geef geeft geven gaf gaven gegeven maak maakt maken maakte maakten gemaakt
sta staat staan stond stonden gestaan blijf blijft blijven bleef bleven
denk denkt denken dacht dachten gedacht vind vindt vinden vond vonden
krijg krijgt krijgen kreeg kregen gekregen houd houdt houden hield hielden
zit zit zitten zat zaten gezeten loop loopt lopen liep liepen
breng brengt brengen bracht brachten gebracht

ja nee jawel welnee hè hé oh ach nou zeg hoor joh eh hm
""".split())
