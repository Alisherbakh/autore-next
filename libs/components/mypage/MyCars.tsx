import React, { useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { CarCard } from './CarCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { UPDATE_CAR } from '../../../apollo/user/mutation';
import { GET_DEALER_CARS } from '../../../apollo/user/query';
import { Car } from '../../types/car/car';
import { DealerCarsInquiry } from '../../types/car/car.input';
import { T } from '../../types/common';
import { CarStatus } from '../../enums/car.enum';
import { userVar } from '../../../apollo/store';
import { useRouter } from 'next/router';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';

const MyCars: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<DealerCarsInquiry>(initialInput);
	const [dealerCars, setDealerCars] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();

	/** APOLLO REQUESTS **/
	// UPDATE_CAR — apollo/user/mutation.ts dan; e'lon maydonlarini (shu jumladan statusni) yangilash uchun mutatsiya
	const [updateCar] = useMutation(UPDATE_CAR);

	// GET_DEALER_CARS — apollo/user/query.ts dan; tizimga kirgan dealerning o'ziga tegishli e'lonlari ro'yxatini oladi
	const {
		loading: getDealerCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getDealerCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getDealerCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getDealerCarsRefetch, // shu so'rovni qo'lda qayta yuborish (masalan status o'zgargandan keyin)
	} = useQuery(GET_DEALER_CARS, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: searchFilter }, // sahifalash + tanlangan tab (ACTIVE/SOLD) filtri shu orqali yuboriladi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setDealerCars(data?.getDealerCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
			setTotal(data?.getDealerCars?.metaCounter[0]?.total ?? 0); // umumiy sonini state'ga yozadi
		},
	});

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, searchFilter o'zgargani uchun useQuery qayta so'raydi
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	// "On Sale"/"On Sold" tab'lari bosilganda chaqiriladi: filtrni tanlangan statusga o'zgartiradi
	const changeStatusHandler = (value: CarStatus) => {
		setSearchFilter({ ...searchFilter, search: { carStatus: value } });
	};

	// e'lonni "o'chirish" tugmasi bosilganda: haqiqatan bazadan o'chirmaydi, carStatus'ni DELETE qilib qo'yadi
	const deleteCarHandler = async (id: string) => {
		try {
			if (await sweetConfirmAlert('Are you sure to delete this car?')) {
				// tasdiqlansa — UPDATE_CAR mutatsiyasi orqali statusni DELETE'ga o'zgartiradi
				await updateCar({
					variables: {
						input: {
							_id: id, // qaysi e'lon
							carStatus: 'DELETE', // yangi status
						},
					},
				});

				await getDealerCarsRefetch({ input: searchFilter }); // ro'yxatni yangilaydi (o'chirilgan endi ko'rinmaydi)
			}
		} catch (err: any) {
			await sweetErrorHandling(err); // xato bo'lsa umumiy xato ko'rsatuvchi funksiya chaqiriladi
		}
	};

	// CarCard'dagi status menyusidan tanlangan holatga (masalan SOLD) o'zgartirish uchun chaqiriladi
	const updateCarHandler = async (status: string, id: string) => {
		try {
			if (await sweetConfirmAlert(`are you sure change to ${status} status?`)) {
				await updateCar({
					variables: {
						input: {
							_id: id, // qaysi e'lon
							carStatus: status, // tanlangan yangi status
						},
					},
				});
				await getDealerCarsRefetch({ input: searchFilter }); // ro'yxatni yangilaydi
			}
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	if (user?.memberType !== 'DEALER') {
		router.back();
	}

	if (device === 'mobile') {
		return <div>AUTORE CARS MOBILE</div>;
	} else {
		return (
			<div id="my-car-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Cars</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="car-list-box">
					<Stack className="tab-name-box">
						<Typography
							onClick={() => changeStatusHandler(CarStatus.ACTIVE)}
							className={searchFilter.search.carStatus === 'ACTIVE' ? 'active-tab-name' : 'tab-name'}
						>
							On Sale
						</Typography>
						<Typography
							onClick={() => changeStatusHandler(CarStatus.SOLD)}
							className={searchFilter.search.carStatus === 'SOLD' ? 'active-tab-name' : 'tab-name'}
						>
							On Sold
						</Typography>
					</Stack>
					<Stack className="list-box">
						<Stack className="listing-title-box">
							<Typography className="title-text">Listing title</Typography>
							<Typography className="title-text">Date Published</Typography>
							<Typography className="title-text">Status</Typography>
							<Typography className="title-text">View</Typography>
							{searchFilter.search.carStatus === 'ACTIVE' && <Typography className="title-text">Action</Typography>}
						</Stack>

						{dealerCars?.length === 0 ? (
							<div className={'no-data'}>
								<img src="/img/icons/icoAlert.svg" alt="" />
								<p>No Car found!</p>
							</div>
						) : (
							dealerCars.map((car: Car) => {
								return (
									<CarCard
										car={car}
										deleteCarHandler={deleteCarHandler}
										updateCarHandler={updateCarHandler}
									/>
								);
							})
						)}

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
			carStatus: 'ACTIVE',
		},
	},
};

export default MyCars;
