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
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<TrendCars />
				<PopularCars />
				<Advertisement />
				<TopCars />
				<TopDealers />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<BrandStrip />
				<TrendCars />
				<PopularCars />
				<CarTypes />
				<Advertisement />
				<TopCars />
				<TopDealers />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
