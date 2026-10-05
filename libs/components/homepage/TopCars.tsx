import React, { useState } from 'react';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopCarCard from './TopCarCard';
import { CarsInquiry } from '../../types/car/car.input';
import { Car } from '../../types/car/car';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CARS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';



interface TopCarsProps {
	initialInput: CarsInquiry;
}

const TopCars = (props: TopCarsProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const [topCars, setTopCars] = useState<Car[]>([]);

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_CAR — apollo/user/mutation.ts dan; e'longa like bosish/olib tashlash uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);

	// GET_CARS — apollo/user/query.ts dan; reyting (carRank) bo'yicha eng yuqori e'lonlarni oladi
	const {
		loading: getCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarsRefetch, // shu so'rovni qo'lda qayta yuborish (like bosgandan keyin ro'yxatni yangilash uchun)
	} = useQuery(GET_CARS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: { input: initialInput }, // sort: carRank DESC — "eng yuqori reytingli" e'lonlar (defaultProps'da belgilangan)
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setTopCars(data?.getCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
		},
	});
	/** HANDLERS **/
	// TopCarCard'dagi like ikonkasi bosilganda ishga tushadi
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

	if (device === 'mobile') {
		return (
			<Stack className={'top-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<span>Top cars</span>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-car-swiper'}
							slidesPerView={'auto'}
							centeredSlides={true}
							spaceBetween={15}
							modules={[Autoplay]}
						>
							{topCars.map((car: Car) => {
								return (
									<SwiperSlide className={'top-car-slide'} key={car?._id}>
										<TopCarCard car={car} likeCarHandler={likeCarHandler}/>
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
			<Stack className={'top-cars'}>
				<Stack className={'container'}>
					<Stack className={'info-box'}>
						<Box component={'div'} className={'left'}>
							<span>Top cars</span>
							<p>Check out our Top Cars</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'pagination-box'}>
								<WestIcon className={'swiper-top-prev'} />
								<div className={'swiper-top-pagination'}></div>
								<EastIcon className={'swiper-top-next'} />
							</div>
						</Box>
					</Stack>
					<Stack className={'card-box'}>
						<Swiper
							className={'top-car-swiper'}
							slidesPerView={'auto'}
							spaceBetween={15}
							modules={[Autoplay, Navigation, Pagination]}
							navigation={{
								nextEl: '.swiper-top-next',
								prevEl: '.swiper-top-prev',
							}}
							pagination={{
								el: '.swiper-top-pagination',
							}}
						>
							{topCars.map((car: Car) => {
								return (
									<SwiperSlide className={'top-car-slide'} key={car?._id}>
										<TopCarCard car={car} likeCarHandler={likeCarHandler}/>
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

TopCars.defaultProps = {
	initialInput: {
		page: 1,
		limit: 8,
		sort: 'carRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopCars;
