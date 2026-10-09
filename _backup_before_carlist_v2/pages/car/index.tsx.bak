import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Box, Button, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
import CarCard from '../../libs/components/car/CarCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Filter from '../../libs/components/car/Filter';
import { useRouter } from 'next/router';
import { CarsInquiry } from '../../libs/types/car/car.input';
import { Car } from '../../libs/types/car/car';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Direction, Message } from '../../libs/enums/common.enum';
import { useMutation, useQuery } from '@apollo/client';
import { GET_CARS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { LIKE_TARGET_CAR } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CarList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const [searchFilter, setSearchFilter] = useState<CarsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [cars, setCars] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_CAR — apollo/user/mutation.ts dan; e'longa like bosish/olib tashlash uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	// GET_CARS — apollo/user/query.ts dan; searchFilter (Filter komponenti + URL orqali boshqariladi) bo'yicha e'lonlar ro'yxatini oladi
	const {
		loading: getCarsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getCarsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarsError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarsRefetch, // shu so'rovni qo'lda qayta yuborish (like bosgandan keyin ro'yxatni yangilash uchun)
	} = useQuery(GET_CARS, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: searchFilter }, // filtr/sahifalash shu orqali yuboriladi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setCars(data?.getCars?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
			setTotal(data?.getCars?.metaCounter[0]?.total); // jami e'lonlar sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// sahifa yuklanganda yoki URL o'zgarganda: URL'dagi ?input=... qiymatini o'qib filtrni tiklaydi,
	// sahifa raqamini ham shunga moslaydi
	useEffect(() => {
		if (router.query.input) {
			const inputObj = JSON.parse(router?.query?.input as string);
			setSearchFilter(inputObj);
		}

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	// searchFilter o'zgarganda ishga tushishi kerak edi, lekin haqiqiy refetch chaqiruvi hozircha izohga olib qo'yilgan
	// (pastda kommentda) — shuning uchun Filter orqali qilingan o'zgarishlar hozircha ro'yxatni avtomatik yangilamaydi
	useEffect(() => {
		// BACKEND REFETCH
		console.log('searchFilter:', searchFilter);
		//getCarsRefetch({ input: searchFilter }).then();
	}, [searchFilter]);

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: yangi sahifa raqamini URL'ga yozadi va state'ni yangilaydi
	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(
			`/car?input=${JSON.stringify(searchFilter)}`,
			`/car?input=${JSON.stringify(searchFilter)}`,
			{
				scroll: false,
			},
		);
		setCurrentPage(value);
	};

	// CarCard'dagi like ikonkasi bosilganda ishga tushadi
	const likeCarHandler = async (user: T, id: string) => {
			try {                // auth bolgan user  ,  like bosilyotgan car
				if (!id) return;// like bosmoqchi bolgan car id
				if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
	
				await likeTargetCar({
					variables: { input: id },
				});
				await getCarsRefetch({ input: initialInput });
	
				await sweetTopSmallSuccessAlert('success', 800);
			} catch (err: any) {
				console.log('ERROR, likeCarHandler:', err.message);
				sweetMixinErrorAlert(err.message).then();
			}
		};

	// "Sort by" tugmasi bosilganda saralash menyusini ochadi
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	// saralash menyusini yopadi
	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	// menyudan saralash turi (New/Lowest/Highest Price) tanlanganda: searchFilter.sort/direction'ni yangilaydi
	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'new':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.ASC });
				setFilterSortName('New');
				break;
			case 'lowest':
				setSearchFilter({ ...searchFilter, sort: 'carPrice', direction: Direction.ASC });
				setFilterSortName('Lowest Price');
				break;
			case 'highest':
				setSearchFilter({ ...searchFilter, sort: 'carPrice', direction: Direction.DESC });
				setFilterSortName('Highest Price');
		}
		setSortingOpen(false);
		setAnchorEl(null);
	};

	if (device === 'mobile') {
		return <h1>CARS MOBILE</h1>;
	} else {
		return (
			<div id="car-list-page" style={{ position: 'relative' }}>
				<div className="container">
					<Box component={'div'} className={'right'}>
						<span>Sort by</span>
						<div>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{filterSortName}
							</Button>
							<Menu anchorEl={anchorEl} open={sortingOpen} onClose={sortingCloseHandler} sx={{ paddingTop: '5px' }}>
								<MenuItem
									onClick={sortingHandler}
									id={'new'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									New
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'lowest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Lowest Price
								</MenuItem>
								<MenuItem
									onClick={sortingHandler}
									id={'highest'}
									disableRipple
									sx={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
								>
									Highest Price
								</MenuItem>
							</Menu>
						</div>
					</Box>
					<Stack className={'car-page'}>
						<Stack className={'filter-config'}>
							{/* @ts-ignore */}
							<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
						</Stack>
						<Stack className="main-config" mb={'76px'}>
							<Stack className={'list-config'}>
								{cars?.length === 0 ? (
									<div className={'no-data'}>
										<img src="/img/icons/icoAlert.svg" alt="" />
										<p>No Cars found!</p>
									</div>
								) : (
									cars.map((car: Car) => {
										return <CarCard car={car} likeCarHandler={likeCarHandler} key={car?._id} />;
									})
								)}
							</Stack>
							<Stack className="pagination-config">
								{cars.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={Math.ceil(total / searchFilter.limit)}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{cars.length !== 0 && (
									<Stack className="total-result">
										<Typography>
											Total {total} car{total > 1 ? 's' : ''} available
										</Typography>
									</Stack>
								)}
							</Stack>
						</Stack>
					</Stack>
				</div>
			</div>
		);
	}
};

CarList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			pricesRange: {
				start: 0,
				end: 1000000000,
			},
		},
	},
};

export default withLayoutBasic(CarList);
