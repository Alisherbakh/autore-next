import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import SectionHead from './SectionHead';

interface EventData {
	eventTitle: string;
	city: string;
	description: string;
	imageSrc: string;
}
// Koreyadagi haqiqiy avtomobil tadbirlari (sanalar har yili o'zgargani uchun ko'rsatilmaydi).
// Rasmlar: Wikimedia Commons (CC BY-SA 4.0) — mualliflar public/img/fiber/CREDITS.md da
const eventsData: EventData[] = [
	{
		eventTitle: 'Seoul Mobility Show',
		city: 'Goyang',
		description:
			'Korea’s largest motor show, held every two years at KINTEX. Carmakers unveil new models, concepts and future mobility tech.',
		imageSrc: '/img/events/seoul-mobility-show.jpg',
	},
	{
		eventTitle: 'Busan International Mobility Show',
		city: 'Busan',
		description:
			'Biennial show at BEXCO since 2001, known as the Busan International Motor Show until 2024.',
		imageSrc: '/img/events/busan-mobility-show.jpg',
	},
	{
		eventTitle: 'Superrace Championship',
		city: 'Yongin',
		description:
			'Korea’s top touring-car series. V8 Super 6000 cars race at Everland Speedway, Inje Speedium and Korea International Circuit.',
		imageSrc: '/img/events/superrace.jpg',
	},
];

const EventCard = ({ event, featured }: { event: EventData; featured: boolean }) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<article className={`event-card ${featured ? 'is-featured' : ''}`}>
				<img src={event?.imageSrc} alt={''} loading={'lazy'} />
				<Box component={'div'} className={'info'}>
					<h3>{t(event.eventTitle)}</h3>
					<span className={'event-city'}>{t(event.city)}</span>
					<p>{t(event.description)}</p>
				</Box>
			</article>
		);
	}
};

const Events = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		return <div>EVENT CARD</div>;
	} else {
		return (
			<Stack component={'section'} className={'events hp-section'}>
				<Stack className={'container'}>
					<SectionHead title={t('Events')} sub={t('Events waiting your attention!')} />
					{/* bento: birinchi tadbir katta, qolganlari o'ng ustunda */}
					<Stack className={'card-wrapper'}>
						{eventsData.map((event: EventData, index: number) => {
							return <EventCard event={event} featured={index === 0} key={event?.eventTitle} />;
						})}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Events;
