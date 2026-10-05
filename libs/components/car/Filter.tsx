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
	Tooltip,
	IconButton,
} from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { CarBrand, CarFuelType, CarLocation, CarTransmission, CarType } from '../../enums/car.enum';
import { CarsInquiry } from '../../types/car/car.input';
import { useRouter } from 'next/router';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { carMileages, carYears } from '../../config';
import RefreshIcon from '@mui/icons-material/Refresh';

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
				await pushFilter({
					...searchFilter,
					search: {
						...searchFilter.search,
						[key]: { ...searchFilter.search[key], [type]: Number(value) },
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
	const renderCheckbox = (value: string, key: ListKey, label?: string) => (
		<Stack className={'input-box'} key={value}>
			<Checkbox
				id={`${key}-${value}`}
				className="car-checkbox"
				color="default"
				size="small"
				value={value}
				checked={((searchFilter?.search?.[key] as string[]) || []).includes(value)}
				onChange={(e: any) => listSelectHandler(e, key)}
			/>
			<label htmlFor={`${key}-${value}`} style={{ cursor: 'pointer' }}>
				<Typography className="car-type">{label ?? value}</Typography>
			</label>
		</Stack>
	);

	if (device === 'mobile') {
		return <div>CARS FILTER</div>;
	} else {
		return (
			<Stack className={'filter-main'}>
				<Stack className={'find-your-home'} mb={'40px'}>
					<Typography className={'title-main'}>Find Your Car</Typography>
					<Stack className={'input-box'}>
						<OutlinedInput
							value={searchText}
							type={'text'}
							className={'search-input'}
							placeholder={'What are you looking for?'}
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
								<>
									<CancelRoundedIcon
										onClick={() => {
											setSearchText('');
											setSearchFilter({
												...searchFilter,
												search: { ...searchFilter.search, text: '' },
											});
										}}
									/>
								</>
							}
						/>
						<img src={'/img/icons/search_icon.png'} alt={''} />
						<Tooltip title="Reset">
							<IconButton onClick={refreshHandler}>
								<RefreshIcon />
							</IconButton>
						</Tooltip>
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Location
					</p>
					<Stack
						className={`car-location`}
						style={{ height: showMore ? '253px' : '115px' }}
						onMouseEnter={() => setShowMore(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.locationList) {
								setShowMore(false);
							}
						}}
					>
						{carLocation.map((location: string) => renderCheckbox(location, 'locationList'))}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<p className={'title'} style={{ textShadow: '0px 3px 4px #b9b9b9' }}>
						Brand
					</p>
					<Stack
						className={`car-location`}
						style={{ height: showMoreBrand ? '360px' : '115px' }}
						onMouseEnter={() => setShowMoreBrand(true)}
						onMouseLeave={() => {
							if (!searchFilter?.search?.brandList) {
								setShowMoreBrand(false);
							}
						}}
					>
						{carBrand.map((brand: string) => renderCheckbox(brand, 'brandList'))}
					</Stack>
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Car Type</Typography>
					{carType.map((type: string) => renderCheckbox(type, 'typeList'))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Fuel Type</Typography>
					{carFuelType.map((fuel: string) => renderCheckbox(fuel, 'fuelTypeList'))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Transmission</Typography>
					{carTransmission.map((item: string) => renderCheckbox(item, 'transmissionList'))}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Options</Typography>
					{renderCheckbox('carBarter', 'options', 'Barter')}
					{renderCheckbox('carCredit', 'options', 'Credit')}
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Year</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="year-start-label">Min</InputLabel>
							<Select
								labelId="year-start-label"
								value={searchFilter?.search?.yearsRange?.start ?? ''}
								label="Min"
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
						<FormControl>
							<InputLabel id="year-end-label">Max</InputLabel>
							<Select
								labelId="year-end-label"
								value={searchFilter?.search?.yearsRange?.end ?? ''}
								label="Max"
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
				</Stack>
				<Stack className={'find-your-home'} mb={'30px'}>
					<Typography className={'title'}>Mileage (km)</Typography>
					<Stack className="square-year-input">
						<FormControl>
							<InputLabel id="mileage-start-label">Min</InputLabel>
							<Select
								labelId="mileage-start-label"
								value={searchFilter?.search?.mileageRange?.start ?? 0}
								label="Min"
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
						<FormControl>
							<InputLabel id="mileage-end-label">Max</InputLabel>
							<Select
								labelId="mileage-end-label"
								value={searchFilter?.search?.mileageRange?.end ?? carMileages[carMileages.length - 1]}
								label="Max"
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
				</Stack>
				<Stack className={'find-your-home'}>
					<Typography className={'title'}>Price Range (₩)</Typography>
					<Stack className="square-year-input">
						<input
							type="number"
							placeholder="₩ min"
							min={0}
							value={searchFilter?.search?.pricesRange?.start ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									rangeHandler(e.target.value, 'pricesRange', 'start');
								}
							}}
						/>
						<div className="central-divider"></div>
						<input
							type="number"
							placeholder="₩ max"
							value={searchFilter?.search?.pricesRange?.end ?? 0}
							onChange={(e: any) => {
								if (e.target.value >= 0) {
									rangeHandler(e.target.value, 'pricesRange', 'end');
								}
							}}
						/>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default Filter;
