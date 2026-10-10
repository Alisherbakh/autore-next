import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Car } from '../../types/car/car';
import { CarsInquiry } from '../../types/car/car.input';
import TrendCarCard, { TrendCarSkeleton } from './TrendCarCard';
import SectionHead from './SectionHead';
import Link from 'next/link';
import CarCard from '../car/CarCard';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CARS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { optimisticLikeInList } from '../../optimistic';

interface TrendCarsProps {
	initialInput: CarsInquiry;
}

const TrendCars = (props: TrendCarsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [trendCars, setTrendCars] = useState<Car[]>([]);

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_CAR — apollo/user/mutation.ts dan; e'longa like bosish/olib tashlash uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	// GET_CARS — apollo/user/query.ts dan; like soni (carLikes) bo'yicha eng ko'p like olgan e'lonlarni oladi
	const {
		loading: getCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarsRefetch, // shu so'rovni qo'lda qayta yuborish (like bosgandan keyin ro'yxatni yangilash uchun)
	} = useQuery(GET_CARS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: { input: initialInput }, // sort: carLikes DESC — "eng ko'p like olgan" e'lonlar (defaultProps'da belgilangan)
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setTrendCars(data?.getCars?.list ?? []); // kelgan e'lonlar ro'yxatini state'ga yozadi
		},
	});
	/** HANDLERS **/
	// TrendCarCard'dagi like ikonkasi bosilganda ishga tushadi
	const likeCarHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			// optimistic: yurakcha va son DARHOL o'zgaradi, so'rov orqada ketadi (xato bo'lsa avvalgi holatga qaytadi)
			await optimisticLikeInList(
				setTrendCars,
				id,
				'carLikes',
				() => likeTargetCar({ variables: { input: id } }),
				'likeTargetCar',
			);
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// birinchi yuklanishda (hali e'lon yo'q) skelet kartalar ko'rsatiladi
	const showSkeleton = getCarsLoading && !trendCars?.length;
	const skeletonSlides = [0, 1, 2, 3].map((i) => (
		<SwiperSlide key={`sk-${i}`} className={'trend-car-slide'}>
			<TrendCarSkeleton />
		</SwiperSlide>
	));
	const emptyText = t('No trending cars yet. Like a car to see it here.');

	if (device === 'mobile') {
		// mobil: gorizontal aylantiriladigan qator (CarCard — /car sahifasidagi karta)
		return (
			<section className={'m-sec'} aria-labelledby={'m-trend-title'}>
				<div className={'m-sec-head'}>
					<h2 id={'m-trend-title'}>{t('Trend Cars')}</h2>
					<Link href={'/car'} className={'m-see'}>
						{t('See all')}
					</Link>
				</div>
				<div className={'m-scroll'} aria-busy={showSkeleton}>
					{showSkeleton &&
						[0, 1].map((i) => <div key={`sk-${i}`} className={'m-scroll-item m-skeleton'} aria-hidden="true" />)}
					{!showSkeleton && trendCars.length === 0 && <p className={'m-empty'}>{emptyText}</p>}
					{trendCars.map((car: Car) => (
						<div className={'m-scroll-item'} key={car._id}>
							<CarCard car={car} likeCarHandler={likeCarHandler} />
						</div>
					))}
				</div>
			</section>
		);
	} else {
		return (
			<Stack component={'section'} className={'trend-cars hp-section'}>
				<Stack className={'container'}>
					<SectionHead
						title={t('Trend Cars')}
						sub={t('Trend is based on likes')}
						actions={
							<div className={'hp-nav'}>
								<button type={'button'} className={'hp-nav-btn swiper-trend-prev'} aria-label={t('Previous')}>
									<WestIcon />
								</button>
								<div className={'swiper-trend-pagination'}></div>
								<button type={'button'} className={'hp-nav-btn swiper-trend-next'} aria-label={t('Next')}>
									<EastIcon />
								</button>
							</div>
						}
					/>
					<Stack className={'card-box'} aria-busy={showSkeleton}>
						{!showSkeleton && trendCars.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								{emptyText}
							</Box>
						) : (
							<Swiper
								className={'trend-car-swiper'}
								slidesPerView={'auto'}
								spaceBetween={15}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-trend-next',
									prevEl: '.swiper-trend-prev',
								}}
								pagination={{
									el: '.swiper-trend-pagination',
								}}
							>
								{showSkeleton && skeletonSlides}
								{trendCars.map((car: Car) => {
									return (
										<SwiperSlide key={car._id} className={'trend-car-slide'}>
											<TrendCarCard car={car} likeCarHandler={likeCarHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TrendCars.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'carLikes',
		direction: 'DESC',
		search: {},
	},
};

export default TrendCars;
