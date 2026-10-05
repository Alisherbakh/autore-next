import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import PopularCarCard from './PopularCarCard';
import { Car } from '../../types/car/car';
import Link from 'next/link';
import { CarsInquiry } from '../../types/car/car.input';
import { useQuery } from '@apollo/client';
import { GET_CARS } from '../../../apollo/user/query';
import { T } from '../../types/common';

interface PopularCarsProps {
	initialInput: CarsInquiry;
}

const PopularCars = (props: PopularCarsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [popularCars, setPopularCars] = useState<Car[]>([]);

	/** APOLLO REQUESTS **/
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

	if (!popularCars) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'popular-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Popular cars</span>
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
										<PopularCarCard car={car} />
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
			<Stack className={'popular-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Popular cars</span>
							<p>Popularity is based on views</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'more-box'}>
								<Link href={'/car'}>
									<span>See All Categories</span>
								</Link>
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
						</Box>
					</Stack>
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
										<PopularCarCard car={car} />
									</SwiperSlide>
								);
							})}
						</Swiper>
					</Stack>
					<Stack className={'pagination-box'}>
						<WestIcon className={'swiper-popular-prev'} />
						<div className={'swiper-popular-pagination'}></div>
						<EastIcon className={'swiper-popular-next'} />
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
