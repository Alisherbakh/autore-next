import React, { useCallback, useEffect, useState } from 'react';
import {
	Stack,
	Typography,
	Checkbox,
	OutlinedInput,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { CarBrand, CarFuelType, CarLocation, CarTransmission, CarType } from '../../enums/car.enum';
import { CarsInquiry } from '../../types/car/car.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { carMileages, carYears } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useTranslation } from 'next-i18next';
import { formatEnum } from '../../utils';


const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: '200px',
		},
	},
};

interface FilterType {
	searchFilter: CarsInquiry;
	setSearchFilter: any;
	initialInput: CarsInquiry;
}

// checkbox ro'yxati bilan ishlaydigan filtr maydonlari
type ListKey = 'locationList' | 'typeList' | 'brandList' | 'fuelTypeList' | 'transmissionList' | 'options';
// oraliq (min/max) bilan ishlaydigan filtr maydonlari
type RangeKey = 'pricesRange' | 'yearsRange' | 'mileageRange';

const Filter = (props: FilterType) => {
	const { searchFilter, setSearchFilter, initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [carLocation, setCarLocation] = useState<CarLocation[]>(Object.values(CarLocation));
	const [carType, setCarType] = useState<CarType[]>(Object.values(CarType));
	const [carBrand, setCarBrand] = useState<CarBrand[]>(Object.values(CarBrand));
	const [carFuelType, setCarFuelType] = useState<CarFuelType[]>(Object.values(CarFuelType));
	const [carTransmission, setCarTransmission] = useState<CarTransmission[]>(Object.values(CarTransmission));
	const [searchText, setSearchText] = useState<string>('');
	const [showMore, setShowMore] = useState<boolean>(false);
	const [showMoreBrand, setShowMoreBrand] = useState<boolean>(false);

	/** HELPERS **/
	// yangi filtrni URL'ga (?input=...) yozadi — sahifa (pages/car/index.tsx) URL'dan o'qib, qayta so'rov yuboradi
	const pushFilter = async (filter: CarsInquiry) => {
		const url = `/car?input=${JSON.stringify(filter)}`;
		await router.push(url, url, { scroll: false });
	};

	/** LIFECYCLES **/
	// biror filtr ro'yxati bo'shab qolsa (oxirgi checkbox o'chirilgan bo'lsa), o'sha maydonni filtrdan butunlay o'chiradi
	useEffect(() => {
		const listKeys: ListKey[] = ['locationList', 'typeList', 'brandList', 'fuelTypeList', 'transmissionList', 'options'];
		let changed = false;
		listKeys.forEach((key) => {
			if (searchFilter?.search?.[key]?.length == 0) {
				delete searchFilter.search[key];
				changed = true;
			}
		});
		if (changed) {
			if (!searchFilter?.search?.locationList) setShowMore(false);
			pushFilter({ ...searchFilter, search: { ...searchFilter.search } }).then();
		}

		if (searchFilter?.search?.locationList) setShowMore(true);
		if (searchFilter?.search?.brandList) setShowMoreBrand(true);
	}, [searchFilter]);

	/** HANDLERS **/
	// checkbox bosilganda: belgilansa ro'yxatga qo'shadi, belgi olib tashlansa ro'yxatdan chiqaradi va URL'ni yangilaydi
	const listSelectHandler = useCallback(
		async (e: any, key: ListKey) => {
			try {
				const isChecked = e.target.checked;
				const value = e.target.value;
				const current: string[] = (searchFilter?.search?.[key] as string[]) || [];

				if (isChecked) {
					await pushFilter({ ...searchFilter, search: { ...searchFilter.search, [key]: [...current, value] } });
				} else if (current.includes(value)) {
					await pushFilter({
						...searchFilter,
						search: { ...searchFilter.search, [key]: current.filter((item: string) => item !== value) },
					});
				}
				console.log(`listSelectHandler(${key}):`, value);
			} catch (err: any) {
				console.log('ERROR, listSelectHandler:', err);
			}
		},
		[searchFilter],
	);

	// min/max qiymat o'zgarganda: tanlangan oraliqning start yoki end qiymatini URL orqali yangilaydi
	const rangeHandler = useCallback(
		async (value: number, key: RangeKey, type: 'start' | 'end') => {
			try {
				// backend start va end ikkalasini ham talab qiladi: faqat bittasi tanlansa, ikkinchisi default chegara bilan to'ldiriladi
				const defaults: Record<RangeKey, { start: number; end: number }> = {
					pricesRange: initialInput.search.pricesRange ?? { start: 0, end: 1000000000 },
					yearsRange: { start: Number(carYears[0]), end: Number(carYears[carYears.length - 1]) },
					mileageRange: { start: carMileages[0], end: carMileages[carMileages.length - 1] },
				};
				await pushFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						[key]: { ...defaults[key], ...searchFilter.search[key], [type]: Number(value) },
					},
				});
			} catch (err: any) {
				console.log('ERROR, rangeHandler:', err);
			}
		},
		[searchFilter],
	);

	// "Reset" tugmasi bosilganda: qidiruv matnini tozalaydi va barcha filtrlarni boshlang'ich holatiga (initialInput) qaytaradi
	const refreshHandler = async () => {
		try {
			setSearchText('');
			await pushFilter(initialInput);
		} catch (err: any) {
			console.log('ERROR, refreshHandler:', err);
		}
	};

	// bitta checkbox qatori (Location, Type, Brand, Fuel, Transmission uchun umumiy)
	const renderCheckbox = (value: string, key: ListKey, label?: string) => {
		const checked = ((searchFilter?.search?.[key] as string[]) || []).includes(value);
		return (
			<Stack className={`input-box ${checked ? 'is-checked' : ''}`} key={value}>
				<Checkbox
					id={`${key}-${value}`}
					className="car-checkbox"
					color="default"
					size="small"
					value={value}
					checked={checked}
					onChange={(e: any) => listSelectHandler(e, key)}
				/>
				<label htmlFor={`${key}-${value}`} style={{ cursor: 'pointer' }}>
					<Typography className="car-type">{label ? t(label) : formatEnum(value)}</Typography>
				</label>
			</Stack>
		);
	};

	// mobil va desktop'da bir xil filtr (mobilda sahifa uni pastdan ochiladigan oynada ko'rsatadi)
	return (
		<Stack className={'filter-main cl-filter'}>
			<div className={'cl-filter-head'}>
				<Typography className={'title-main'}>{t('Find your car')}</Typography>
				<button type="button" className={'cl-reset'} onClick={refreshHandler}>
					<RefreshIcon />
					{t('Reset all')}
				</button>
			</div>

			<div className={'cl-search'}>
				<SearchRoundedIcon className={'cl-search-icon'} />
				<OutlinedInput
					value={searchText}
					type={'text'}
					className={'search-input'}
					placeholder={t('Model, brand or keyword')}
					onChange={(e: any) => setSearchText(e.target.value)}
					onKeyDown={(event: any) => {
						if (event.key == 'Enter') {
							setSearchFilter({
								...searchFilter,
								search: { ...searchFilter.search, text: searchText },
							});
						}
					}}
					endAdornment={
						searchText ? (
							<CancelRoundedIcon
								className={'cl-clear'}
								onClick={() => {
									setSearchText('');
									setSearchFilter({
										...searchFilter,
										search: { ...searchFilter.search, text: '' },
									});
								}}
							/>
						) : null
					}
				/>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Location')}</Typography>
				<Stack className={`car-location ${showMore ? 'is-open' : ''}`}>
					{carLocation.map((location: string) => renderCheckbox(location, 'locationList'))}
				</Stack>
				<button type="button" className={'cl-more'} onClick={() => setShowMore(!showMore)}>
					{showMore ? t('Show less') : t('Show all')}
					<KeyboardArrowDownRoundedIcon className={showMore ? 'is-up' : ''} />
				</button>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Brand')}</Typography>
				<Stack className={`car-location ${showMoreBrand ? 'is-open' : ''}`}>
					{carBrand.map((brand: string) => renderCheckbox(brand, 'brandList'))}
				</Stack>
				<button type="button" className={'cl-more'} onClick={() => setShowMoreBrand(!showMoreBrand)}>
					{showMoreBrand ? t('Show less') : t('Show all')}
					<KeyboardArrowDownRoundedIcon className={showMoreBrand ? 'is-up' : ''} />
				</button>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Car Type')}</Typography>
				<div className={'cl-pills'}>{carType.map((type: string) => renderCheckbox(type, 'typeList'))}</div>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Fuel Type')}</Typography>
				<div className={'cl-pills'}>{carFuelType.map((fuel: string) => renderCheckbox(fuel, 'fuelTypeList'))}</div>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Transmission')}</Typography>
				<div className={'cl-pills'}>
					{carTransmission.map((item: string) => renderCheckbox(item, 'transmissionList'))}
				</div>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Options')}</Typography>
				<div className={'cl-pills'}>
					{renderCheckbox('carBarter', 'options', 'Barter')}
					{renderCheckbox('carCredit', 'options', 'Credit')}
				</div>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Year')}</Typography>
				<Stack className="range-input">
					<FormControl size="small">
						<InputLabel id="year-start-label">{t('Min')}</InputLabel>
						<Select
							labelId="year-start-label"
							value={searchFilter?.search?.yearsRange?.start ?? ''}
							label={t('Min')}
							onChange={(e: any) => rangeHandler(e.target.value, 'yearsRange', 'start')}
							MenuProps={MenuProps}
						>
							{carYears.map((year: string) => (
								<MenuItem
									value={Number(year)}
									disabled={Number(year) > (searchFilter?.search?.yearsRange?.end ?? Infinity)}
									key={year}
								>
									{year}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<div className="central-divider"></div>
					<FormControl size="small">
						<InputLabel id="year-end-label">{t('Max')}</InputLabel>
						<Select
							labelId="year-end-label"
							value={searchFilter?.search?.yearsRange?.end ?? ''}
							label={t('Max')}
							onChange={(e: any) => rangeHandler(e.target.value, 'yearsRange', 'end')}
							MenuProps={MenuProps}
						>
							{carYears.map((year: string) => (
								<MenuItem
									value={Number(year)}
									disabled={Number(year) < (searchFilter?.search?.yearsRange?.start ?? 0)}
									key={year}
								>
									{year}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Mileage (km)')}</Typography>
				<Stack className="range-input">
					<FormControl size="small">
						<InputLabel id="mileage-start-label">{t('Min')}</InputLabel>
						<Select
							labelId="mileage-start-label"
							value={searchFilter?.search?.mileageRange?.start ?? 0}
							label={t('Min')}
							onChange={(e: any) => rangeHandler(e.target.value, 'mileageRange', 'start')}
							MenuProps={MenuProps}
						>
							{carMileages.map((mileage: number) => (
								<MenuItem
									value={mileage}
									disabled={mileage > (searchFilter?.search?.mileageRange?.end ?? Infinity)}
									key={mileage}
								>
									{mileage.toLocaleString()}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<div className="central-divider"></div>
					<FormControl size="small">
						<InputLabel id="mileage-end-label">{t('Max')}</InputLabel>
						<Select
							labelId="mileage-end-label"
							value={searchFilter?.search?.mileageRange?.end ?? carMileages[carMileages.length - 1]}
							label={t('Max')}
							onChange={(e: any) => rangeHandler(e.target.value, 'mileageRange', 'end')}
							MenuProps={MenuProps}
						>
							{carMileages.map((mileage: number) => (
								<MenuItem
									value={mileage}
									disabled={mileage < (searchFilter?.search?.mileageRange?.start ?? 0)}
									key={mileage}
								>
									{mileage.toLocaleString()}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</div>

			<div className={'cl-section'}>
				<Typography className={'title'}>{t('Price Range (₩)')}</Typography>
				<Stack className="range-input">
					<label className={'cl-price'}>
						<span>₩</span>
						<input
							type="number"
							placeholder={t('Min')}
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									rangeHandler(e.target.value, 'pricesRange', 'start');
								}
							}}
						/>
					</label>
					<div className="central-divider"></div>
					<label className={'cl-price'}>
						<span>₩</span>
						<input
							type="number"
							placeholder={t('Max')}
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									rangeHandler(e.target.value, 'pricesRange', 'end');
								}
							}}
						/>
					</label>
				</Stack>
			</div>
		</Stack>
	);
};

export default Filter;
