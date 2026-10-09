import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Button, Drawer, Menu, MenuItem, Pagination, Stack, Typography } from '@mui/material';
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
import { useTranslation } from 'next-i18next';
import { formatterStr, formatEnum } from '../../libs/utils';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CarList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<CarsInquiry>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [cars, setCars] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortingOpen, setSortingOpen] = useState(false);
	const [filterSortName, setFilterSortName] = useState('New');
	// mobil: filtr oynasi (pastdan ochiladi) ochiq/yopiq
	const [filterOpen, setFilterOpen] = useState<boolean>(false);

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
				// joriy filtr bilan qayta so'raydi (avval initialInput edi — like'dan keyin filtrlar tushib qolardi)
				await getCarsRefetch({ input: searchFilter });
	
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
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: Direction.DESC }); // eng yangilari birinchi
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

	// tanlangan filtrni olib tashlash (chip'dagi ×): yangi filtrni URL'ga yozadi — Filter komponentidagi bilan bir xil yo'l
	const removeFilterHandler = async (key: string, value?: string) => {
		const search: any = { ...searchFilter.search };
		if (value !== undefined) {
			const list: string[] = (search[key] || []).filter((item: string) => item !== value);
			if (list.length) search[key] = list;
			else delete search[key];
		} else if (key === 'pricesRange') {
			search.pricesRange = initialInput.search.pricesRange;
		} else {
			delete search[key];
		}
		const next = { ...searchFilter, page: 1, search };
		await router.push(`/car?input=${JSON.stringify(next)}`, `/car?input=${JSON.stringify(next)}`, { scroll: false });
	};

	// "Clear all": barcha filtrlarni boshlang'ich holatga qaytaradi (Filter'dagi "Reset all" bilan bir xil)
	const clearFiltersHandler = async () => {
		await router.push(`/car?input=${JSON.stringify(initialInput)}`, `/car?input=${JSON.stringify(initialInput)}`, {
			scroll: false,
		});
	};

	/** RENDER **/
	// tanlangan filtrlar ro'yxati — chip ko'rinishida ko'rsatish uchun
	const activeChips: { key: string; value?: string; label: string }[] = [];
	const listKeys = ['locationList', 'brandList', 'typeList', 'fuelTypeList', 'transmissionList', 'options'];
	listKeys.forEach((key: string) => {
		((searchFilter?.search as any)?.[key] || []).forEach((value: string) => {
			const label = key === 'options' ? t(value === 'carBarter' ? 'Barter' : 'Credit') : formatEnum(value);
			activeChips.push({ key, value, label });
		});
	});
	const years = searchFilter?.search?.yearsRange;
	if (years) activeChips.push({ key: 'yearsRange', label: `${years.start ?? '…'} – ${years.end ?? '…'}` });
	const mileage = searchFilter?.search?.mileageRange;
	if (mileage)
		activeChips.push({
			key: 'mileageRange',
			label: `${(mileage.start ?? 0).toLocaleString()} – ${(mileage.end ?? 0).toLocaleString()} km`,
		});
	const prices = searchFilter?.search?.pricesRange;
	if (
		prices &&
		(prices.start !== initialInput.search.pricesRange.start || prices.end !== initialInput.search.pricesRange.end)
	)
		activeChips.push({ key: 'pricesRange', label: `₩${formatterStr(prices.start) || 0} – ₩${formatterStr(prices.end)}` });

	const sortMenu = (
		<Menu
			anchorEl={anchorEl}
			open={sortingOpen}
			onClose={sortingCloseHandler}
			sx={{ paddingTop: '5px' }}
			className={'cl-sort-menu'}
		>
			<MenuItem onClick={sortingHandler} id={'new'} disableRipple>
				{t('New')}
			</MenuItem>
			<MenuItem onClick={sortingHandler} id={'lowest'} disableRipple>
				{t('Lowest Price')}
			</MenuItem>
			<MenuItem onClick={sortingHandler} id={'highest'} disableRipple>
				{t('Highest Price')}
			</MenuItem>
		</Menu>
	);

	const chipsRow =
		activeChips.length > 0 ? (
			<div className={'cl-chips'}>
				{activeChips.map((chip) => (
					<button
						type="button"
						className={'cl-chip'}
						key={`${chip.key}-${chip.value ?? ''}`}
						onClick={() => removeFilterHandler(chip.key, chip.value)}
						aria-label={t('Remove filter {{name}}', { name: chip.label })}
					>
						{chip.label}
						<CloseRoundedIcon />
					</button>
				))}
				<button type="button" className={'cl-chip-clear'} onClick={clearFiltersHandler}>
					{t('Clear all')}
				</button>
			</div>
		) : null;

	const cardGrid = (
		<div className={'list-config cl-grid'}>
			{getCarsLoading && !cars?.length ? (
				Array.from({ length: 6 }).map((_, i: number) => (
					<div className={'cl-skeleton'} key={i} aria-hidden="true">
						<span className={'sk-img'} />
						<span className={'sk-line'} />
						<span className={'sk-line short'} />
					</div>
				))
			) : cars?.length === 0 ? (
				<div className={'cl-empty'}>
					<span className={'cl-empty-icon'}>
						<DirectionsCarRoundedIcon />
					</span>
					<strong>{t('No cars match your filters')}</strong>
					<p>{t('Try removing a filter or widening the price range.')}</p>
					{activeChips.length > 0 && (
						<Button className={'cl-btn-primary'} onClick={clearFiltersHandler}>
							{t('Clear all filters')}
						</Button>
					)}
				</div>
			) : (
				cars.map((car: Car) => {
					return <CarCard car={car} likeCarHandler={likeCarHandler} key={car?._id} />;
				})
			)}
		</div>
	);

	const pagination =
		cars.length !== 0 ? (
			<Stack className="cl-pagination">
				<Pagination
					page={currentPage}
					count={Math.ceil(total / searchFilter.limit)}
					onChange={handlePaginationChange}
					shape="circular"
					color="primary"
				/>
				<Typography className={'cl-total'}>{t('Total {{count}} cars available', { count: total })}</Typography>
			</Stack>
		) : null;

	if (device === 'mobile') {
		return (
			<div id="car-list-page" className={'cl-v2 cl-mobile'}>
				<div className={'cl-head'}>
					<h1 className={'cl-title'}>{t('Find your car')}</h1>
					<p className={'cl-sub'}>{total ? t('{{count}} cars found', { count: total }) : ' '}</p>
				</div>
				<div className={'cl-toolbar'}>
					<Button
						className={'cl-filter-btn'}
						onClick={() => setFilterOpen(true)}
						startIcon={<TuneRoundedIcon />}
					>
						{t('Filters')}
						{activeChips.length > 0 && <span className={'cl-filter-count'}>{activeChips.length}</span>}
					</Button>
					<Button
						className={'cl-sort-btn'}
						onClick={sortingClickHandler}
						endIcon={<KeyboardArrowDownRoundedIcon />}
					>
						{t(filterSortName)}
					</Button>
					{sortMenu}
				</div>
				{chipsRow}
				{cardGrid}
				{pagination}

				<Drawer
					anchor={'bottom'}
					open={filterOpen}
					onClose={() => setFilterOpen(false)}
					className={'cl-drawer'}
					PaperProps={{ className: 'cl-drawer-paper' }}
				>
					<div className={'cl-drawer-handle'} />
					{/* @ts-ignore */}
					<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					<div className={'cl-drawer-foot'}>
						<Button className={'cl-btn-primary'} onClick={() => setFilterOpen(false)}>
							{total ? t('Show {{count}} cars', { count: total }) : t('Show results')}
						</Button>
					</div>
				</Drawer>
			</div>
		);
	} else {
		return (
			<div id="car-list-page" className={'cl-v2'}>
				<div className={'cl-wrap'}>
					<aside className={'filter-config cl-side'}>
						{/* @ts-ignore */}
						<Filter searchFilter={searchFilter} setSearchFilter={setSearchFilter} initialInput={initialInput} />
					</aside>
					<section className={'cl-main'}>
						<div className={'cl-topbar'}>
							<div>
								<strong className={'cl-found'}>
									{total ? t('{{count}} cars found', { count: total }) : t('Cars')}
								</strong>
								{searchFilter?.search?.text ? (
									<span className={'cl-query'}>“{searchFilter.search.text}”</span>
								) : null}
							</div>
							<div className={'cl-sort'}>
								<span>{t('Sort by')}</span>
								<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
									{t(filterSortName)}
								</Button>
								{sortMenu}
							</div>
						</div>
						{chipsRow}
						{cardGrid}
						{pagination}
					</section>
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
