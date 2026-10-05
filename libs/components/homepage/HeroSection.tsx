import React from 'react';
import { Stack, Box } from '@mui/material';
import { useTranslation } from 'next-i18next';
import HeaderFilter from './HeaderFilter';

// Hero video — public/video/hero.mp4 (Genesis GV80, 25 soniya, ovozsiz)
const HERO_VIDEO = '/video/hero.mp4';
const HERO_VIDEO_POSTER = '/video/hero-poster.jpg'; // video yuklanguncha ko'rinadigan birinchi kadr

// Bosh sahifaning yuqori qismi (V01 ranglari + "showroom" hero):
// butun kenglikdagi video, pastki chapda sarlavha va mashina qidiruvi (HeaderFilter — mantiq o'zgarmagan)
const HeroSection = () => {
	const { t } = useTranslation('common');

	return (
		<Stack className={'hero-main hero-showroom'}>
			<Box component={'div'} className={'hero-media'}>
				<video
					className={'hero-video'}
					src={HERO_VIDEO}
					poster={HERO_VIDEO_POSTER}
					autoPlay
					muted
					loop
					playsInline
					preload={'auto'}
				/>
			</Box>
			<Stack className={'hero-overlay'}>
				<Stack className={'container hero-copy'}>
					<Stack className={'hero-text'}>
						<span className={'hero-chip'}>
							<i />
							{t('hero_chip')}
						</span>
						<h1>{t('hero_title')}</h1>
						<p>{t('hero_sub')}</p>
					</Stack>
				</Stack>
				{/* 'header-main' klassi HeaderFilter'ning mavjud dropdown stillarini ishlatish uchun qoldirildi */}
				<Stack className={'header-main hero-search'}>
					<Stack className={'container'}>
						<HeaderFilter />
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default HeroSection;
