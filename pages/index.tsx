import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularCars from '../libs/components/homepage/PopularCars';
import TopDealers from '../libs/components/homepage/TopDealers';
import Events from '../libs/components/homepage/Events';
import TrendCars from '../libs/components/homepage/TrendCars';
import TopCars from '../libs/components/homepage/TopCars';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import BrandStrip from '../libs/components/homepage/BrandStrip';
import CarTypes from '../libs/components/homepage/CarTypes';
import QuickMenu from '../libs/components/homepage/QuickMenu';
import SellPromo from '../libs/components/homepage/SellPromo';
import PayYourWay from '../libs/components/homepage/PayYourWay';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import HeroShowcase from '../libs/components/homepage/HeroShowcase';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		// mobil bosh sahifa: hero → qidiruv + tezkor filtrlar → trend → turlar → "Find a dealer" → dealerlar → community
		const carsHref = (search: any) => {
			const input = { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { pricesRange: { start: 0, end: 1000000000 }, ...search } };
			return `/car?input=${JSON.stringify(input)}`;
		};
		const chips = [
			{ label: 'SUV', search: { typeList: ['SUV'] } },
			{ label: t('Sedan'), search: { typeList: ['SEDAN'] } },
			{ label: t('Electric'), search: { fuelTypeList: ['ELECTRIC'] } },
			{ label: `${t('Credit')} ✓`, search: { options: ['carCredit'] } },
			{ label: `${t('Barter')} ✓`, search: { options: ['carBarter'] } },
			{ label: t('Seoul'), search: { locationList: ['SEOUL'] } },
		];
		return (
			<Stack className={'home-page m-home'}>
				<HeroShowcase />
				<div className={'m-search'}>
					<Link href={'/car'} className={'m-search-box'}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
							<circle cx="11" cy="11" r="7" />
							<path d="m20 20-3.5-3.5" />
						</svg>
						<span>{t('Model, brand or keyword')}</span>
					</Link>
					<div className={'m-chips'}>
						{chips.map((chip) => (
							<Link key={chip.label} href={carsHref(chip.search)} className={'m-chip'}>
								{chip.label}
							</Link>
						))}
					</div>
				</div>
				<TrendCars />
				<CarTypes />
				<SellPromo />
				<TopDealers />
				<CommunityBoards />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<QuickMenu />
				<BrandStrip />
				<TrendCars />
				<CarTypes />
				<PopularCars />
				<SellPromo />
				{/* "Top cars" o'rnida — kredit / barter bilan sotiladigan mashinalar (TopCars mobil versiyada qoladi) */}
				<PayYourWay />
				<TopDealers />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
