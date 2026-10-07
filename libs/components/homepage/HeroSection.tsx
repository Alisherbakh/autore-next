import React from 'react';
import { Stack } from '@mui/material';
import HeaderFilter from './HeaderFilter';
import FiberContainer from '../common/FiberContainer';

// Bosh sahifaning yuqori qismi (nestar-next'dagi kabi): 3D galereya (hashamatli va mashhur mashinalar)
// va uning ostida mashina qidiruvi (HeaderFilter — mantiq o'zgarmagan)
const HeroSection = () => {
	return (
		// 'header-main' klassi HeaderFilter'ning mavjud dropdown stillarini ishlatish uchun qoldirildi
		<Stack className={'header-main hero-search hero-gallery'}>
			<FiberContainer />
			<span className={'gallery-hint'}>Scroll to explore</span>
			<Stack className={'container'}>
				<HeaderFilter />
			</Stack>
		</Stack>
	);
};

export default HeroSection;
