import { Menu, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import IconButton from '@mui/material/IconButton';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import { Car } from '../../types/car/car';
import { formatterStr } from '../../utils';
import Moment from 'react-moment';
import { useRouter } from 'next/router';
import { CarStatus } from '../../enums/car.enum';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import RemoveRedEyeRoundedIcon from '@mui/icons-material/RemoveRedEyeRounded';
import { useTranslation } from 'next-i18next';

interface CarCardProps {
	car: Car;
	deleteCarHandler?: any;
	memberPage?: boolean;
	updateCarHandler?: any;
}

export const CarCard = (props: CarCardProps) => {
	const { car, deleteCarHandler, memberPage, updateCarHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);

	/** HANDLERS **/
	// tahrirlash (qalam) tugmasi bosilganda: shu e'lonni tahrirlash rejimida AddNewCar formasini ochadi
	// (carId URL query'ga qo'shiladi, AddNewCar o'sha ID bo'yicha GET_CAR so'raydi)
	const pushEditCar = async (id: string) => {
		console.log('+pushEditCar: ', id);
		await router.push({
			pathname: '/mypage',
			query: { category: 'addCar', carId: id },
		});
	};

	// karta bosilganda ishga tushadi: faqat "memberPage" (boshqa a'zoning profilidagi ro'yxat) bo'lsa detail sahifasiga o'tadi,
	// o'zining "Mening e'lonlarim" ro'yxatida esa bosish hech narsa qilmaydi (chunki u yerda tahrirlash/o'chirish tugmalari bor)
	const pushCarDetail = async (id: string) => {
		if (memberPage)
			await router.push({
				pathname: '/car/detail',
				query: { id: id },
			});
		else return;
	};

	// status "badge"i bosilganda status-o'zgartirish menyusini ochadi (anchorEl'ga tugma elementini yozadi)
	const handleClick = (event: any) => {
		setAnchorEl(event.currentTarget);
	};

	// menyuni yopadi
	const handleClose = () => {
		setAnchorEl(null);
	};

	const statusClass = `is-${(car?.carStatus ?? 'ACTIVE').toLowerCase()}`;
	const STATUS_LABEL: Record<string, string> = { ACTIVE: 'On sale', RESERVED: 'Reserved', SOLD: 'Sold' };

	// mobil va desktop'da bir xil qator — desktop'da jadval qatori, mobilda karta (stillar mypageV2.scss'da)
	return (
		<Stack className={`car-card-box mp-row ${memberPage ? 'is-link' : ''}`}>
			<div className="mp-row-main" onClick={() => pushCarDetail(car?._id)}>
				<div className="image-box">
					<img
						src={car?.carImages?.[0] ? `${process.env.REACT_APP_API_URL}/${car.carImages[0]}` : '/video/hero-poster.jpg'}
						alt=""
						loading={'lazy'}
					/>
				</div>
				<div className="information-box">
					<Typography className="name">{car.carTitle}</Typography>
					<Typography className="address">{car.carAddress}</Typography>
					<Typography className="price">₩{formatterStr(car?.carPrice)}</Typography>
				</div>
			</div>
			<div className="date-box">
				<span className="mp-cell-label">{t('Published')}</span>
				<Moment className="date" format="MMM D, YYYY">
					{car.createdAt}
				</Moment>
			</div>
			<div className="status-box">
				<span className="mp-cell-label">{t('Status')}</span>
				<button
					type="button"
					className={`mp-status ${statusClass} ${!memberPage && car.carStatus !== 'SOLD' ? 'is-editable' : ''}`}
					onClick={handleClick}
				>
					{t(STATUS_LABEL[car.carStatus] ?? car.carStatus)}
					{!memberPage && car.carStatus !== 'SOLD' && <KeyboardArrowDownRoundedIcon />}
				</button>
			</div>
			{!memberPage && car.carStatus !== 'SOLD' && (
				<Menu anchorEl={anchorEl} open={open} onClose={handleClose} className={'mp-status-menu'}>
					{car.carStatus === 'ACTIVE' && (
						<MenuItem
							disableRipple
							onClick={() => {
								handleClose();
								updateCarHandler(CarStatus.RESERVED, car?._id);
							}}
						>
							<span className="mp-dot is-reserved" />
							{t('Reserved')}
						</MenuItem>
					)}
					{car.carStatus === 'RESERVED' && (
						<MenuItem
							disableRipple
							onClick={() => {
								handleClose();
								updateCarHandler(CarStatus.ACTIVE, car?._id);
							}}
						>
							<span className="mp-dot is-active" />
							{t('On sale')}
						</MenuItem>
					)}
					<MenuItem
						disableRipple
						onClick={() => {
							handleClose();
							updateCarHandler(CarStatus.SOLD, car?._id);
						}}
					>
						<span className="mp-dot is-sold" />
						{t('Sold')}
					</MenuItem>
				</Menu>
			)}

			<div className="views-box">
				<span className="mp-cell-label">{t('Views')}</span>
				<span className="views">
					<RemoveRedEyeRoundedIcon />
					{car.carViews.toLocaleString()}
				</span>
			</div>
			{!memberPage && car.carStatus === CarStatus.ACTIVE && (
				<div className="action-box">
					<IconButton className="icon-button" onClick={() => pushEditCar(car._id)} aria-label={t('Edit')}>
						<ModeIcon className="buttons" />
					</IconButton>
					<IconButton
						className="icon-button is-danger"
						onClick={() => deleteCarHandler(car._id)}
						aria-label={t('Delete')}
					>
						<DeleteIcon className="buttons" />
					</IconButton>
				</div>
			)}
		</Stack>
	);
};
