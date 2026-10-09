import React from 'react';
import { Stack } from '@mui/material';
import HeaderFilter from './HeaderFilter';
import { useTranslation } from 'next-i18next';
import FiberContainer from '../common/FiberContainer';

// Bosh sahifaning yuqori qismi (nestar-next'dagi kabi): 3D galereya (hashamatli va mashhur mashinalar)
// va uning ostida mashina qidiruvi (HeaderFilter — mantiq o'zgarmagan)
const HeroSection = () => {
	const { t } = useTranslation('common');

	return (
		// 'header-main' klassi HeaderFilter'ning mavjud dropdown stillarini ishlatish uchun qoldirildi
		<Stack className={'header-main hero-search hero-gallery'}>
			<FiberContainer />
			<span className={'gallery-hint'}>{t('Scroll to explore the gallery')}</span>
			<Stack className={'container'}>
				<HeaderFilter />
			</Stack>
		</Stack>
	);
};

export default HeroSection;
