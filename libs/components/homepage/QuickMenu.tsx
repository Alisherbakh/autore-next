import React from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';

// Hyundai uslubidagi ikonkali tezkor menyu (hero ostida). Faqat havolalar — yangi mantiq yo'q.
// "Sell my car" faqat DEALER'ga ko'rinadi (mashinani faqat dealer qo'sha oladi); qolganlar uchun "Find dealer" allaqachon bor.
const ITEMS: { label: string; href: string; d: string; dealerOnly?: boolean }[] = [
	{ label: 'Search cars', href: '/car', d: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-3.5-3.5' },
	{ label: 'Sell my car', href: '/mypage?category=addCar', dealerOnly: true, d: 'M3 13l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5v4H3zM3 13h18M7 17v2M17 17v2' },
	{ label: 'Find dealer', href: '/dealer', d: 'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z' },
	{ label: 'Saved cars', href: '/mypage?category=myFavorites', d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' },
	{ label: 'Community', href: '/community', d: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5' },
	{ label: 'Customer service', href: '/cs', d: 'M4 13a8 8 0 0 1 16 0M4 13v4h3v-5H4zM20 13v4h-3v-5h3z' },
];

const QuickMenu = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isDealer = user?.memberType === MemberType.DEALER;
	const items = ITEMS.filter((item) => !item.dealerOnly || isDealer);

	return (
		<Stack component={'nav'} className={'quick-menu'} aria-label={t('Quick menu')}>
			<Stack className={'container'}>
				<ul className={'qm-list'}>
					{items.map((item) => (
						<li key={item.label}>
							<Link href={item.href} className={'qm-item'}>
								<span className={'qm-icon'}>
									<svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
										<path d={item.d} />
									</svg>
								</span>
								<span className={'qm-label'}>{t(item.label)}</span>
							</Link>
						</li>
					))}
				</ul>
			</Stack>
		</Stack>
	);
};

export default QuickMenu;
