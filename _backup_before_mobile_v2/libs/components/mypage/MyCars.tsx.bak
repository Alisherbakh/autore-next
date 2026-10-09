import React, { useState } from 'react';
import { NextPage } from 'next';
import { Button, Pagination, Stack, Typography } from '@mui/material';
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
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import { useTranslation } from 'next-i18next';

const MyCars: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const [searchFilter, setSearchFilter] = useState<DealerCarsInquiry>(initialInput);
	const [dealerCars, setDealerCars] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const { t } = useTranslation('common');

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
		variables: { input: searchFilter }, // sahifalash + tanlangan tab (ACTIVE/RESERVED/SOLD) filtri shu orqali yuboriladi
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

	// "On Sale"/"Reserved"/"On Sold" tab'lari bosilganda chaqiriladi: filtrni tanlangan statusga o'zgartiradi
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

	const tabs: { key: CarStatus; label: string }[] = [
		{ key: CarStatus.ACTIVE, label: 'On sale' },
		{ key: CarStatus.RESERVED, label: 'Reserved' },
		{ key: CarStatus.SOLD, label: 'Sold' },
	];

	// mobil va desktop'da bir xil — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-cars" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('My Cars')}</Typography>
					<Typography className="sub-title">{t('Manage your listings and update their status.')}</Typography>
				</Stack>
				<Button
					className={'mp-btn-primary'}
					startIcon={<AddRoundedIcon />}
					onClick={() => router.push({ pathname: '/mypage', query: { category: 'addCar' } })}
				>
					{t('Add Car')}
				</Button>
			</Stack>
			<Stack className="car-list-box">
				<div className="tab-name-box mp-segment" role="tablist">
					{tabs.map((tab) => (
						<button
							type="button"
							role="tab"
							key={tab.key}
							aria-selected={searchFilter.search.carStatus === tab.key}
							onClick={() => changeStatusHandler(tab.key)}
							className={searchFilter.search.carStatus === tab.key ? 'active-tab-name' : 'tab-name'}
						>
							{t(tab.label)}
						</button>
					))}
				</div>
				<Stack className="list-box mp-table">
					<div className={`listing-title-box mp-table-head ${searchFilter.search.carStatus === 'ACTIVE' ? 'has-actions' : ''}`}>
						<span className="title-text">{t('Listing title')}</span>
						<span className="title-text">{t('Date published')}</span>
						<span className="title-text">{t('Status')}</span>
						<span className="title-text">{t('Views')}</span>
						{searchFilter.search.carStatus === 'ACTIVE' && <span className="title-text">{t('Action')}</span>}
					</div>
					{dealerCars?.length === 0 ? (
						<div className={'mp-empty'}>
							<span className={'mp-empty-icon'}>
								<DirectionsCarRoundedIcon />
							</span>
							<strong>{t('No cars here yet')}</strong>
							<p>{t('Cars you list will appear here.')}</p>
						</div>
					) : (
						<div className={`mp-rows ${searchFilter.search.carStatus === 'ACTIVE' ? 'has-actions' : ''}`}>
							{dealerCars.map((car: Car) => {
								return (
									<CarCard
										car={car}
										key={car?._id}
										deleteCarHandler={deleteCarHandler}
										updateCarHandler={updateCarHandler}
									/>
								);
							})}
						</div>
					)}
					{dealerCars.length !== 0 && (
						<Stack className="pagination-config mp-pagination">
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
				</Stack>
			</Stack>
		</div>
	);
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
