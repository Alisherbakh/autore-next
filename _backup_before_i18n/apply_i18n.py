#!/usr/bin/env python3
# Adds kr/ru translations for homepage, header/footer and car detail texts.
# Run from the autore-next root:  python3 _backup_before_i18n/apply_i18n.py
import json, os, re, sys

ROOT = os.getcwd()
LOC = os.path.join(ROOT, 'public', 'locales')

D = {
# Hero
'Featured cars': ('추천 차량', 'Рекомендуемые автомобили'),
'FLAGSHIP SEDAN': ('플래그십 세단', 'ФЛАГМАНСКИЙ СЕДАН'),
'Kia’s flagship luxury sedan.': ('기아의 플래그십 럭셔리 세단.', 'Флагманский люксовый седан Kia.'),
'LUXURY SEDAN': ('럭셔리 세단', 'ЛЮКСОВЫЙ СЕДАН'),
'Mid-size luxury sedan for business and family.': ('비즈니스와 가족을 위한 중형 럭셔리 세단.', 'Люксовый седан среднего класса для работы и семьи.'),
'PREMIUM SEDAN': ('프리미엄 세단', 'ПРЕМИУМ-СЕДАН'),
'Premium full-size sedan with a fastback profile.': ('패스트백 실루엣의 프리미엄 대형 세단.', 'Премиальный полноразмерный седан с силуэтом фастбэк.'),
'ELECTRIC SUV': ('전기 SUV', 'ЭЛЕКТРОКРОССОВЕР'),
'Three-row electric SUV in GT trim.': ('GT 트림의 3열 전기 SUV.', 'Трёхрядный электрокроссовер в версии GT.'),
'LUXURY SUV': ('럭셔리 SUV', 'ЛЮКСОВЫЙ КРОССОВЕР'),
'Sporty mid-size luxury SUV.': ('스포티한 중형 럭셔리 SUV.', 'Спортивный люксовый кроссовер среднего класса.'),
'FAMILY MPV': ('패밀리 미니밴', 'СЕМЕЙНЫЙ МИНИВЭН'),
'Spacious people-mover for the whole family.': ('온 가족을 위한 넉넉한 미니밴.', 'Просторный минивэн для всей семьи.'),
'MID-SIZE SUV': ('중형 SUV', 'КРОССОВЕР СРЕДНЕГО КЛАССА'),
'One of Korea’s most popular family SUVs.': ('한국에서 가장 인기 있는 패밀리 SUV 중 하나.', 'Один из самых популярных семейных кроссоверов в Корее.'),
'MID-SIZE SEDAN': ('중형 세단', 'СЕДАН СРЕДНЕГО КЛАССА'),
'Sporty mid-size sedan for everyday driving.': ('일상 주행을 위한 스포티한 중형 세단.', 'Спортивный седан среднего класса на каждый день.'),
'Find a dealer': ('딜러 찾기', 'Найти дилера'),
'Show {{name}}': ('{{name}} 보기', 'Показать {{name}}'),
'Pause slideshow': ('슬라이드 일시정지', 'Остановить слайд-шоу'),
'Play slideshow': ('슬라이드 재생', 'Запустить слайд-шоу'),
'Previous car': ('이전 차량', 'Предыдущий автомобиль'),
'Next: {{name}}': ('다음: {{name}}', 'Далее: {{name}}'),
# Quick menu, brands
'Quick menu': ('빠른 메뉴', 'Быстрое меню'),
'Sell my car': ('내 차 팔기', 'Продать автомобиль'),
'Find dealer': ('딜러 찾기', 'Найти дилера'),
'Saved cars': ('찜한 차량', 'Избранное'),
'Customer service': ('고객센터', 'Служба поддержки'),
'Shop by brand': ('브랜드별 보기', 'По марке'),
# Trend, body styles
'Trend Cars': ('트렌드 차량', 'Трендовые автомобили'),
'Trend is based on likes': ('찜 수 기준', 'По количеству лайков'),
'Previous': ('이전', 'Назад'),
'Next': ('다음', 'Вперёд'),
'Find the shape that fits your life.': ('라이프스타일에 맞는 차종을 찾아보세요.', 'Найдите кузов, который подходит вашей жизни.'),
'All cars': ('전체 차량', 'Все автомобили'),
# Body types
'Sedan': ('세단', 'Седан'),
'SUV': ('SUV', 'Кроссовер'),
'Hatchback': ('해치백', 'Хэтчбек'),
'Coupe': ('쿠페', 'Купе'),
'Convertible': ('컨버터블', 'Кабриолет'),
'Wagon': ('왜건', 'Универсал'),
'Van': ('밴', 'Минивэн'),
'Pickup': ('픽업트럭', 'Пикап'),
# Fuel, condition
'Gasoline': ('가솔린', 'Бензин'),
'Diesel': ('디젤', 'Дизель'),
'Hybrid': ('하이브리드', 'Гибрид'),
'Electric': ('전기', 'Электро'),
'LPG': ('LPG', 'Газ (LPG)'),
'Hydrogen': ('수소', 'Водород'),
'New': ('신차', 'Новый'),
'Used': ('중고', 'С пробегом'),
# Cities
'Seoul': ('서울', 'Сеул'),
'Busan': ('부산', 'Пусан'),
'Incheon': ('인천', 'Инчхон'),
'Daegu': ('대구', 'Тэгу'),
'Gyeongju': ('경주', 'Кёнджу'),
'Gwangju': ('광주', 'Кванджу'),
'Chonju': ('전주', 'Чонджу'),
'Daejon': ('대전', 'Тэджон'),
'Jeju': ('제주', 'Чеджу'),
# Brands (names stay the same)
'Hyundai': ('Hyundai', 'Hyundai'),
'Kia': ('Kia', 'Kia'),
'Genesis': ('Genesis', 'Genesis'),
'KGM': ('KGM', 'KGM'),
'Chevrolet': ('Chevrolet', 'Chevrolet'),
'Renault': ('Renault', 'Renault'),
'Toyota': ('Toyota', 'Toyota'),
'BMW': ('BMW', 'BMW'),
'Mercedes': ('Mercedes', 'Mercedes'),
'Audi': ('Audi', 'Audi'),
'Volkswagen': ('Volkswagen', 'Volkswagen'),
'Tesla': ('Tesla', 'Tesla'),
'Other': ('기타', 'Другое'),
# Popular
'Popular cars': ('인기 차량', 'Популярные автомобили'),
'Popularity is based on views': ('조회수 기준', 'По количеству просмотров'),
'See All Categories': ('전체 카테고리 보기', 'Все категории'),
'TOP': ('TOP', 'ТОП'),
'For sale': ('판매', 'Продажа'),
'{{count}} views': ('조회 {{count}}회', 'Просмотры: {{count}}'),
# Pay your way
'Pay your way': ('원하는 방식으로 결제하세요', 'Платите, как вам удобно'),
'Cars you can buy on credit, or trade for your current car.': ('할부로 구매하거나 타던 차와 교환할 수 있는 차량.', 'Автомобили, которые можно купить в кредит или обменять на ваш нынешний.'),
'Payment option': ('결제 방식', 'Способ оплаты'),
'Pay in monthly instalments': ('월 할부로 결제', 'Оплата ежемесячными платежами'),
'Agree the terms with the dealer': ('딜러와 조건 협의', 'Условия — по договорённости с дилером'),
'Every car here accepts credit': ('모든 차량 할부 가능', 'Все эти автомобили можно взять в кредит'),
'Trade your current car': ('타던 차로 교환', 'Обменяйте свой автомобиль'),
'Pay only the difference': ('차액만 결제', 'Доплатите только разницу'),
'Every car here accepts barter': ('모든 차량 교환 가능', 'Все эти автомобили доступны для обмена'),
'See all credit cars': ('할부 가능 차량 전체 보기', 'Все автомобили в кредит'),
'See all barter cars': ('교환 가능 차량 전체 보기', 'Все автомобили для обмена'),
'No credit cars yet.': ('아직 할부 가능 차량이 없습니다.', 'Пока нет автомобилей в кредит.'),
'No barter cars yet.': ('아직 교환 가능 차량이 없습니다.', 'Пока нет автомобилей для обмена.'),
# Sell / Buy
'SELL WITH AUTORE': ('AUTORE에서 판매하기', 'ПРОДАВАЙТЕ С AUTORE'),
'Your car, listed in minutes.': ('몇 분 만에 내 차를 등록하세요.', 'Ваш автомобиль — в продаже за несколько минут.'),
'Add photos and details, get offers from buyers and dealers, and close the deal with credit or barter options.': ('사진과 정보를 올리고, 구매자와 딜러의 제안을 받고, 할부나 교환으로 거래를 마무리하세요.', 'Добавьте фото и данные, получайте предложения от покупателей и дилеров и завершайте сделку в кредит или по обмену.'),
'Add details & photos': ('정보 및 사진 등록', 'Добавьте данные и фото'),
'Brand, model, mileage and a few photos': ('브랜드, 모델, 주행거리와 사진 몇 장', 'Марка, модель, пробег и несколько фото'),
'Get offers': ('제안 받기', 'Получайте предложения'),
'Chat with buyers and dealers directly': ('구매자·딜러와 직접 채팅', 'Общайтесь с покупателями и дилерами напрямую'),
'Get paid': ('대금 받기', 'Получите оплату'),
'Cash, credit or barter — your choice': ('현금, 할부, 교환 중 선택', 'Наличные, кредит или обмен — на ваш выбор'),
'BUY WITH AUTORE': ('AUTORE에서 구매하기', 'ПОКУПАЙТЕ С AUTORE'),
'Find a dealer you can trust.': ('믿을 수 있는 딜러를 찾으세요.', 'Найдите дилера, которому можно доверять.'),
'Browse dealers across nine cities, see their cars and reviews, and contact the one that fits you.': ('9개 도시의 딜러를 둘러보고, 차량과 후기를 확인한 뒤 마음에 드는 딜러에게 연락하세요.', 'Смотрите дилеров в девяти городах, их автомобили и отзывы, и связывайтесь с подходящим.'),
'Browse dealers': ('딜러 둘러보기', 'Смотрите дилеров'),
'See every dealer and how many cars they list': ('모든 딜러와 등록 차량 수 확인', 'Все дилеры и количество их автомобилей'),
'Check their cars': ('차량 확인', 'Изучите автомобили'),
'Photos, mileage and clear ₩ prices': ('사진, 주행거리, 투명한 ₩ 가격', 'Фото, пробег и понятные цены в ₩'),
'Contact & visit': ('연락 및 방문', 'Свяжитесь и приезжайте'),
'Message the dealer and book a visit': ('딜러에게 메시지를 보내고 방문 예약', 'Напишите дилеру и договоритесь о визите'),
# Dealers
'Top Dealers': ('인기 딜러', 'Лучшие дилеры'),
'Our Top Dealers always ready to serve you': ('언제든 도와드릴 준비가 된 인기 딜러', 'Наши лучшие дилеры всегда готовы помочь'),
'See All Dealers': ('딜러 전체 보기', 'Все дилеры'),
'{{count}} cars': ('{{count}}대', 'Авто: {{count}}'),
'{{name}} profile': ('{{name}} 프로필', 'Профиль: {{name}}'),
'DEALER': ('딜러', 'ДИЛЕР'),
'No description yet.': ('아직 소개가 없습니다.', 'Описание пока не добавлено.'),
'Views': ('조회수', 'Просмотры'),
'Likes': ('좋아요', 'Лайки'),
'Like dealer': ('딜러 좋아요', 'Отметить дилера'),
'Unlike dealer': ('좋아요 취소', 'Убрать отметку'),
'View cars': ('차량 보기', 'Смотреть авто'),
# Events
'Events': ('이벤트', 'События'),
'Events waiting your attention!': ('주목할 만한 이벤트', 'События, достойные внимания'),
'Seoul Mobility Show': ('서울모빌리티쇼', 'Seoul Mobility Show'),
'Busan International Mobility Show': ('부산국제모빌리티쇼', 'Busan International Mobility Show'),
'Superrace Championship': ('슈퍼레이스 챔피언십', 'Superrace Championship'),
'Goyang': ('고양', 'Коян'),
'Yongin': ('용인', 'Йонъин'),
# Community
'Community Board Highlights': ('커뮤니티 인기 글', 'Популярное в сообществе'),
'Most-read posts from the Autore community': ('Autore 커뮤니티에서 가장 많이 읽은 글', 'Самые читаемые посты сообщества Autore'),
'News': ('뉴스', 'Новости'),
'Free': ('자유게시판', 'Свободная тема'),
'No news posts yet.': ('아직 뉴스 글이 없습니다.', 'Пока нет новостей.'),
'No free board posts yet.': ('아직 자유게시판 글이 없습니다.', 'Пока нет постов в свободной теме.'),
'Free Board': ('자유게시판', 'Свободная тема'),
# Footer
'Toll-free customer care': ('무료 고객 상담', 'Бесплатная линия поддержки'),
'Live support': ('실시간 상담', 'Онлайн-поддержка'),
'Follow us on social media': ('SNS에서 팔로우하세요', 'Мы в соцсетях'),
'Keep yourself up to date': ('최신 소식 받기', 'Будьте в курсе'),
'Your email': ('이메일 주소', 'Ваш email'),
'Subscribe': ('구독', 'Подписаться'),
'Popular search': ('인기 검색', 'Популярные запросы'),
'Cars for sale': ('판매 차량', 'Автомобили в продаже'),
'Cheapest cars': ('최저가 차량', 'Самые доступные автомобили'),
'Quick links': ('바로가기', 'Быстрые ссылки'),
'Terms of use': ('이용약관', 'Условия использования'),
'Privacy policy': ('개인정보처리방침', 'Политика конфиденциальности'),
'Pricing plans': ('요금제', 'Тарифы'),
'Our services': ('서비스 소개', 'Наши услуги'),
'Contact support': ('고객 지원 문의', 'Связаться с поддержкой'),
'FAQs': ('자주 묻는 질문', 'Частые вопросы'),
'Discover': ('지역별 보기', 'Города'),
'Gyeonggi-do': ('경기도', 'Кёнгидо'),
'All rights reserved.': ('모든 권리 보유.', 'Все права защищены.'),
'Site photos: Wikimedia Commons (CC BY / BY-SA)': ('사이트 사진: Wikimedia Commons (CC BY / BY-SA)', 'Фото на сайте: Wikimedia Commons (CC BY / BY-SA)'),
'Privacy · Terms · Sitemap': ('개인정보 · 약관 · 사이트맵', 'Конфиденциальность · Условия · Карта сайта'),
# Car detail
'Breadcrumb': ('경로', 'Навигация'),
'Photos': ('사진', 'Фотографии'),
'No photos': ('사진 없음', 'Нет фото'),
'Open photo {{n}} of {{total}}': ('사진 {{n}}/{{total}} 열기', 'Открыть фото {{n}} из {{total}}'),
'{{count}} photos': ('사진 {{count}}장', 'Фото: {{count}}'),
'View all photos': ('사진 전체 보기', 'Все фото'),
'Listed today': ('오늘 등록', 'Опубликовано сегодня'),
'Listed 1 day ago': ('1일 전 등록', 'Опубликовано 1 дн. назад'),
'Listed {{count}} days ago': ('{{count}}일 전 등록', 'Опубликовано {{count}} дн. назад'),
'{{count}} likes': ('좋아요 {{count}}', 'Лайки: {{count}}'),
'Like this car': ('이 차 좋아요', 'Отметить автомобиль'),
'Remove like from this car': ('좋아요 취소', 'Убрать отметку'),
'Key specs': ('주요 사양', 'Основные характеристики'),
'Mileage': ('주행거리', 'Пробег'),
'Fuel': ('연료', 'Топливо'),
'Transmission': ('변속기', 'Коробка передач'),
'Body type': ('차종', 'Тип кузова'),
'About this car': ('차량 소개', 'Об автомобиле'),
'The dealer hasn’t added a description yet.': ('딜러가 아직 설명을 추가하지 않았습니다.', 'Дилер пока не добавил описание.'),
'Car details': ('차량 상세 정보', 'Характеристики'),
'Brand / Model': ('브랜드 / 모델', 'Марка / модель'),
'Condition': ('상태', 'Состояние'),
'Seats': ('좌석 수', 'Количество мест'),
'Engine size': ('배기량', 'Объём двигателя'),
'Color': ('색상', 'Цвет'),
'Map': ('지도', 'Карта'),
'Reviews': ('후기', 'Отзывы'),
'{{count}} review': ('후기 {{count}}개', 'Отзывы: {{count}}'),
'{{count}} reviews': ('후기 {{count}}개', 'Отзывы: {{count}}'),
'No reviews yet. Be the first to share your experience.': ('아직 후기가 없습니다. 첫 후기를 남겨 주세요.', 'Отзывов пока нет. Станьте первым!'),
'Your review': ('후기 작성', 'Ваш отзыв'),
'What did you think of this car or dealer?': ('이 차량이나 딜러는 어떠셨나요?', 'Что вы думаете об этом автомобиле или дилере?'),
'Submit review': ('후기 등록', 'Отправить отзыв'),
'Price and dealer': ('가격 및 딜러', 'Цена и дилер'),
'Price': ('가격', 'Цена'),
'Barter available': ('교환 가능', 'Возможен обмен'),
'No barter': ('교환 불가', 'Без обмена'),
'Credit available': ('할부 가능', 'Возможен кредит'),
'No credit': ('할부 불가', 'Без кредита'),
'{{count}} cars listed': ('등록 차량 {{count}}대', 'Объявлений: {{count}}'),
'View dealer': ('딜러 보기', 'Страница дилера'),
'Similar cars': ('비슷한 차량', 'Похожие автомобили'),
'More cars in {{city}}': ('{{city}}의 다른 차량', 'Ещё автомобили: {{city}}'),
'See all': ('전체 보기', 'Смотреть все'),
'Previous photo': ('이전 사진', 'Предыдущее фото'),
'Next photo': ('다음 사진', 'Следующее фото'),
'Show photo {{n}}': ('사진 {{n}} 보기', 'Показать фото {{n}}'),
}

