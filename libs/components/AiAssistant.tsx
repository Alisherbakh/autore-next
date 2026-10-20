import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import ScrollableFeed from 'react-scrollable-feed';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { ASK_ASSISTANT } from '../../apollo/user/mutation';
import { AiAnswer, AiChatMessage } from '../types/ai/ai';
import { Car } from '../types/car/car';
import { REACT_APP_API_URL } from '../config';
import { formatterStr } from '../utils';

const STORAGE_KEY = 'autore-ai-chat'; // sahifa almashganda suhbat yo'qolmasligi uchun (faqat shu brauzer tabida)
const MAX_STORED = 20; // saqlanadigan xabarlar soni
const MAX_HISTORY = 8; // AI'ga yuboriladigan oldingi xabarlar soni (backend limiti bilan bir xil)
const LANGS = ['en', 'kr', 'ru'];
const STARTER_CHIPS = ['SUV under ₩30M', 'Electric cars', 'Family car in Seoul', 'Cheapest Hyundai'];

interface AiAssistantProps {
	onNavigate: () => void; // mashina yoki "barchasini ko'rish" bosilganda chat oynasini yopadi
}

const AiAssistant = ({ onNavigate }: AiAssistantProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [messages, setMessages] = useState<AiChatMessage[]>([]);
	const [messageInput, setMessageInput] = useState<string>('');
	const restored = useRef(false); // sessionStorage'dan o'qib bo'lindimi
	const [askAssistant, { loading }] = useMutation(ASK_ASSISTANT);

	/** LIFECYCLES **/
	// birinchi ochilishda: avvalgi suhbatni sessionStorage'dan tiklaydi
	useEffect(() => {
		try {
			const saved = sessionStorage.getItem(STORAGE_KEY);
			if (saved) setMessages(JSON.parse(saved));
		} catch (err) {
			// private rejim yoki ruxsat yo'q — suhbat faqat xotirada qoladi
		}
		restored.current = true;
	}, []);

	// har yangi xabarda suhbatni saqlaydi
	useEffect(() => {
		if (!restored.current) return;
		try {
			sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
		} catch (err) {
			// saqlab bo'lmasa — muhim emas
		}
	}, [messages]);

	/** HANDLERS **/
	// xabarni AI'ga yuboradi va javobni ro'yxatga qo'shadi
	const sendMessage = async (raw: string) => {
		const text = raw.trim().slice(0, 500);
		if (!text || loading) return;

		const history = messages.slice(-MAX_HISTORY).map((ele) => ({ role: ele.role, text: ele.text.slice(0, 600) }));
		const lang = LANGS.includes(router.locale ?? '') ? router.locale : 'en';
		setMessages((prev) => [...prev, { role: 'user', text }]);
		setMessageInput('');

		try {
			const { data } = await askAssistant({ variables: { input: { message: text, history, lang } } });
			const answer: AiAnswer = data?.askAssistant;
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					text: answer?.reply ?? '',
					cars: answer?.cars ?? [],
					total: answer?.total ?? 0,
					searchInput: answer?.searchInput ?? null,
					chips: answer?.chips ?? [],
				},
			]);
		} catch (err: any) {
			console.log('ERROR, askAssistant:', err?.message);
			setMessages((prev) => [
				...prev,
				{ role: 'assistant', text: t('The AI assistant is busy right now. Please try again in a moment.') },
			]);
		}
	};

	// "Barchasini ko'rish": AI tanlagan filtr bilan /car sahifasini ochadi
	const seeAllHandler = async (searchInput: string) => {
		onNavigate();
		await router.push(`/car?input=${searchInput}`, `/car?input=${searchInput}`);
	};

	const renderChips = (chips: string[]) => (
		<div className={'ai-chips'}>
			{chips.map((chip) => (
				<button key={chip} type="button" className={'ai-chip'} onClick={() => sendMessage(chip)} disabled={loading}>
					{chip}
				</button>
			))}
		</div>
	);

	const renderCar = (car: Car) => {
		const image = car?.carImages?.[0] ? `${REACT_APP_API_URL}/${car.carImages[0]}` : '/video/hero-poster.jpg';
		return (
			<Link
				key={car._id}
				href={{ pathname: '/car/detail', query: { id: car._id } }}
				className={'ai-car'}
				onClick={onNavigate}
			>
				<img src={image} alt={car.carTitle} loading="lazy" />
				<div className={'ai-car-body'}>
					<strong>{car.carTitle}</strong>
					<span className={'ai-car-price'}>₩{formatterStr(car.carPrice)}</span>
					<small>
						{car.carYear} · {formatterStr(car.carMileage) || 0} km
					</small>
				</div>
			</Link>
		);
	};

	return (
		<div className={'ai-assistant'}>
			<div className={'ai-feed'}>
				<ScrollableFeed>
					<div className={'ai-main'}>
						{/* salomlashish */}
						<div className={'ai-msg ai-msg-bot'}>
							<span className={'ai-avatar'}>
								<AutoAwesomeIcon />
							</span>
							<div className={'ai-bubble'}>
								{t("Hi! Tell me what car you're looking for — budget, type, city — and I'll find it on Autore.")}
							</div>
						</div>
						{messages.length === 0 && renderChips(STARTER_CHIPS.map((chip) => t(chip)))}

						{messages.map((ele: AiChatMessage, index: number) =>
							ele.role === 'user' ? (
								<div key={index} className={'ai-msg ai-msg-user'}>
									<div className={'ai-bubble'}>{ele.text}</div>
								</div>
							) : (
								<div key={index} className={'ai-group'}>
									<div className={'ai-msg ai-msg-bot'}>
										<span className={'ai-avatar'}>
											<AutoAwesomeIcon />
										</span>
										<div className={'ai-bubble'}>{ele.text}</div>
									</div>
									{ele.cars && ele.cars.length > 0 && <div className={'ai-cars'}>{ele.cars.map(renderCar)}</div>}
									{ele.searchInput && !!ele.total && (
										<button type="button" className={'ai-see-all'} onClick={() => seeAllHandler(ele.searchInput as string)}>
											{t('See all')} ({ele.total})
										</button>
									)}
									{/* tayyor savollar faqat oxirgi javob ostida */}
									{index === messages.length - 1 && !loading && ele.chips && ele.chips.length > 0 && renderChips(ele.chips)}
								</div>
							),
						)}

						{/* AI javob yozmoqda... */}
						{loading && (
							<div className={'ai-msg ai-msg-bot'}>
								<span className={'ai-avatar'}>
									<AutoAwesomeIcon />
								</span>
								<div className={'ai-bubble ai-typing'} aria-label={t('Typing')}>
									<span />
									<span />
									<span />
								</div>
							</div>
						)}
					</div>
				</ScrollableFeed>
			</div>

			<div className={'ai-note'}>{t('AI answers can be inaccurate. Check details with the dealer.')}</div>

			<div className={'chat-bott'}>
				<input
					type={'text'}
					className={'msg-input'}
					placeholder={t('Ask about cars...')}
					value={messageInput}
					maxLength={500}
					onChange={(e) => setMessageInput(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.nativeEvent.isComposing) sendMessage(messageInput); // koreyscha yozishda (IME) ikki marta yuborilmasin
					}}
				/>
				<button
					type="button"
					className={'send-msg-btn'}
					onClick={() => sendMessage(messageInput)}
					disabled={loading || !messageInput.trim()}
					aria-label={t('Send')}
				>
					<SendIcon style={{ color: '#fff' }} />
				</button>
			</div>
		</div>
	);
};

export default AiAssistant;
