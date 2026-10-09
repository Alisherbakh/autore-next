import React from 'react';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Car } from '../../types/car/car';
import Link from 'next/link';
import { formatterStr, formatEnum } from '../../utils';
import { REACT_APP_API_URL, topCarRank, LIKED_COLOR } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CarStatus } from '../../enums/car.enum';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useTranslation } from 'next-i18next';

interface CarCardType {
	car: Car;
	likeCarHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const CarCard = (props: CarCardType) => {
	const { car, likeCarHandler, myFavorites, recentlyVisited } = props;
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const imagePath: string = car?.carImages[0]
		? `${REACT_APP_API_URL}/${car?.carImages[0]}`
		: '/video/hero-poster.jpg';

	const detailHref = { pathname: '/car/detail', query: { id: car?._id } };
	const liked: boolean = !!(myFavorites || (car?.meLiked && car?.meLiked[0]?.myFavorite));

	// mobil va desktop'da bir xil karta — stillar scss/pc/car/carListV2.scss'da
	return (
		<Stack className="card-config cl-card">
			<div className="cl-card-img">
				<Link href={detailHref} aria-label={car?.carTitle}>
					<img src={imagePath} alt="" loading={'lazy'} />
				</Link>
				<div className="cl-badges">
					{car && car?.carRank > topCarRank && (
						<span className={'cl-badge is-top'}>
							<BoltRoundedIcon />
							{t('TOP')}
						</span>
					)}
					{car?.carStatus === CarStatus.RESERVED && <span className={'cl-badge is-reserved'}>{t('RESERVED')}</span>}
				</div>
				<span className={'cl-price'}>₩{formatterStr(car?.carPrice)}</span>
			</div>

			<div className="cl-card-body">
				<Link href={detailHref} className={'cl-title'}>
					{car.carTitle}
				</Link>
				<p className={'cl-address'}>
					<PlaceRoundedIcon />
					<span>
						{car.carAddress}
						{car.carLocation ? `, ${formatEnum(car.carLocation)}` : ''}
					</span>
				</p>

				<div className="cl-specs">
					<span>
						<CalendarMonthRoundedIcon />
						{car.carYear}
					</span>
					<span>
						<SpeedRoundedIcon />
						{car.carMileage?.toLocaleString()} km
					</span>
					<span>
						<LocalGasStationRoundedIcon />
						{formatEnum(car.carFuelType)}
					</span>
				</div>

				<div className="cl-card-foot">
					<div className="cl-deals">
						{car.carCredit && (
							<span>
								<CheckRoundedIcon />
								{t('Credit')}
							</span>
						)}
						{car.carBarter && (
							<span>
								<CheckRoundedIcon />
								{t('Barter')}
							</span>
						)}
					</div>
					{!recentlyVisited && (
						<div className="cl-stats">
							<span title={t('Views')}>
								<RemoveRedEyeIcon />
								{car?.carViews ?? 0}
							</span>
							<span className={'cl-like'}>
								<IconButton
									color={'default'}
									onClick={() => likeCarHandler(user, car?._id)}
									aria-label={liked ? t('Unlike') : t('Like')}
								>
									{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
								</IconButton>
								{car?.carLikes ?? 0}
							</span>
						</div>
					)}
				</div>
			</div>
		</Stack>
	);
};

export default CarCard;
