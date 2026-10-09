import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

// Bosh sahifa bloki (desktop, oldingi video reklama o'rnida).
// Option B: DEALER — "Sell with Autore" (mashina qo'shish formasi); mehmon va USER — "Find a dealer" (/dealer).
// Sabab: mashinani faqat DEALER qo'sha oladi (backend createCar → Roles(DEALER)).
const BLOCKS = {
	sell: {
		tag: 'SELL WITH AUTORE',
		title: 'Your car, listed in minutes.',
		text: 'Add photos and details, get offers from buyers and dealers, and close the deal with credit or barter options.',
		cta: 'Sell my car',
		href: '/mypage?category=addCar',
		steps: [
			{ title: 'Add details & photos', text: 'Brand, model, mileage and a few photos' },
			{ title: 'Get offers', text: 'Chat with buyers and dealers directly' },
			{ title: 'Get paid', text: 'Cash, credit or barter — your choice' },
		],
	},
	buy: {
		tag: 'BUY WITH AUTORE',
		title: 'Find a dealer you can trust.',
		text: 'Browse dealers across nine cities, see their cars and reviews, and contact the one that fits you.',
		cta: 'Find a dealer',
		href: '/dealer',
		steps: [
			{ title: 'Browse dealers', text: 'See every dealer and how many cars they list' },
			{ title: 'Check their cars', text: 'Photos, mileage and clear ₩ prices' },
			{ title: 'Contact & visit', text: 'Message the dealer and book a visit' },
		],
	},
};

const SellPromo = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const block = user?.memberType === MemberType.DEALER ? BLOCKS.sell : BLOCKS.buy;

	return (
		<Stack component={'section'} className={'sell-promo hp-section'} aria-labelledby={'sell-promo-title'}>
			<Stack className={'container'}>
				<div className={'sp-card'}>
					<div className={'sp-copy'}>
						<span className={'sp-tag'}>{t(block.tag)}</span>
						<h2 id={'sell-promo-title'}>{t(block.title)}</h2>
						<p>{t(block.text)}</p>
						<Link href={block.href} className={'sp-btn'}>
							{t(block.cta)}
						</Link>
					</div>
					<ol className={'sp-steps'}>
						{block.steps.map((step, k) => (
							<li key={step.title}>
								<span className={'sp-num'}>{String(k + 1).padStart(2, '0')}</span>
								<div>
									<strong>{t(step.title)}</strong>
									<span>{t(step.text)}</span>
								</div>
							</li>
						))}
					</ol>
				</div>
			</Stack>
		</Stack>
	);
};

export default SellPromo;