EVENT_DESC = [
	('2년마다 킨텍스에서 열리는 한국 최대 모터쇼. 완성차 브랜드들이 신차, 콘셉트카, 미래 모빌리티 기술을 공개합니다.',
	 'Крупнейший автосалон Кореи, проходит раз в два года в KINTEX. Автопроизводители показывают новые модели, концепты и технологии будущего.'),
	('2001년부터 벡스코에서 격년으로 열리며, 2024년까지는 부산국제모터쇼로 불렸습니다.',
	 'Проводится в BEXCO раз в два года с 2001 года; до 2024 года называлась Busan International Motor Show.'),
	('한국 최고의 투어링카 레이스 시리즈. V8 슈퍼 6000 머신이 에버랜드 스피드웨이, 인제 스피디움, 코리아 인터내셔널 서킷에서 달립니다.',
	 'Главная гоночная серия кузовных автомобилей в Корее. Машины V8 Super 6000 соревнуются на Everland Speedway, Inje Speedium и Korea International Circuit.'),
]

RU_FIX = {'Register': 'Регистрация', 'CS': 'Поддержка'}

TARGETS = ['HeroShowcase', 'QuickMenu', 'BrandStrip', 'TrendCars', 'TrendCarCard', 'PopularCars', 'PopularCarCard',
	'SellPromo', 'CarTypes', 'TopDealers', 'DealerCard', 'Events', 'CommunityBoards', 'CommunityCard', 'Footer', 'PayYourWay']

