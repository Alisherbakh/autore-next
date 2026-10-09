import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { CarCard } from '../mypage/CarCard';
import { Car } from '../../types/car/car';
import { CarsInquiry } from '../../types/car/car.input';
import { T } from '../../types/common';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { GET_CARS } from '../../../apollo/user/query';

const MyCars: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<CarsInquiry>({ ...initialInput });
	const [dealerCars, setDealerCars] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	// GET_CARS — apollo/user/query.ts dan; ko'rilayotgan dealerga tegishli e'lonlar ro'yxatini oladi
	const {
		loading: getCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarsRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya
	} = useQuery(GET_CARS, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: searchFilter }, // qaysi dealer (memberId) va sahifalash shu orqali yuboriladi
		skip: !searchFilter?.search?.memberId, // memberId hali aniqlanmagan bo'lsa so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: any) => {
			setDealerCars(data?.getCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
			setTotal(data?.getCars?.metaCounter[0]?.total ?? 0); // umumiy sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// searchFilter (sahifalash/memberId) o'zgarganda ro'yxatni qayta so'raydi
	useEffect(() => {
		getCarsRefetch().then();
	}, [searchFilter]);

	// URL'dagi memberId o'zgarganda (masalan boshqa dealerning profiliga o'tilganda) filtrni yangi dealerga moslashtiradi
	useEffect(() => {
		if (memberId)
			setSearchFilter({ ...initialInput, search: { ...initialInput.search, memberId: memberId as string } });
	}, [memberId]);

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi (yuqoridagi useEffect avtomatik qayta so'raydi)
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	if (device === 'mobile') {
		// mobil: My Cars'dagi bilan bir xil kartalar (status o'zgartirib bo'lmaydi — memberPage)
		return (
			<div id="mp-member-cars" className={'mp-section'}>
				{dealerCars?.length === 0 ? (
					<div className={'mp-empty'}>
						<strong>{t('No cars here yet')}</strong>
					</div>
				) : (
					<div className={'mp-rows'}>
						{dealerCars?.map((car: Car) => {
							return <CarCard car={car} memberPage={true} key={car?._id} />;
						})}
					</div>
				)}
				{dealerCars.length !== 0 && (
					<Stack className="mp-pagination">
						<Pagination
							count={Math.ceil(total / searchFilter.limit)}
							page={searchFilter.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="mp-total">{t('Total {{count}} cars available', { count: total })}</Typography>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
			<div id="member-cars-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Cars</Typography>
					</Stack>
				</Stack>
				<Stack className="cars-list-box">
					<Stack className="list-box">
						{dealerCars?.length > 0 && (
							<Stack className="listing-title-box">
								<Typography className="title-text">Listing title</Typography>
								<Typography className="title-text">Date Published</Typography>
								<Typography className="title-text">Status</Typography>
								<Typography className="title-text">View</Typography>
							</Stack>
						)}
						{dealerCars?.length === 0 && (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Car found!</p>
							</div>
						)}
						{dealerCars?.map((car: Car) => {
							return <CarCard car={car} memberPage={true} key={car?._id} />;
						})}

						{dealerCars.length !== 0 && (
							<Stack className="pagination-config">
								<Stack className="pagination-box">
									<Pagination
										count={Math.ceil(total / searchFilter.limit)}
										page={searchFilter.page}
										shape="circular"
										color="primary"
										onChange={paginationHandler}
									/>
								</Stack>
								<Stack className="total-result">
									<Typography>{total} car available</Typography>
								</Stack>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		);
	}
};

MyCars.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		search: {
			memberId: '',
		},
	},
};

export default MyCars;
