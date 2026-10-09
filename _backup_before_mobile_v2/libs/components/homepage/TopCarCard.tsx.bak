import { formatEnum, formatterStr } from '../../utils';
import React from 'react';
import { Stack, Box, Divider, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Car } from '../../types/car/car';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';

interface TopCarCardProps {
	car: Car;
	likeCarHandler: any;
}

const TopCarCard = (props: TopCarCardProps) => {
	const { car, likeCarHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	/** HANDLERS **/
	// karta rasmiga yoki sarlavhasiga bosilganda: shu e'lonning detail sahifasiga (?id=...) o'tkazadi
	const pushDetailHandler = async (carId: string) => {
		console.log('carId:', carId);
		await router.push({ pathname: '/car/detail', query: { id: carId } });
	};

	if (device === 'mobile') {
		return (
			<Stack className="top-card-box">
				<Box
					component={'div'}
					className={'card-img'}
					style={{ backgroundImage: `url(${REACT_APP_API_URL}/${car?.carImages[0]})` }}
					onClick={() => pushDetailHandler(car._id)}
				>
					<div>₩{formatterStr(car?.carPrice)}</div>
				</Box>
				<Box component={'div'} className={'info'}>
					<strong className={'title'} onClick={() => pushDetailHandler(car._id)}>{car?.carTitle}</strong>
					<p className={'desc'}>{car?.carAddress}</p>
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
						<p>
							{' '}
							{car.carCredit ? 'Credit' : ''} {car.carCredit && car.carBarter && '/'}{' '}
							{car.carBarter ? 'Barter' : ''}
						</p>
						<div className="view-like-box">
							<IconButton color={'default'}>
								<RemoveRedEyeIcon />
							</IconButton>
							<Typography className="view-cnt">{car?.carViews}</Typography>
							<IconButton color={'default'} onClick={() => likeCarHandler(user, car?._id)}>
								{car?.meLiked && car?.meLiked[0]?.myFavorite ? (
									<FavoriteIcon style={{ color: LIKED_COLOR }} />
								) : (
									<FavoriteIcon />
								)}
							</IconButton>
							<Typography className="view-cnt">{car?.carLikes}</Typography>
						</div>
					</div>
				</Box>
			</Stack>
		);
	} else {
		// desktop: Trend kartasi bilan bir xil vizual til; like tugmasi — rasm ustida, mavjud likeCarHandler'ni chaqiradi
		const liked = !!(car?.meLiked && car?.meLiked[0]?.myFavorite);
		const options = [car.carCredit ? 'Credit' : '', car.carBarter ? 'Barter' : ''].filter(Boolean).join(' / ');

		return (
			<article className={'tc-card hp-car-card'}>
				<button type={'button'} className={'tc-link'} onClick={() => pushDetailHandler(car._id)}>
					<span className={'tc-media'}>
						<img src={`${REACT_APP_API_URL}/${car?.carImages[0]}`} alt={car?.carTitle} loading={'lazy'} />
					</span>
					<span className={'tc-body'}>
						<span className={'tc-title'}>{car?.carTitle}</span>
						<span className={'tc-place'}>{car?.carAddress}</span>
						<span className={'tc-price'}>₩{formatterStr(car?.carPrice)}</span>
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
								<span>{formatEnum(car?.carFuelType)}</span>
							</span>
						</span>
						<span className={'tc-foot'}>
							{options ? <span className={'tc-tag'}>{options}</span> : <span />}
							<span className={'tc-stats'}>
								<span className={'tc-stat'} aria-label={`${car?.carViews} views`}>
									<RemoveRedEyeIcon aria-hidden="true" />
									{car?.carViews}
								</span>
								<span className={'tc-stat'} aria-label={`${car?.carLikes} likes`}>
									<FavoriteIcon aria-hidden="true" />
									{car?.carLikes}
								</span>
							</span>
						</span>
					</span>
				</button>
				<button
					type={'button'}
					className={`tc-fav ${liked ? 'is-liked' : ''}`}
					aria-pressed={liked}
					aria-label={liked ? 'Remove from favorites' : 'Save to favorites'}
					onClick={() => likeCarHandler(user, car?._id)}
				>
					{liked ? (
						<FavoriteIcon style={{ color: LIKED_COLOR }} aria-hidden="true" />
					) : (
						<FavoriteBorderIcon aria-hidden="true" />
					)}
				</button>
			</article>
		);
	}
};

export default TopCarCard;
