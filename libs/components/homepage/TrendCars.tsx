import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import { Car } from '../../types/car/car';
import { CarsInquiry } from '../../types/car/car.input';
import TrendCarCard from './TrendCarCard';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CARS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface TrendCarsProps {
	initialInput: CarsInquiry;
}

const TrendCars = (props: TrendCarsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
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
			setTrendCars(data?.getCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
		},
	});
	/** HANDLERS **/
	// TrendCarCard'dagi like ikonkasi bosilganda ishga tushadi
	const likeCarHandler = async (user: T, id: string) => {
		try {
			if (!id) return; // e'lon id'si bo'lmasa, davom etmaydi
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED); // login qilinmagan bo'lsa xato chiqaradi

			await likeTargetCar({
				variables: { input: id }, // like bosilayotgan e'lonning ID'si
			});
			await getCarsRefetch({ input: initialInput }); // ro'yxatni yangilaydi (like soni yangilanishi uchun)

			await sweetTopSmallSuccessAlert('success', 800); // qisqa muvaffaqiyat xabari
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (trendCars) console.log('trendCars:', trendCars);
	if (!trendCars) return null;

	if (device === 'mobile') {
		return (
			<Stack className={'trend-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Trend Cars</span>
					</Stack>
					<Stack className={'card-box'}>
						{trendCars.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
							</Box>
						) : (
							<Swiper
								className={'trend-car-swiper'}
								slidesPerView={'auto'}
								centeredSlides={true}
								spaceBetween={15}
								modules={[Autoplay]}
							>
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
	} else {
		return (
			<Stack className={'trend-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Trend Cars</span>
							<p>Trend is based on likes</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-trend-prev'} />
								<div className={'swiper-trend-pagination'}></div>
								<EastIcon className={'swiper-trend-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						{trendCars.length === 0 ? (
							<Box component={'div'} className={'empty-list'}>
								Trends Empty
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
