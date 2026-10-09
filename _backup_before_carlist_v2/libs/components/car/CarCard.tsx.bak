import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Car } from '../../types/car/car';
import Link from 'next/link';
import { formatterStr } from '../../utils';
import { REACT_APP_API_URL, topCarRank, LIKED_COLOR } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CarStatus } from '../../enums/car.enum';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

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
	const imagePath: string = car?.carImages[0]
		? `${REACT_APP_API_URL}/${car?.carImages[0]}`
		: '/video/hero-poster.jpg';

	if (device === 'mobile') {
		return <div>CAR CARD</div>;
	} else {
		return (
			<Stack className="card-config">
				<Stack className="top">
					<Link
						href={{
							pathname: '/car/detail',
							query: { id: car?._id },
						}}
					>
						<img src={imagePath} alt="" />
					</Link>
					{car && car?.carRank > topCarRank && (
						<Box component={'div'} className={'top-badge'}>
							<img src="/img/icons/electricity.svg" alt="" />
							<Typography>TOP</Typography>
						</Box>
					)}
					{car?.carStatus === CarStatus.RESERVED && (
						<Box
							component={'div'}
							sx={{
								position: 'absolute',
								top: '20px',
								right: '16px',
								padding: '6px 12px',
								borderRadius: '6px',
								background: '#f57c00',
								color: '#fff',
								fontSize: '12px',
								fontWeight: 600,
							}}
						>
							RESERVED
						</Box>
					)}
					<Box component={'div'} className={'price-box'}>
						<Typography>₩{formatterStr(car?.carPrice)}</Typography>
					</Box>
				</Stack>
				<Stack className="bottom">
					<Stack className="name-address">
						<Stack className="name">
							<Link
								href={{
									pathname: '/car/detail',
									query: { id: car?._id },
								}}
							>
								<Typography>{car.carTitle}</Typography>
							</Link>
						</Stack>
						<Stack className="address">
							<Typography>
								{car.carAddress}, {car.carLocation}
							</Typography>
						</Stack>
					</Stack>
					<Stack className="options">
						<Stack className="option">
							<img src="/img/icons/calendar.svg" alt="" /> <Typography>{car.carYear}</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/speedometer.svg" alt="" /> <Typography>{car.carMileage?.toLocaleString()} km</Typography>
						</Stack>
						<Stack className="option">
							<img src="/img/icons/fuel.svg" alt="" /> <Typography>{car.carFuelType}</Typography>
						</Stack>
					</Stack>
					<Stack className="divider"></Stack>
					<Stack className="type-buttons">
						<Stack className="type">
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={car.carCredit ? '' : 'disabled-type'}
							>
								Credit
							</Typography>
							<Typography
								sx={{ fontWeight: 500, fontSize: '13px' }}
								className={car.carBarter ? '' : 'disabled-type'}
							>
								Barter
							</Typography>
						</Stack>
						{!recentlyVisited && (
							<Stack className="buttons">
								<IconButton color={'default'}>
									<RemoveRedEyeIcon />
								</IconButton>
								<Typography className="view-cnt">{car?.carViews}</Typography>
								<IconButton color={'default'} onClick={() => likeCarHandler(user, car?._id)}>
									{myFavorites ? (
										<FavoriteIcon style={{ color: LIKED_COLOR }} />
									) : car?.meLiked && car?.meLiked[0]?.myFavorite ? (
										<FavoriteIcon style={{ color: LIKED_COLOR }} />
									) : (
										<FavoriteBorderIcon />
									)}
								</IconButton>
								<Typography className="view-cnt">{car?.carLikes}</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CarCard;