def find_files():
	out = {}
	for base in ('libs', 'pages'):
		for dp, dn, fn in os.walk(os.path.join(ROOT, base)):
			dn[:] = [d for d in dn if not d.startswith('_backup') and d != 'node_modules']
			for f in fn:
				if f.endswith('.tsx'):
					stem = f[:-4]
					p = os.path.join(dp, f)
					if stem in TARGETS and 'mobile' not in p.lower():
						out.setdefault(stem, p)
	out['detail'] = os.path.join(ROOT, 'pages', 'car', 'detail.tsx')
	return out

files = find_files()
missing_files = [t for t in TARGETS + ['detail'] if t not in files]
if missing_files:
	print('MISSING FILES:', missing_files); sys.exit(1)

src = {k: open(p, encoding='utf-8').read() for k, p in files.items()}

# event descriptions
descs = re.findall(r"description:\s*\n?\s*'([^']+)'", src['Events'])
if len(descs) != len(EVENT_DESC):
	print('EVENT DESC COUNT MISMATCH', len(descs)); sys.exit(1)
for en, (kr, ru) in zip(descs, EVENT_DESC):
	D[en] = (kr, ru)

# merge
data = {}
for l in ('en', 'kr', 'ru'):
	data[l] = json.load(open(os.path.join(LOC, l, 'common.json'), encoding='utf-8'))
