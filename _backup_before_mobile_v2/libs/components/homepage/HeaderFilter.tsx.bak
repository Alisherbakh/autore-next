import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Stack, Box, Modal, Divider, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { carMileages, carYears, REACT_APP_API_URL } from '../../config';
import { GET_CARS } from '../../../apollo/user/query';
import { formatEnum, formatterStr } from '../../utils';
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


// "natija yo'q" holatida taklif qilinadigan brendlar
const SUGGESTED_BRANDS = ['HYUNDAI', 'KIA', 'GENESIS', 'KGM'];

interface HeaderFilterProps {
	initialInput: CarsInquiry;
}

const HeaderFilter = (props: HeaderFilterProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
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
	// matnli qidiruv (model nomi): fokusda kengayadi, yozilganda jonli natijalar ochiladi
	const [searchFocused, setSearchFocused] = useState(false);
	const [resultsOpen, setResultsOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [debouncedText, setDebouncedText] = useState('');
	// oxirgi harakat klaviaturadanmi yoki sichqonchadanmi — klaviatura harakatlari animatsiyasiz bo'ladi
	const [inputKind, setInputKind] = useState<'pointer' | 'keyboard'>('pointer');
	const queryWrapRef = useRef<HTMLDivElement>(null);
	const queryInputRef = useRef<HTMLInputElement>(null);
	const locationTriggerRef = useRef<HTMLButtonElement>(null);
	const typeTriggerRef = useRef<HTMLButtonElement>(null);
	const brandTriggerRef = useRef<HTMLButtonElement>(null);
	const searchText = searchFilter?.search?.text ?? '';

	/** APOLLO REQUESTS **/
	// GET_CARS — apollo/user/query.ts dan; yozilgan model nomi bo'yicha 5 ta e'lonni oldindan ko'rsatadi
	const [getPreviewCars, { data: previewData, loading: previewLoading }] = useLazyQuery(GET_CARS, {
		fetchPolicy: 'cache-first',
	});
	const previewCars: any[] = debouncedText ? previewData?.getCars?.list ?? [] : [];
	const previewTotal: number = previewData?.getCars?.metaCounter?.[0]?.total ?? 0;

	/** LIFECYCLES **/
	// yozish to'xtagach (250ms) qidiradi — har bir harfda so'rov yubormaslik uchun
	useEffect(() => {
		const text = searchText.trim();
		if (text.length < 2) {
			setDebouncedText('');
			return;
		}
		const timer = setTimeout(() => {
			setDebouncedText(text);
			getPreviewCars({
				variables: { input: { page: 1, limit: 5, sort: 'carViews', direction: 'DESC', search: { text } } },
			});
		}, 250);
		return () => clearTimeout(timer);
	}, [searchText]);

	// natijalar o'zgarganda tanlangan qator boshiga qaytadi
	useEffect(() => {
		setActiveIndex(-1);
	}, [debouncedText]);

	// Esc: ochiq panel yoki natijalarni yopadi va fokusni o'z tugmasiga qaytaradi (animatsiyasiz)
	useEffect(() => {
		const keyHandler = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			setInputKind('keyboard');
			if (openLocation) {
				setOpenLocation(false);
				locationTriggerRef.current?.focus();
			} else if (openType) {
				setOpenType(false);
				typeTriggerRef.current?.focus();
			} else if (openBrand) {
				setOpenBrand(false);
				brandTriggerRef.current?.focus();
			} else if (resultsOpen) {
				setResultsOpen(false);
			}
		};
		document.addEventListener('keydown', keyHandler);
		return () => document.removeEventListener('keydown', keyHandler);
	}, [openLocation, openType, openBrand, resultsOpen]);

	// natijalar paneli tashqarisiga bosilsa yopiladi
	useEffect(() => {
		const outsideHandler = (event: MouseEvent) => {
			if (!queryWrapRef.current?.contains(event.target as Node)) setResultsOpen(false);
		};
		document.addEventListener('mousedown', outsideHandler);
		return () => document.removeEventListener('mousedown', outsideHandler);
	}, []);
	// sahifaning istalgan joyiga bosilganda ishga tushadi: agar bosilgan joy location/type/brand
	// dropdown'larining ichida bo'lmasa, o'sha dropdown'ni yopadi (tashqariga bosilsa menyu yopilishi uchun)
	useEffect(() => {
		const clickHandler = (event: MouseEvent) => {
			const target = event.target as Node;
			// tugmaning o'zi bosilganda yopmaymiz — aks holda u darhol qayta ochilib qoladi
			if (!locationRef?.current?.contains(target) && !locationTriggerRef.current?.contains(target)) {
				setOpenLocation(false);
			}

			if (!typeRef?.current?.contains(target) && !typeTriggerRef.current?.contains(target)) {
				setOpenType(false);
			}

			if (!brandRef?.current?.contains(target) && !brandTriggerRef.current?.contains(target)) {
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

	// matnli qidiruv maydoni o'zgarganda: searchFilter.search.text'ga yozadi (Advanced oynasidagi maydon bilan bir xil holat)
	const searchTextChangeHandler = (value: string) => {
		setSearchFilter({ ...searchFilter, search: { ...searchFilter.search, text: value } });
		setResultsOpen(value.trim().length >= 2);
	};

	// natijalar ichida ↑/↓ bilan yurish, Enter — tanlangan e'lonni yoki umumiy qidiruvni ochadi
	const searchKeyDownHandler = async (event: React.KeyboardEvent<HTMLInputElement>) => {
		setInputKind('keyboard');
		const count = previewCars.length;
		if (event.key === 'ArrowDown' && count) {
			event.preventDefault();
			setResultsOpen(true);
			setActiveIndex((prev) => (prev + 1) % count);
		} else if (event.key === 'ArrowUp' && count) {
			event.preventDefault();
			setActiveIndex((prev) => (prev <= 0 ? count - 1 : prev - 1));
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (resultsOpen && activeIndex >= 0 && previewCars[activeIndex]) {
				await router.push({ pathname: '/car/detail', query: { id: previewCars[activeIndex]._id } });
			} else {
				await pushSearchHandler();
			}
		}
	};

	// "natija yo'q" holatidagi brend tugmasi: matnni tozalab, brend filtrini qo'yadi
	const suggestedBrandHandler = (brand: string) => {
		setSearchFilter({
			...searchFilter,
			search: { ...searchFilter.search, text: '', brandList: [brand as CarBrand] },
		});
		setResultsOpen(false);
	};

	// panelni klaviatura bilan ochganda fokus birinchi variantga o'tadi
	const focusFirstOption = (panel: any) => {
		requestAnimationFrame(() => panel?.current?.querySelector('button')?.focus());
	};

	const triggerKeyDown = (event: React.KeyboardEvent, panel: any) => {
		if (event.key === 'Enter' || event.key === ' ') {
			setInputKind('keyboard');
			focusFirstOption(panel);
		}
	};

	if (device === 'mobile') {
		return <div>HEADER FILTER MOBILE</div>;
	} else {
		const selectedLocation = searchFilter?.search?.locationList?.[0];
		const selectedType = searchFilter?.search?.typeList?.[0];
		const selectedBrand = searchFilter?.search?.brandList?.[0];
		const showResults = resultsOpen && searchText.trim().length >= 2;

		return (
			<>
				<div
					className={`sf-bar ${searchFocused ? 'is-searching' : ''}`}
					data-input={inputKind}
					onPointerDown={() => setInputKind('pointer')}
				>
					{/* model nomi bo'yicha matnli qidiruv: fokusda butun maydonlar ustiga kengayadi */}
					<div className={'sf-query'} ref={queryWrapRef}>
						<label className={'sf-query-field'}>
							<img src="/img/icons/search.svg" alt="" width={18} height={18} />
							<input
								ref={queryInputRef}
								name={'text'}
								type={'search'}
								autoComplete={'off'}
								spellCheck={false}
								role={'combobox'}
								aria-label={t('Search a model')}
								aria-expanded={showResults}
								aria-controls={'sf-results'}
								aria-autocomplete={'list'}
								aria-activedescendant={activeIndex >= 0 ? `sf-result-${activeIndex}` : undefined}
								placeholder={t('Search a model, e.g. Sonata…')}
								value={searchText}
								onFocus={() => {
									setSearchFocused(true);
									disableAllStateHandler();
									if (searchText.trim().length >= 2) setResultsOpen(true);
								}}
								onBlur={(e) => {
									setSearchFocused(false);
									// fokus natijalar paneli tashqarisiga chiqsa (masalan Tab bilan) natijalar yopiladi
									if (!queryWrapRef.current?.contains(e.relatedTarget as Node)) setResultsOpen(false);
								}}
								onChange={(e) => searchTextChangeHandler(e.target.value)}
								onKeyDown={searchKeyDownHandler}
							/>
						</label>

						{/* jonli natijalar */}
						<div id={'sf-results'} className={`sf-results ${showResults ? 'on' : ''}`} role={'listbox'}>
							{previewLoading && !previewCars.length ? (
								<div className={'sf-results-skeleton'} aria-hidden="true">
									<span />
									<span />
									<span />
								</div>
							) : previewCars.length ? (
								<>
									{previewCars.map((car: any, index: number) => (
										<button
											type={'button'}
											role={'option'}
											id={`sf-result-${index}`}
											aria-selected={activeIndex === index}
											className={`sf-result ${activeIndex === index ? 'active' : ''}`}
											style={{ '--i': index } as React.CSSProperties}
											key={car._id}
											onMouseDown={(e) => e.preventDefault()}
											onMouseEnter={() => setActiveIndex(index)}
											onClick={() => router.push({ pathname: '/car/detail', query: { id: car._id } })}
										>
											<img
												src={car.carImages?.[0] ? `${REACT_APP_API_URL}/${car.carImages[0]}` : '/img/types/sedan.jpg'}
												alt=""
												width={64}
												height={44}
												loading={'lazy'}
											/>
											<span className={'sf-result-text'}>
												<strong>{car.carTitle}</strong>
												<small>
													{car.carYear}, {car.carMileage?.toLocaleString()} km
												</small>
											</span>
											<span className={'sf-result-price'}>₩{formatterStr(car.carPrice)}</span>
										</button>
									))}
									<button
										type={'button'}
										className={'sf-results-all'}
										onMouseDown={(e) => e.preventDefault()}
										onClick={pushSearchHandler}
									>
										{t('See all {{count}} cars', { count: previewTotal })}
									</button>
								</>
							) : debouncedText ? (
								<div className={'sf-results-empty'}>
									<p>{t('No cars match “{{query}}”. Try a brand instead:', { query: debouncedText })}</p>
									<div>
										{SUGGESTED_BRANDS.map((brand) => (
											<button
												type={'button'}
												key={brand}
												onMouseDown={(e) => e.preventDefault()}
												onClick={() => suggestedBrandHandler(brand)}
											>
												{formatEnum(brand)}
											</button>
										))}
									</div>
								</div>
							) : null}
						</div>
						<span className={'sf-sr-only'} aria-live={'polite'}>
							{showResults && debouncedText && !previewLoading
								? t('{{count}} cars found', { count: previewTotal })
								: ''}
						</span>
					</div>

					<button
						type={'button'}
						ref={locationTriggerRef}
						className={`sf-field sf-field-1 ${openLocation ? 'on' : ''}`}
						aria-haspopup={'listbox'}
						aria-expanded={openLocation}
						aria-controls={'sf-location'}
						onClick={locationStateChangeHandler}
						onKeyDown={(e) => triggerKeyDown(e, locationRef)}
					>
						<small>{t('Location')}</small>
						<span>{selectedLocation ? formatEnum(selectedLocation) : t('Any city')}</span>
						<ExpandMoreIcon aria-hidden="true" />
					</button>
					<button
						type={'button'}
						ref={typeTriggerRef}
						className={`sf-field sf-field-2 ${openType ? 'on' : ''}`}
						aria-haspopup={'listbox'}
						aria-expanded={openType}
						aria-controls={'sf-type'}
						onClick={typeStateChangeHandler}
						onKeyDown={(e) => triggerKeyDown(e, typeRef)}
					>
						<small>{t('Car type')}</small>
						<span>{selectedType ? formatEnum(selectedType) : t('Any type')}</span>
						<ExpandMoreIcon aria-hidden="true" />
					</button>
					<button
						type={'button'}
						ref={brandTriggerRef}
						className={`sf-field sf-field-3 ${openBrand ? 'on' : ''}`}
						aria-haspopup={'listbox'}
						aria-expanded={openBrand}
						aria-controls={'sf-brand'}
						onClick={brandStateChangeHandler}
						onKeyDown={(e) => triggerKeyDown(e, brandRef)}
					>
						<small>{t('Brand')}</small>
						<span>{selectedBrand ? formatEnum(selectedBrand) : t('Any brand')}</span>
						<ExpandMoreIcon aria-hidden="true" />
					</button>

					<button type={'button'} className={'sf-advanced'} onClick={() => advancedFilterHandler(true)}>
						<img src="/img/icons/tune.svg" alt="" width={20} height={20} />
						<span>{t('Advanced')}</span>
					</button>
					<button type={'button'} className={'sf-search'} onClick={pushSearchHandler}>
						<img src="/img/icons/search_white.svg" alt="" width={20} height={20} />
						<span>{t('Search cars')}</span>
					</button>

					{/* PANELLAR */}
					<div
						id={'sf-location'}
						className={`sf-panel sf-panel-location ${openLocation ? 'on' : ''}`}
						ref={locationRef}
						role={'listbox'}
						aria-label={t('Location')}
					>
						{carLocation.map((location: string) => (
							<button
								type={'button'}
								role={'option'}
								aria-selected={selectedLocation === location}
								className={`sf-city ${selectedLocation === location ? 'active' : ''}`}
								onClick={() => carLocationSelectHandler(location)}
								key={location}
							>
								<img src={`/img/banner/cities/${location}.webp`} alt="" width={96} height={64} loading={'lazy'} />
								<span>{formatEnum(location)}</span>
							</button>
						))}
					</div>

					<div
						id={'sf-type'}
						className={`sf-panel sf-panel-type ${openType ? 'on' : ''}`}
						ref={typeRef}
						role={'listbox'}
						aria-label={t('Car type')}
					>
						{carType.map((type: string) => (
							<button
								type={'button'}
								role={'option'}
								aria-selected={selectedType === type}
								className={`sf-type ${selectedType === type ? 'active' : ''}`}
								onClick={() => carTypeSelectHandler(type)}
								key={type}
							>
								<img src={`/img/types/${type.toLowerCase()}.jpg`} alt="" width={200} height={125} loading={'lazy'} />
								<span>{formatEnum(type)}</span>
							</button>
						))}
					</div>

					<div
						id={'sf-brand'}
						className={`sf-panel sf-panel-brand ${openBrand ? 'on' : ''}`}
						ref={brandRef}
						role={'listbox'}
						aria-label={t('Brand')}
					>
						{carBrand.map((brand: string) => (
							<button
								type={'button'}
								role={'option'}
								aria-selected={selectedBrand === brand}
								className={`sf-brand ${selectedBrand === brand ? 'active' : ''}`}
								onClick={() => carBrandSelectHandler(brand)}
								key={brand}
							>
								{formatEnum(brand)}
							</button>
						))}
					</div>
				</div>

				{/* ADVANCED FILTER MODAL */}
				<Modal open={openAdvancedFilter} onClose={() => advancedFilterHandler(false)} aria-labelledby="sf-advanced-title">
					{/* @ts-ignore */}
					<Box sx={style}>
						<Box className={'advanced-filter-modal'}>
							<button
								type={'button'}
								className={'close'}
								aria-label={t('Close')}
								onClick={() => advancedFilterHandler(false)}
							>
								<CloseIcon aria-hidden="true" />
							</button>
							<div className={'top'}>
								<span id={'sf-advanced-title'}>{t('Find your car')}</span>
								<div className={'search-input-box'}>
									<img src="/img/icons/search.svg" alt="" width={17} height={17} />
									<input
										name={'text'}
										value={searchText}
										type="search"
										autoComplete={'off'}
										aria-label={t('Search a model')}
										placeholder={t('What are you looking for…')}
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
									<div className={'box box-wide'}>
										<span>{t('Fuel type')}</span>
										<div className={'inside fuel-chips'} role={'group'} aria-label={t('Fuel type')}>
											<button
												type={'button'}
												aria-pressed={!searchFilter?.search?.fuelTypeList}
												className={`fuel-chip ${!searchFilter?.search?.fuelTypeList ? 'active' : ''}`}
												onClick={() => carFuelSelectHandler('ANY')}
											>
												{t('Any')}
											</button>
											{carFuelType.map((fuel: CarFuelType) => (
												<button
													type={'button'}
													aria-pressed={!!searchFilter?.search?.fuelTypeList?.includes(fuel)}
													className={`fuel-chip ${searchFilter?.search?.fuelTypeList?.includes(fuel) ? 'active' : ''}`}
													onClick={() => carFuelSelectHandler(fuel)}
													key={fuel}
												>
													{formatEnum(fuel)}
												</button>
											))}
										</div>
									</div>
								</div>
								<div className={'row-box'} style={{ marginTop: '32px' }}>
									<div className={'box'}>
										<span>{t('Options')}</span>
										<div className={'inside'}>
											<FormControl fullWidth>
												<Select
													value={optionCheck}
													onChange={carOptionSelectHandler}
													displayEmpty
													inputProps={{ 'aria-label': t('Options') }}
												>
													<MenuItem value={'all'}>{t('All options')}</MenuItem>
													<MenuItem value={'carBarter'}>{t('Barter')}</MenuItem>
													<MenuItem value={'carCredit'}>{t('Credit')}</MenuItem>
												</Select>
											</FormControl>
										</div>
									</div>
								</div>
								<div className={'row-box'} style={{ marginTop: '32px' }}>
									<div className={'box'}>
										<span>{t('Year')}</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={yearCheck.start.toString()}
													onChange={yearStartChangeHandler}
													displayEmpty
													inputProps={{ 'aria-label': t('Year from') }}
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
													inputProps={{ 'aria-label': t('Year to') }}
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
										<span>{t('Mileage (km)')}</span>
										<div className={'inside space-between align-center'}>
											<FormControl sx={{ width: '122px' }}>
												<Select
													value={searchFilter?.search?.mileageRange?.start ?? 0}
													onChange={(e: any) => carMileageHandler(e, 'start')}
													displayEmpty
													inputProps={{ 'aria-label': t('Mileage from') }}
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
													inputProps={{ 'aria-label': t('Mileage to') }}
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
							<Divider sx={{ mt: '40px', mb: '18px' }} />
							<div className={'bottom'}>
								<button type={'button'} className={'reset'} onClick={resetFilterHandler}>
									<img src="/img/icons/reset.svg" alt="" width={15} height={15} />
									<span>{t('Reset all filters')}</span>
								</button>
								<Button
									startIcon={<img src={'/img/icons/search_white.svg'} alt="" width={18} height={18} />}
									className={'search-btn'}
									onClick={pushSearchHandler}
								>
									{t('Search cars')}
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
