import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import PopularCarCard from './PopularCarCard';
import { Car } from '../../types/car/car';
import Link from 'next/link';
import { CarsInquiry } from '../../types/car/car.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { GET_CARS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import SectionHead from './SectionHead';

interface PopularCarsProps {
	initialInput: CarsInquiry;
}

const PopularCars = (props: PopularCarsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [popularCars, setPopularCars] = useState<Car[]>([]);

	/** APOLLO REQUESTS **/
	// e'longa like bosish uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	// GET_CARS — apollo/user/query.ts dan; ko'rishlar soni (carViews) bo'yicha eng mashhur e'lonlarni oladi
	const {
		loading: getCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarsRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya (bu komponentda hozircha chaqirilmagan)
	} = useQuery(GET_CARS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: { input: initialInput }, // sort: carViews DESC — "eng ko'p ko'rilgan" e'lonlar (defaultProps'da belgilangan)
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setPopularCars(data?.getCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
		},
	});
	/** HANDLERS **/
	// e'longa like bosish: login tekshiradi, mutatsiya yuboradi, ro'yxatni yangilaydi
	const likeCarHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetCar({ variables: { input: id } });
			const result = await getCarsRefetch({ input: initialInput });
			if (result?.data?.getCars?.list) setPopularCars(result.data.getCars.list);
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (!popularCars) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>{t('Popular cars')}</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-car-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={25}
							modules={[Autoplay]}
						>
							{popularCars.map((car: Car) => {
								return (
									<SwiperSlide key={car._id} className={'popular-car-slide'}>
										<PopularCarCard car={car} likeCarHandler={likeCarHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	} else {
		return (
			<Stack component={'section'} className={'popular-cars hp-section'}>
				<Stack className={'container'}>
					<SectionHead
						title={t('Popular cars')}
						sub={t('Popularity is based on views')}
						actions={
							<>
								<Link href={'/car'} className={'hp-more'}>
									{t('See All Categories')}
									<img src="/img/icons/rightup.svg" alt="" width={16} height={16} />
								</Link>
								<div className={'hp-nav'}>
									<button type={'button'} className={'hp-nav-btn swiper-popular-prev'} aria-label={t('Previous')}>
										<WestIcon />
									</button>
									<div className={'swiper-popular-pagination'}></div>
									<button type={'button'} className={'hp-nav-btn swiper-popular-next'} aria-label={t('Next')}>
										<EastIcon />
									</button>
								</div>
							</>
						}
					/>
					<Stack className={'card-box'}>
						<Swiper
							className={'popular-car-swiper'}
							slidesPerView={'auto'}
							spaceBetween={25}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-popular-next',
								prevEl: '.swiper-popular-prev',
							}}
							pagination={{
								el: '.swiper-popular-pagination',
							}}
						>
							{popularCars.map((car: Car) => {
								return (
									<SwiperSlide key={car._id} className={'popular-car-slide'}>
										<PopularCarCard car={car} likeCarHandler={likeCarHandler} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

PopularCars.defaultProps = {
	initialInput: {
		page: 1,
		limit: 7,
		sort: 'carViews',
		direction: 'DESC',
		search: {},
	},
};

export default PopularCars;
