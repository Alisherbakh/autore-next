import React from 'react';
import { Stack } from '@mui/material';
import HeaderFilter from './HeaderFilter';
import HeroShowcase from './HeroShowcase';

// Bosh sahifaning yuqori qismi: Hyundai uslubidagi mashina slayderi (HeroShowcase),
// uning ostida mashina qidiruvi (HeaderFilter — mantiq o'zgarmagan).
// Oldingi 3D galereya (FiberContainer) fayli o'chirilmagan, faqat bu yerda ishlatilmayapti.
const HeroSection = () => {
	return (
		// 'header-main' klassi HeaderFilter'ning mavjud dropdown stillarini ishlatish uchun qoldirildi
		<Stack component={'section'} className={'header-main hero-search hero-showcase-wrap'} aria-labelledby={'hero-title'}>
			<HeroShowcase />
			<Stack className={'container hs-search'}>
				<HeaderFilter />
			</Stack>
		</Stack>
	);
};

export default HeroSection;
