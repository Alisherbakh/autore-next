import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import {
	CarBrand,
	CarCondition,
	CarFuelType,
	CarLocation,
	CarTransmission,
	CarType,
} from '../../enums/car.enum';
import { REACT_APP_API_URL, carYears } from '../../config';
import { CarInput } from '../../types/car/car.input';
import axios from 'axios';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_CAR, UPDATE_CAR } from '../../../apollo/user/mutation';
import { GET_CAR } from '../../../apollo/user/query';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import { useTranslation } from 'next-i18next';
import { formatEnum } from '../../utils';

// formadagi select uchun umumiy komponent
const SelectBox = ({ title, value, options, onChange, format }: any) => (
	<label className="price-year-after-price mp-field">
		<span className="title">{title}</span>
		<span className="mp-select">
			<select
				className={'select-description'}
				value={value === '' || value === undefined || value === null ? 'select' : `${value}`}
				onChange={({ target: { value } }) => onChange(value)}
			>
				<option disabled={true} value={'select'}>
					Select
				</option>
				{options.map((option: any) => (
					<option value={`${option}`} key={option}>
						{format ? format(option) : typeof option === 'string' ? formatEnum(option) : option}
					</option>
				))}
			</select>
			<KeyboardArrowDownRoundedIcon className={'arrow-down'} />
		</span>
	</label>
);

// formadagi oddiy input uchun umumiy komponent
const InputBox = ({ title, value, onChange, type = 'text', placeholder }: any) => (
	<label className="price-year-after-price mp-field">
		<span className="title">{title}</span>
		<input
			type={type}
			className="description-input"
			placeholder={placeholder ?? title}
			value={value ?? ''}
			onChange={({ target: { value } }) => onChange(value)}
		/>
	</label>
);

