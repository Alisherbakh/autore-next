import React, { useState } from 'react';
import Link from 'next/link';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useReactiveVar } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Car } from '../../types/car/car';
import { CarStatus } from '../../enums/car.enum';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import { formatEnum, formatterStr } from '../../utils';
import { userVar } from '../../../apollo/store';

interface TrendCarCardProps {
	car: Car;
	likeCarHandler: any;
}

// "Trend Cars" kartasi: 16:10 rasm, eng kuchli element — narx, 4 ta asosiy ko'rsatkich, saqlash (like) tugmasi
const TrendCarCard = (props: TrendCarCardProps) => {
	const { car, likeCarHandler } = props;
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [justLiked, setJustLiked] = useState(false);

	const liked = !!car?.meLiked?.[0]?.myFavorite;
	const imageSrc = car?.carImages?.[0]
		? `${REACT_APP_API_URL}/${car.carImages[0]}`
		: `/img/types/${car?.carType?.toLowerCase()}.jpg`;
	const detailHref = { pathname: '/car/detail', query: { id: car._id } };

	/** HANDLERS **/
	// yurak bosilganda: mavjud like mantig'ini chaqiradi; saqlanganda bir martalik "pop" animatsiyasi
	const favoriteHandler = () => {
		if (!liked && user?._id) {
			setJustLiked(true);
			setTimeout(() => setJustLiked(false), 300);
		}
		likeCarHandler(user, car?._id);
	};

	const specs = [
		{ icon: '/img/icons/calendar.svg', text: String(car.carYear) },
		{ icon: '/img/icons/speedometer.svg', text: `${car.carMileage?.toLocaleString()} km` },
		{ icon: '/img/icons/fuel.svg', text: formatEnum(car.carFuelType) },
		{ icon: '/img/icons/gear.svg', text: t(formatEnum(car.carTransmission)) },
	];

	return (
		<article className={'tc-card'}>
			<Link href={detailHref} className={'tc-link'}>
				<div className={'tc-media'}>
					<img src={imageSrc} alt={car.carTitle} width={284} height={178} loading={'lazy'} />
					{car.carStatus === CarStatus.RESERVED && <span className={'tc-badge'}>{t('Reserved')}</span>}
				</div>
				<div className={'tc-body'}>
					<span className={'tc-title'}>{car.carTitle}</span>
					<span className={'tc-place'}>{car.carAddress}</span>
					<span className={'tc-price'}>₩{formatterStr(car.carPrice)}</span>
					<ul className={'tc-specs'}>
						{specs.map((spec) => (
							<li key={spec.icon}>
								<img src={spec.icon} alt="" width={16} height={16} />
								<span>{spec.text}</span>
							</li>
						))}
					</ul>
				</div>
			</Link>
			<button
				type={'button'}
				className={`tc-fav ${liked ? 'is-liked' : ''} ${justLiked ? 'just-liked' : ''}`}
				aria-pressed={liked}
				aria-label={liked ? t('Remove from favorites') : t('Save to favorites')}
				onClick={favoriteHandler}
			>
				{liked ? (
					<FavoriteIcon style={{ color: LIKED_COLOR }} aria-hidden="true" />
				) : (
					<FavoriteBorderIcon aria-hidden="true" />
				)}
			</button>
		</article>
	);
};

// ma'lumot yuklanayotganda ko'rsatiladigan karta shakli (o'lchamlari haqiqiy karta bilan bir xil)
export const TrendCarSkeleton = () => (
	<div className={'tc-card tc-skeleton'} aria-hidden="true">
		<div className={'tc-media'} />
		<div className={'tc-body'}>
			<span className={'sk-line sk-title'} />
			<span className={'sk-line sk-place'} />
			<span className={'sk-line sk-price'} />
			<div className={'tc-specs'}>
				<span className={'sk-line'} />
				<span className={'sk-line'} />
				<span className={'sk-line'} />
				<span className={'sk-line'} />
			</div>
		</div>
	</div>
);

export default TrendCarCard;