added = 0
for k, (kr, ru) in D.items():
	if k not in data['en']:
		added += 1
	data['en'].setdefault(k, k)
	data['kr'].setdefault(k, kr)
	data['ru'].setdefault(k, ru)
for k, v in RU_FIX.items():
	data['ru'][k] = v
for l in ('en', 'kr', 'ru'):
	with open(os.path.join(LOC, l, 'common.json'), 'w', encoding='utf-8') as f:
		f.write(json.dumps(data[l], ensure_ascii=False, indent='\t') + '\n')
print('added keys:', added, '| totals:', {l: len(data[l]) for l in data})

# ---- verification ----
ok = True
keys = [set(data[l]) for l in ('en', 'kr', 'ru')]
if not (keys[0] == keys[1] == keys[2]):
	ok = False
	print('KEY SET DIFF kr:', keys[0] ^ keys[1], 'ru:', keys[0] ^ keys[2])

used = {}
def add(k, where):
	used.setdefault(k, set()).add(where)
for name, s in src.items():
	for m in re.finditer(r"\bt\((['\"])(.+?)\1[,)]", s):
		add(m.group(2), name)
dyn = {
	'HeroShowcase': r"(?:tag|sub):\s*'([^']+)'",
	'QuickMenu': r"label:\s*'([^']+)'",
	'SellPromo': r"(?:tag|title|text|cta):\s*'([^']+)'",
	'PayYourWay': r"(?:label|seeAll|empty):\s*'([^']+)'",
	'detail': r"\{\s*(?:label|k):\s*'([^']+)'",
	'Events': r"(?:eventTitle|city):\s*'([^']+)'",
}
for name, rx in dyn.items():
	for v in re.findall(rx, src[name]):
		add(v, name + '(dyn)')
