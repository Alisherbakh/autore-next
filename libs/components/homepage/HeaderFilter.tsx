import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { carMileages, carYears } from '../../config';
import { CarBrand, CarFuelType, CarLocation, CarType } from '../../enums/car.enum';
import { CarsInquiry } from '../../types/car/car.input';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	borderRadius: '12px',
	outline: 'none',
	boxShadow: 24,
};

const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

const thisYear = new Date().getFullYear();

interface HeaderFilterProps {
	initialInput: CarsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t, i18n } = useTranslation('common');
	const [searchFilter, setSearchFilter] = useState<CarsInquiry>(initialInput);
	const locationRef: any = useRef();
	const typeRef: any = useRef();
	const brandRef: any = useRef();
	const router = useRouter();
	const [openAdvancedFilter, setOpenAdvancedFilter] = useState(false);
	const [openLocation, setOpenLocation] = useState(false);
	const [openType, setOpenType] = useState(false);
	const [openBrand, setOpenBrand] = useState(false);
	const [carLocation, setCarLocation] = useState<CarLocation[]>(Object.values(CarLocation));
	const [carType, setCarType] = useState<CarType[]>(Object.values(CarType));
	const [carBrand, setCarBrand] = useState<CarBrand[]>(Object.values(CarBrand));
	const [carFuelType, setCarFuelType] = useState<CarFuelType[]>(Object.values(CarFuelType));
	const [yearCheck, setYearCheck] = useState({ start: 1990, end: thisYear + 1 });
	const [optionCheck, setOptionCheck] = useState('all');

	/** LIFECYCLES **/
	// sahifaning istalgan joyiga bosilganda ishga tushadi: agar bosilgan joy location/type/brand
	// dropdown'larining ichida bo'lmasa, o'sha dropdown'ni yopadi (tashqariga bosilsa menyu yopilishi uchun)
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			if (!locationRef?.current?.contains(event.target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(event.target)) {
				setOpenType(false);
			}

			if (!brandRef?.current?.contains(event.target)) {
				setOpenBrand(false);
			}
		};

		document.addEventListener('mousedown', clickHandler); // butun hujjatga listener qo'shadi

		return () => {
			document.removeEventListener('mousedown', clickHandler); // komponent yo'qolganda listener'ni tozalaydi (memory leak bo'lmasligi uchun)
		};
	}, []); // faqat bir marta, komponent birinchi chizilganda ishga tushadi

	/** HANDLERS **/
	// "Advanced" filtr oynasini (modal) ochish/yopish; ochilganda boshqa dropdown'larni yopib qo'yadi
	const advancedFilterHandler = (status: boolean) => {
		setOpenLocation(false);
		setOpenBrand(false);
		setOpenType(false);
		setOpenAdvancedFilter(status);
	};

	// "Location" dropdown'ini ochadi/yopadi, boshqalarini yopib qo'yadi (bir vaqtda faqat bitta dropdown ochiq bo'lishi uchun)
	const locationStateChangeHandler = () => {
		setOpenLocation((prev) => !prev);
		setOpenBrand(false);
		setOpenType(false);
	};

	// "Car type" dropdown'ini ochadi/yopadi, boshqalarini yopib qo'yadi
	const typeStateChangeHandler = () => {
		setOpenType((prev) => !prev);
		setOpenLocation(false);
		setOpenBrand(false);
	};

	// "Brand" dropdown'ini ochadi/yopadi, boshqalarini yopib qo'yadi
	const brandStateChangeHandler = () => {
		setOpenBrand((prev) => !prev);
		setOpenType(false);
		setOpenLocation(false);
	};

	// barcha uchta dropdown'ni yopadi (masalan tanlov qilingandan keyin)
	const disableAllStateHandler = () => {
		setOpenBrand(false);
		setOpenType(false);
		setOpenLocation(false);
	};

	// "Location" ro'yxatidan biri tanlanganda: searchFilter.search.locationList'ga yozadi va navbatdagi (Type) dropdown'ni ochadi
	const carLocationSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						locationList: [value],
					},
				});
				typeStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, carLocationSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Car type" ro'yxatidan biri tanlanganda: searchFilter.search.typeList'ga yozadi va navbatdagi (Brand) dropdown'ni ochadi
	const carTypeSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						typeList: [value],
					},
				});
				brandStateChangeHandler();
			} catch (err: any) {
				console.log('ERROR, carTypeSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Brand" ro'yxatidan biri tanlanganda: searchFilter.search.brandList'ga yozadi va barcha dropdown'larni yopadi
	const carBrandSelectHandler = useCallback(
		async (value: any) => {
			try {
				setSearchFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						brandList: [value],
					},
				});
				disableAllStateHandler();
			} catch (err: any) {
				console.log('ERROR, carBrandSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Fuel type" tugmalaridan biri bosilganda: tanlangan yoqilg'i ro'yxatda bo'lsa olib tashlaydi (toggle), bo'lmasa qo'shadi;
	// "Any" bosilsa butun fuelTypeList filtrini o'chiradi
	const carFuelSelectHandler = useCallback(
		async (fuel: CarFuelType | 'ANY') => {
			try {
				if (fuel !== 'ANY') {
					if (searchFilter?.search?.fuelTypeList?.includes(fuel)) {
						setSearchFilter({
							...searchFilter,
							search: {
								...searchFilter.search,
								fuelTypeList: searchFilter?.search?.fuelTypeList?.filter((item: CarFuelType) => item !== fuel),
							},
						});
					} else {
						setSearchFilter({
							...searchFilter,
							search: { ...searchFilter.search, fuelTypeList: [...(searchFilter?.search?.fuelTypeList || []), fuel] },
						});
					}
				} else {
					delete searchFilter?.search.fuelTypeList;
					setSearchFilter({ ...searchFilter });
				}

				console.log('carFuelSelectHandler:', fuel);
			} catch (err: any) {
				console.log('ERROR, carFuelSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Options" (Barter/Credit) select'i o'zgarganda: "all" tanlansa filtrni o'chiradi, aks holda shu optionni yozadi
	const carOptionSelectHandler = useCallback(
		async (e: any) => {
			try {
				const value = e.target.value;
				setOptionCheck(value);

				if (value !== 'all') {
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
							options: [value],
						},
					});
				} else {
					delete searchFilter.search.options;
					setSearchFilter({
						...searchFilter,
						search: {
							...searchFilter.search,
						},
					});
				}
			} catch (err: any) {
				console.log('ERROR, carOptionSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Mileage" boshlanish/tugash select'lari o'zgarganda: mileageRange.start yoki .end qiymatini yangilaydi
	const carMileageHandler = useCallback(
		async (e: any, type: 'start' | 'end') => {
			const value = parseInt(e.target.value);
			const current = searchFilter.search.mileageRange ?? { start: 0, end: carMileages[carMileages.length - 1] };
			setSearchFilter({
				...searchFilter,
				search: {
					...searchFilter.search,
					mileageRange: { ...current, [type]: value },
				},
			});
		},
		[searchFilter],
	);

	// "Year" boshlanish yili o'zgarganda: yearCheck va searchFilter.search.yearsRange.start'ni yangilaydi
	const yearStartChangeHandler = async (event: any) => {
		setYearCheck({ ...yearCheck, start: Number(event.target.value) });

		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				yearsRange: { start: Number(event.target.value), end: yearCheck.end },
			},
		});
	};

	// "Year" tugash yili o'zgarganda: yearCheck va searchFilter.search.yearsRange.end'ni yangilaydi
	const yearEndChangeHandler = async (event: any) => {
		setYearCheck({ ...yearCheck, end: Number(event.target.value) });

		setSearchFilter({
			...searchFilter,
			search: {
				...searchFilter.search,
				yearsRange: { start: yearCheck.start, end: Number(event.target.value) },
			},
		});
	};

	// "Reset all filters" bosilganda: filtrni boshlang'ich holatiga qaytaradi
	const resetFilterHandler = () => {
		setSearchFilter(initialInput);
		setOptionCheck('all');
		setYearCheck({ start: 1990, end: thisYear + 1 });
	};

	// "Search" tugmasi bosilganda: bo'sh massiv bo'lgan filtrlarni tozalab, /car sahifasiga
	// qidiruv shartlarini URL query (?input=...) sifatida qo'shib o'tadi
	const pushSearchHandler = async () => {
		try {
			if (searchFilter?.search?.locationList?.length == 0) {
				delete searchFilter.search.locationList;
			}

			if (searchFilter?.search?.typeList?.length == 0) {
				delete searchFilter.search.typeList;
			}

			if (searchFilter?.search?.brandList?.length == 0) {
				delete searchFilter.search.brandList;
			}

			if (searchFilter?.search?.options?.length == 0) {
				delete searchFilter.search.options;
			}

			if (searchFilter?.search?.fuelTypeList?.length == 0) {
				delete searchFilter.search.fuelTypeList;
			}

			await router.push(
				`/car?input=${JSON.stringify(searchFilter)}`, // ko'rsatiladigan URL
				`/car?input=${JSON.stringify(searchFilter)}`, // haqiqiy navigatsiya manzili
			);
		} catch (err: any) {
			console.log('ERROR, pushSearchHandler:', err);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		return (
			<>
				<Stack className={'search-box'}>
					<Stack className={'select-box'}>
						<Box component={'div'} className={`box ${openLocation ? 'on' : ''}`} onClick={locationStateChangeHandler}>
							<span>{searchFilter?.search?.locationList ? searchFilter?.search?.locationList[0] : t('Location')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openType ? 'on' : ''}`} onClick={typeStateChangeHandler}>
							<span> {searchFilter?.search?.typeList ? searchFilter?.search?.typeList[0] : t('Car type')} </span>
							<ExpandMoreIcon />
						</Box>
						<Box className={`box ${openBrand ? 'on' : ''}`} onClick={brandStateChangeHandler}>
							<span>
								{searchFilter?.search?.brandList ? searchFilter?.search?.brandList[0] : t('Brand')}
							</span>
							<ExpandMoreIcon />
						</Box>
					</Stack>
					<Stack className={'search-box-other'}>
						<Box className={'advanced-filter'} onClick={() => advancedFilterHandler(true)}>
							<img src="/img/icons/tune.svg" alt="" />
							<span>{t('Advanced')}</span>
						</Box>
						<Box className={'search-btn'} onClick={pushSearchHandler}>
							<img src="/img/icons/search_white.svg" alt="" />
							<span>{t('Search cars')}</span>
						</Box>
					</Stack>

					{/*MENU */}
					<div className={`filter-location ${openLocation ? 'on' : ''}`} ref={locationRef}>
						{carLocation.map((location: string) => {
							return (
								<div onClick={() => carLocationSelectHandler(location)} key={location}>
									<img src={`img/banner/cities/${location}.webp`} alt="" />
									<span>{location}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-type ${openType ? 'on' : ''}`} ref={typeRef}>
						{carType.map((type: string) => {
							return (
								<div
									style={{
										// rasm bo'lsa ko'rsatadi (public/img/banner/types/sedan.webp ...), bo'lmasa gradient fon qoladi
										backgroundImage: `url(/img/banner/types/${type.toLowerCase()}.webp), linear-gradient(135deg, #EEF1F7 0%, #DCE3F0 100%)`,
										backgroundSize: 'cover',
										backgroundPosition: 'center',
									}}
									onClick={() => carTypeSelectHandler(type)}
									key={type}
								>
									<span>{type}</span>
								</div>
							);
						})}
					</div>

					<div className={`filter-rooms ${openBrand ? 'on' : ''}`} ref={brandRef}>
						{carBrand.map((brand: string) => {
							return (
								<span onClick={() => carBrandSelectHandler(brand)} key={brand}>
									{brand}
								</span>
							);
						})}
					</div>
				</Stack>

				{/* ADVANCED FILTER MODAL */}
				<Modal
					open={openAdvancedFilter}
					onClose={() => advancedFilterHandler(false)}
					aria-labelledby="modal-modal-title"
					aria-describedby="modal-modal-description"
				>
					{/* @ts-ignore */}
					<Box sx={style}>
						<Box className={'advanced-filter-modal'}>
							<div className={'close'} onClick={() => advancedFilterHandler(false)}>
								<CloseIcon />
							</div>
							<div className={'top'}>
								<span>Find your car</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" />
									<input
										value={searchFilter?.search?.text ?? ''}
										type="text"
										placeholder={'What are you looking for?'}
										onChange={(e: any) => {
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: e.target.value },
											});
										}}
									/>
								</div>
							</div>
							<Divider sx={{ mt: '30px', mb: '35px' }} />
							<div className={'middle'}>
								<div className={'row-box'}>
									<div className={'box'}>
										<span>fuel type</span>
										<div className={'inside'}>
											<div
												className={`room ${!searchFilter?.search?.fuelTypeList ? 'active' : ''}`}
												onClick={() => carFuelSelectHandler('ANY')}
											>
												Any
											</div>
											{carFuelType.map((fuel: CarFuelType) => (
												<div
													className={`room ${searchFilter?.search?.fuelTypeList?.includes(fuel) ? 'active' : ''}`}
													onClick={() => carFuelSelectHandler(fuel)}
													key={fuel}
												>
													{fuel}
												</div>
											))}
										</div>
									</div>
									<div className={'box'}>
										<span>options</span>
										<div className={'inside'}>
											<FormControl>
												<Select
													value={optionCheck}
													onChange={carOptionSelectHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
												>
													<MenuItem value={'all'}>All Options</MenuItem>
													<MenuItem value={'carBarter'}>Barter</MenuItem>
													<MenuItem value={'carCredit'}>Credit</MenuItem>
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
								<div className={'row-box'} style={{ marginTop: '44px' }}>
									<div className={'box'}>
										<span>Year</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={yearCheck.start.toString()}
													onChange={yearStartChangeHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{carYears?.slice(0)?.map((year: number) => (
														<MenuItem value={year} disabled={yearCheck.end <= year} key={year}>
															{year}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={yearCheck.end.toString()}
													onChange={yearEndChangeHandler}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{carYears
														?.slice(0)
														.reverse()
														.map((year: number) => (
															<MenuItem value={year} disabled={yearCheck.start >= year} key={year}>
																{year}
															</MenuItem>
														))}
												</Select>
											</FormControl>
										</div>
									</div>
									<div className={'box'}>
										<span>mileage (km)</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.mileageRange?.start ?? 0}
													onChange={(e: any) => carMileageHandler(e, 'start')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{carMileages.map((mileage: number) => (
														<MenuItem
															value={mileage}
															disabled={(searchFilter?.search?.mileageRange?.end ?? Infinity) < mileage}
															key={mileage}
														>
															{mileage.toLocaleString()}
														</MenuItem>
													))}
												</Select>
											</FormControl>
											<div className={'minus-line'}></div>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.mileageRange?.end ?? carMileages[carMileages.length - 1]}
													onChange={(e: any) => carMileageHandler(e, 'end')}
													displayEmpty
													inputProps={{ 'aria-label': 'Without label' }}
													MenuProps={MenuProps}
												>
													{carMileages.map((mileage: number) => (
														<MenuItem
															value={mileage}
															disabled={(searchFilter?.search?.mileageRange?.start ?? 0) > mileage}
															key={mileage}
														>
															{mileage.toLocaleString()}
														</MenuItem>
													))}
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
							</div>
							<Divider sx={{ mt: '60px', mb: '18px' }} />
							<div className={'bottom'}>
								<div onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" />
									<span>Reset all filters</span>
								</div>
								<Button
									startIcon={<img src={'/img/icons/search.svg'} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									Search
								</Button>
							</div>
						</Box>
					</Box>
				</Modal>
			</>
		);
	}
};

HeaderFilter.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			pricesRange: {
				start: 0,
				end: 1000000000,
			},
		},
	},
};

export default HeaderFilter;