const AddCar = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const inputRef = useRef<any>(null);
	const [insertCarData, setInsertCarData] = useState<CarInput>(initialValues);
	const [carType, setCarType] = useState<CarType[]>(Object.values(CarType));
	const [carLocation, setCarLocation] = useState<CarLocation[]>(Object.values(CarLocation));
	const token = getJwtToken();
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	// CREATE_CAR — apollo/user/mutation.ts dan; yangi e'lon yaratish uchun mutatsiya funksiyasi
	const [createCar] = useMutation(CREATE_CAR);
	// UPDATE_CAR — apollo/user/mutation.ts dan; mavjud e'lonni tahrirlash uchun mutatsiya funksiyasi
	const [updateCar] = useMutation(UPDATE_CAR);

	// GET_CAR — apollo/user/query.ts dan; bitta e'lonni ID bo'yicha backend'dan oladi (faqat tahrirlash rejimida)
	const {
		loading: getCarLoading,
		data: getCarData,
		error: getCarError,
		refetch: getCarRefetch,
	} = useQuery(GET_CAR, {
		fetchPolicy: 'network-only',
		variables: {
			input: router.query.carId,
		},
		skip: !router.query.carId, // yangi e'lon qo'shishda so'rov yuborilmaydi
	});

	/** LIFECYCLES **/
	// getCarData kelganda (tahrirlash rejimida) formani o'sha e'lon ma'lumotlari bilan to'ldiradi;
	// getCarData bo'lmasa (yangi e'lon qo'shish rejimi) boshlang'ich qiymatlar qoladi
	useEffect(() => {
		const car = getCarData?.getCar;
		if (!car) return;
		setInsertCarData({
			...insertCarData,
			carTitle: car.carTitle,
			carPrice: car.carPrice,
			carType: car.carType,
			carLocation: car.carLocation,
			carAddress: car.carAddress,
			carBrand: car.carBrand,
			carModel: car.carModel,
			carYear: car.carYear,
			carMileage: car.carMileage,
			carFuelType: car.carFuelType,
			carTransmission: car.carTransmission,
			carCondition: car.carCondition,
			carEngineSize: car.carEngineSize ?? undefined,
			carSeats: car.carSeats ?? undefined,
			carColor: car.carColor ?? '',
			carVin: car.carVin ?? '',
			carBarter: car.carBarter,
			carCredit: car.carCredit,
			carDesc: car.carDesc ?? '',
			carImages: car.carImages,
		});
	}, [getCarLoading, getCarData]);

	/** HANDLERS **/
	// tanlangan rasm fayllarini GraphQL upload orqali backend'ga yuboradi (Apollo mutatsiyadan emas, to'g'ridan-to'g'ri axios bilan)
	async function uploadImages() {
		try {
			const formData = new FormData(); // ko'p qismli (multipart) so'rov tanasi
			const selectedFiles = inputRef.current.files; // <input type="file"> orqali tanlangan fayllar ro'yxati

			if (selectedFiles.length == 0) return false; // fayl tanlanmagan bo'lsa hech narsa qilmaydi
			if (selectedFiles.length > 5) throw new Error('Cannot upload more than 5 images!'); // 5 tadan ortiq rasm cheklanadi

			formData.append(
				'operations', // GraphQL multipart spetsifikatsiyasi talab qiladigan maxsus nom — so'rov (query) shu yerda yuboriladi
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
				  }`, // backend'dagi "bir nechta rasm yuklash" mutatsiyasi
					variables: {
						files: [null, null, null, null, null], // haqiqiy fayllar pastda 'map' orqali bog'lanadi
						target: 'car', // qaysi papkaga saqlanishi (e'lon rasmlari)
					},
				}),
			);
			formData.append(
				'map', // GraphQL multipart spetsifikatsiyasi: qaysi formData kaliti qaysi variables.files elementiga tegishli
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			for (const key in selectedFiles) {
				if (/^\d+$/.test(key)) formData.append(`${key}`, selectedFiles[key]); // har bir tanlangan faylni formData'ga qo'shadi
			}

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data', // fayl yuklash uchun majburiy header
					'apollo-require-preflight': true, // Apollo Server'ga bu GraphQL multipart so'rov ekanini bildiradi
					Authorization: `Bearer ${token}`, // login qilingan foydalanuvchi tokeni
				},
			});

			const responseImages = response.data.data.imagesUploader; // backend qaytargan yuklangan rasm fayl nomlari

			console.log('+responseImages: ', responseImages);
			setInsertCarData({ ...insertCarData, carImages: responseImages }); // formadagi rasmlar ro'yxatini yangilaydi
		} catch (err: any) {
			console.log('err: ', err.message);
			await sweetMixinErrorAlert(err.message); // foydalanuvchiga xato haqida alert ko'rsatadi
		}
	}

	// maydonni yangilash uchun qisqa yordamchi
	const setField = (key: keyof CarInput, value: any) => setInsertCarData({ ...insertCarData, [key]: value });

	// backend'ga yuborishdan oldin bo'sh ixtiyoriy maydonlarni olib tashlaydi
	// (masalan bo'sh VIN "" yuborilsa backend 17 belgi talab qilgani uchun xato beradi)
	const buildPayload = () => {
		const payload: any = { ...insertCarData };
		['carColor', 'carVin', 'carDesc'].forEach((key) => {
			if (payload[key] === '' || payload[key] === undefined) delete payload[key];
		});
		['carEngineSize', 'carSeats'].forEach((key) => {
			if (payload[key] === undefined || payload[key] === null || Number.isNaN(payload[key])) delete payload[key];
		});
		return payload;
	};

	const doDisabledCheck = () => {
		const d: any = insertCarData;
		if (
			!d.carTitle ||
			!d.carPrice ||
			!d.carType ||
			!d.carLocation ||
			!d.carAddress ||
			!d.carBrand ||
			!d.carModel ||
			!d.carYear ||
			d.carMileage === undefined ||
			d.carMileage === null ||
			Number.isNaN(d.carMileage) ||
			!d.carFuelType ||
			!d.carTransmission ||
			(d.carVin && d.carVin.length !== 17) ||
			d.carImages.length === 0
		) {
			return true;
		}
		return false;
	};

	// "Save" tugmasi bosilganda (yangi e'lon qo'shish rejimida) createCar mutatsiyasini yuboradi
	const insertCarHandler = useCallback(async () => {
		try {
			await createCar({
				variables: {
					input: buildPayload(),
				},
			});

			await sweetMixinSuccessAlert('This car has been created successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myCars',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertCarData]);

	// "Save" tugmasi bosilganda (tahrirlash rejimida, URL'da carId bo'lganda) updateCar mutatsiyasini yuboradi
	const updateCarHandler = useCallback(async () => {
		try {
			const payload = buildPayload();
			payload._id = getCarData?.getCar?._id; // qaysi e'lon tahrirlanayotganini bildirish uchun ID qo'shiladi
			await updateCar({
				variables: {
					input: payload,
				},
			});

			await sweetMixinSuccessAlert('This car has been updated successfully.');
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myCars',
				},
			});
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [insertCarData, getCarData]);

	if (user?.memberType !== 'DEALER') {
		router.back();
	}

	console.log('+insertCarData', insertCarData);

	const isEdit = !!router.query.carId;

	// mobil va desktop'da bir xil forma — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-add-car" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{isEdit ? t('Edit car') : t('Add New Car')}</Typography>
					<Typography className="sub-title">
						{t('Fill in the details buyers look for. Fields marked with * are required.')}
					</Typography>
				</Stack>
			</Stack>

			<div className="config mp-form">
				{/* 1. Asosiy ma'lumot */}
				<section className="mp-card mp-form-section">
					<div className="mp-form-section-head">
						<span className="mp-step">1</span>
						<div>
							<h3>{t('Basic info')}</h3>
							<p>{t('Title, price and where the car is.')}</p>
						</div>
					</div>
					<div className="mp-form-grid">
						<label className="mp-field is-wide">
							<span className="title">{t('Title')} *</span>
							<input
								type="text"
								className="description-input"
								placeholder={t('e.g. Hyundai Sonata 2021, one owner')}
								value={insertCarData.carTitle}
								onChange={({ target: { value } }) => setField('carTitle', value)}
							/>
						</label>
						<InputBox
							title={`${t('Price (₩)')} *`}
							type="number"
							value={insertCarData.carPrice || ''}
							onChange={(value: string) => setField('carPrice', parseInt(value) || 0)}
						/>
						<SelectBox
							title={`${t('Car Type')} *`}
							value={insertCarData.carType}
							options={carType}
							onChange={(value: string) => setField('carType', value)}
						/>
						<SelectBox
							title={`${t('Location')} *`}
							value={insertCarData.carLocation}
							options={carLocation}
							onChange={(value: string) => setField('carLocation', value)}
						/>
						<InputBox
							title={`${t('Address')} *`}
							value={insertCarData.carAddress}
							onChange={(value: string) => setField('carAddress', value)}
						/>
					</div>
				</section>

				{/* 2. Texnik ma'lumot */}
				<section className="mp-card mp-form-section">
					<div className="mp-form-section-head">
						<span className="mp-step">2</span>
						<div>
							<h3>{t('Specs')}</h3>
							<p>{t('Brand, model and technical details.')}</p>
						</div>
					</div>
					<div className="mp-form-grid is-3">
						<SelectBox
							title={`${t('Brand')} *`}
							value={insertCarData.carBrand}
							options={Object.values(CarBrand)}
							onChange={(value: string) => setField('carBrand', value)}
						/>
						<InputBox
							title={`${t('Model')} *`}
							placeholder={t('e.g. Sonata, K5, Model 3')}
							value={insertCarData.carModel}
							onChange={(value: string) => setField('carModel', value)}
						/>
						<SelectBox
							title={`${t('Year')} *`}
							value={insertCarData.carYear}
							options={[...carYears].reverse()}
							onChange={(value: string) => setField('carYear', parseInt(value))}
						/>
						<InputBox
							title={t('Mileage (km)')}
							type="number"
							value={insertCarData.carMileage ?? ''}
							onChange={(value: string) => setField('carMileage', value === '' ? undefined : parseInt(value))}
						/>
						<SelectBox
							title={t('Fuel Type')}
							value={insertCarData.carFuelType}
							options={Object.values(CarFuelType)}
							onChange={(value: string) => setField('carFuelType', value)}
						/>
						<SelectBox
							title={t('Transmission')}
							value={insertCarData.carTransmission}
							options={Object.values(CarTransmission)}
							onChange={(value: string) => setField('carTransmission', value)}
						/>
						<SelectBox
							title={t('Condition')}
							value={insertCarData.carCondition}
							options={Object.values(CarCondition)}
							onChange={(value: string) => setField('carCondition', value)}
						/>
						<InputBox
							title={t('Engine Size (cc)')}
							type="number"
							placeholder={t('e.g. 1998 (empty for EV)')}
							value={insertCarData.carEngineSize ?? ''}
							onChange={(value: string) => setField('carEngineSize', value === '' ? undefined : parseInt(value))}
						/>
						<SelectBox
							title={t('Seats')}
							value={insertCarData.carSeats}
							options={[2, 4, 5, 6, 7, 8, 9, 11]}
							onChange={(value: string) => setField('carSeats', parseInt(value))}
						/>
						<InputBox
							title={t('Color')}
							value={insertCarData.carColor}
							onChange={(value: string) => setField('carColor', value)}
						/>
						<InputBox
							title={t('VIN (optional)')}
							placeholder={t('17 characters')}
							value={insertCarData.carVin}
							onChange={(value: string) => setField('carVin', value.toUpperCase())}
						/>
					</div>
				</section>

				{/* 3. Savdo shartlari va tavsif */}
				<section className="mp-card mp-form-section">
					<div className="mp-form-section-head">
						<span className="mp-step">3</span>
						<div>
							<h3>{t('Deal & description')}</h3>
							<p>{t('Payment options and anything a buyer should know.')}</p>
						</div>
					</div>
					<div className="mp-form-grid">
						<SelectBox
							title={t('Barter')}
							value={insertCarData.carBarter ? 'yes' : 'no'}
							options={['yes', 'no']}
							format={(option: string) => (option === 'yes' ? t('Yes') : t('No'))}
							onChange={(value: string) => setField('carBarter', value === 'yes')}
						/>
						<SelectBox
							title={t('Credit (installments)')}
							value={insertCarData.carCredit ? 'yes' : 'no'}
							options={['yes', 'no']}
							format={(option: string) => (option === 'yes' ? t('Yes') : t('No'))}
							onChange={(value: string) => setField('carCredit', value === 'yes')}
						/>
						<label className="mp-field is-wide">
							<span className="title">{t('Description')} *</span>
							<textarea
								className="description-text"
								placeholder={t('Service history, extras, condition…')}
								value={insertCarData.carDesc}
								onChange={({ target: { value } }) => setField('carDesc', value)}
							></textarea>
						</label>
					</div>
				</section>

				{/* 4. Rasmlar */}
				<section className="mp-card mp-form-section">
					<div className="mp-form-section-head">
						<span className="mp-step">4</span>
						<div>
							<h3>{t('Photos')} *</h3>
							<p>{t('The first photo is used as the cover. JPG or PNG.')}</p>
						</div>
					</div>
					<div className="images-box">
						<div className="upload-box">
							<span className="mp-upload-icon">
								<AddPhotoAlternateRoundedIcon />
							</span>
							<Typography className="drag-title">{t('Add photos of your car')}</Typography>
							<Typography className="format-title">{t('JPEG or PNG, at least 2048×768')}</Typography>
							<Button
								className="browse-button mp-btn-outline"
								onClick={() => {
									inputRef.current.click();
								}}
							>
								{t('Browse files')}
								<input
									ref={inputRef}
									type="file"
									hidden={true}
									onChange={uploadImages}
									multiple={true}
									accept="image/jpg, image/jpeg, image/png"
								/>
							</Button>
						</div>
						{insertCarData?.carImages?.length > 0 && (
							<div className="gallery-box">
								{insertCarData?.carImages.map((image: string, index: number) => {
									const imagePath: string = `${REACT_APP_API_URL}/${image}`;
									return (
										<div className="image-box" key={image}>
											<img src={imagePath} alt="" />
											{index === 0 && <span className="mp-cover">{t('Cover')}</span>}
										</div>
									);
								})}
							</div>
						)}
					</div>
				</section>

				<div className="buttons-row mp-savebar">
					<span className="mp-savebar-hint">
						{doDisabledCheck() ? t('Fill in the required fields to save.') : t('Everything looks good.')}
					</span>
					{isEdit ? (
						<Button className="next-button mp-btn-primary" disabled={doDisabledCheck()} onClick={updateCarHandler}>
							{t('Save changes')}
						</Button>
					) : (
						<Button className="next-button mp-btn-primary" disabled={doDisabledCheck()} onClick={insertCarHandler}>
							{t('Publish car')}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

AddCar.defaultProps = {
	initialValues: {
		carTitle: '',
		carPrice: 0,
		carType: '',
		carLocation: '',
		carAddress: '',
		carBrand: '',
		carModel: '',
		carYear: '',
		carMileage: undefined,
		carFuelType: '',
		carTransmission: '',
		carCondition: 'USED',
		carEngineSize: undefined,
		carSeats: undefined,
		carColor: '',
		carVin: '',
		carBarter: false,
		carCredit: false,
		carDesc: '',
		carImages: [],
	},
};

export default AddCar;
