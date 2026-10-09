import { formatEnum, formatterStr } from '../../utils';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Car } from '../../types/car/car';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, topCarRank, LIKED_COLOR } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface PopularCarCardProps {
	car: Car;
	likeCarHandler?: any;
}

const PopularCarCard = (props: PopularCarCardProps) => {
	const { car, likeCarHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	// like holati va saqlanganda bir martalik "pop" animatsiyasi (TrendCarCard bilan bir xil)
	const [justLiked, setJustLiked] = useState(false);
	const liked = !!car?.meLiked?.[0]?.myFavorite;
	const favoriteHandler = () => {
		if (!likeCarHandler) return;
		if (!liked && user?._id) {
			setJustLiked(true);
			setTimeout(() => setJustLiked(false), 300);
		}
		likeCarHandler(user, car?._id);
	};

	/** HANDLERS **/
	// karta rasmiga yoki sarlavhasiga bosilganda: shu e'lonning detail sahifasiga (?id=...) o'tkazadi
	const pushDetailHandler = async (carId: string) => {
		console.log('carId:', carId);
		await router.push({ pathname: '/car/detail', query: { id: carId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="popular-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${car?.carImages[0]})` }}
					onClick={() => pushDetailHandler(car._id)}
				>
					{car && car?.carRank >= topCarRank ? (
						<div className={'status'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<span>{t('TOP')}</span>
						</div>
					) : (
						''
					)}

					<div className={'price'}>₩{formatterStr(car.carPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(car._id)}>{car.carTitle}</strong>
					<p className={'desc'}>{car.carAddress}</p>
					<div className={'options'}>
						<div>
							<img src="/img/icons/calendar.svg" alt="" />
							<span>{car?.carYear}</span>
						</div>
						<div>
							<img src="/img/icons/speedometer.svg" alt="" />
							<span>{car?.carMileage?.toLocaleString()} km</span>
						</div>
						<div>
							<img src="/img/icons/fuel.svg" alt="" />
							<span>{car?.carFuelType}</span>
						</div>
					</div>
					<Divider sx={{ mt: '15px', mb: '17px' }} />
					<div className={'bott'}>
						<p>{car?.carCredit ? t('Credit') : t('For sale')}</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{car?.carViews}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		// desktop: Trend kartasi bilan bir xil vizual til (16:10 rasm, narx — eng kuchli element)
		return (
			<article className={'tc-card hp-car-card'}>
				<button type={'button'} className={'tc-link'} onClick={() => pushDetailHandler(car._id)}>
					<span className={'tc-media'}>
						<img src={`${REACT_APP_API_URL}/${car?.carImages[0]}`} alt={car.carTitle} loading={'lazy'} />
						{car && car?.carRank >= topCarRank && (
							<span className={'tc-badge is-top'}>
								<img src="/img/icons/electricity.svg" alt="" width={12} height={12} />
								{t('TOP')}
							</span>
						)}
					</span>
					<span className={'tc-body'}>
						<span className={'tc-title'}>{car.carTitle}</span>
						<span className={'tc-place'}>{car.carAddress}</span>
						<span className={'tc-price'}>₩{formatterStr(car.carPrice)}</span>
						<span className={'tc-specs'}>
							<span className={'tc-spec'}>
								<img src="/img/icons/calendar.svg" alt="" width={16} height={16} />
								<span>{car?.carYear}</span>
							</span>
							<span className={'tc-spec'}>
								<img src="/img/icons/speedometer.svg" alt="" width={16} height={16} />
								<span>{car?.carMileage?.toLocaleString()} km</span>
							</span>
							<span className={'tc-spec'}>
								<img src="/img/icons/fuel.svg" alt="" width={16} height={16} />
								<span>{t(formatEnum(car?.carFuelType))}</span>
							</span>
						</span>
						<span className={'tc-foot'}>
							<span className={'tc-tag'}>{car?.carCredit ? t('Credit') : t('For sale')}</span>
							<span className={'tc-stat'} aria-label={t('{{count}} views', { count: car?.carViews ?? 0 })}>
								<RemoveRedEyeIcon aria-hidden="true" />
								{car?.carViews}
							</span>
						</span>
					</span>
				</button>
				{likeCarHandler && (
					<button
						type={'button'}
						className={`tc-fav ${liked ? 'is-liked' : ''} ${justLiked ? 'just-liked' : ''}`}
						aria-pressed={liked}
						aria-label={liked ? t('Remove from favorites') : t('Save to favorites')}
						onClick={favoriteHandler}
					>
						{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} aria-hidden="true" /> : <FavoriteBorderIcon aria-hidden="true" />}
					</button>
				)}
			</article>
		);
	}
};

export default PopularCarCard;