for arr in re.findall(r"points:\s*\[([^\]]*)\]", src['PayYourWay']):
	for v in re.findall(r"'([^']+)'", arr):
		add(v, 'PayYourWay(points)')
for d in descs:
	add(d, 'Events(desc)')
ACR = {'SUV', 'KGM', 'BMW', 'LPG'}
enum_src = open(os.path.join(ROOT, 'libs', 'enums', 'car.enum.ts'), encoding='utf-8').read()
for en_name in ('CarType', 'CarLocation', 'CarBrand', 'CarFuelType', 'CarTransmission', 'CarCondition'):
	body = re.search(r'enum ' + en_name + r'\s*\{([^}]*)\}', enum_src).group(1)
	for v in re.findall(r"=\s*'([A-Z_]+)'", body):
		add(v if v in ACR else v[0] + v[1:].lower(), 'enum:' + en_name)

missing = {k: w for k, w in used.items() if k not in data['en']}
if missing:
	ok = False
	print('MISSING KEYS:')
	for k, w in sorted(missing.items()):
		print('  ', repr(k), sorted(w))

ph = re.compile(r'\{\{\s*(\w+)\s*\}\}')
for k in data['en']:
	want = set(ph.findall(k)) if k == data['en'][k] else set(ph.findall(data['en'][k]))
	for l in ('kr', 'ru'):
		if set(ph.findall(data[l][k])) != want:
			ok = False
			print('PLACEHOLDER MISMATCH', l, repr(k))

empty = [(l, k) for l in data for k, v in data[l].items() if not str(v).strip()]
if empty:
	ok = False; print('EMPTY VALUES', empty)

print('used keys checked:', len(used))
print('RESULT:', 'OK' if ok else 'PROBLEMS FOUND')
