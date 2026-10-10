import React, { useState } from 'react';
import Link from 'next/link';
import { Stack } from '@mui/material';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useTranslation } from 'next-i18next';
import { GET_CARS } from '../../../apollo/user/query';
import { Car } from '../../types/car/car';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Message } from '../../enums/common.enum';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { T } from '../../types/common';
import { formatEnum, formatterStr } from '../../utils';
import { isLikedItem, toggleLikeInCache } from '../../optimistic';

// "Top cars" o'rnida: kredit yoki barter (almashtirish) bilan sotiladigan mashinalar.
// Backend GET_CARS → search.options: ['carCredit'] yoki ['carBarter'] (shu field true bo'lgan e'lonlar).
type PayOption = 'carCredit' | 'carBarter';

const TABS: { key: PayOption; label: string; seeAll: string; empty: string; points: string[] }[] = [
	{
		key: 'carCredit',
		label: 'Credit',
		seeAll: 'See all credit cars',
		empty: 'No credit cars yet.',
		points: ['Pay in monthly instalments', 'Agree the terms with the dealer', 'Every car here accepts credit'],
	},
	{
		key: 'carBarter',
		label: 'Barter',
		seeAll: 'See all barter cars',
		empty: 'No barter cars yet.',
		points: ['Trade your current car', 'Pay only the difference', 'Every car here accepts barter'],
	},
];

const PayYourWay = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [tab, setTab] = useState<PayOption>('carCredit');
	const active = TABS.find((item) => item.key === tab) ?? TABS[0];
	const input = { page: 1, limit: 4, sort: 'createdAt', direction: 'DESC', search: { options: [tab] } };

	/** APOLLO REQUESTS **/
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	const client = useApolloClient(); // optimistic like uchun Apollo cache'ga to'g'ridan-to'g'ri yozish
	// GET_CARS — tanlangan to'lov turi (kredit / barter) mavjud bo'lgan eng yangi 4 ta e'lon
	const { data, loading, refetch } = useQuery(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
	});
	const cars: Car[] = data?.getCars?.list ?? [];
	const seeAllInput = { ...input, limit: 9 };

	/** HANDLERS **/
	// kartadagi yurak: login tekshiradi, like mutatsiyasini yuboradi, ro'yxatni yangilaydi
	const likeCarHandler = async (user: T, id: string) => {
		if (!id) return;
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED).then();
		// optimistic: kartalar useQuery `data`sidan chiziladi, shuning uchun Apollo cache'dagi Car yozuvini darhol o'zgartiramiz
		const wasLiked = isLikedItem(cars.find((car: Car) => car._id === id));
		toggleLikeInCache(client.cache, 'Car', id, 'carLikes', wasLiked);
		try {
			await likeTargetCar({ variables: { input: id } }); // javobdagi aniq carLikes cache'ga o'zi yoziladi
		} catch (err: any) {
			toggleLikeInCache(client.cache, 'Car', id, 'carLikes', !wasLiked); // xato: avvalgi holatga qaytaramiz
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack component={'section'} className={'pay-way hp-section'} aria-labelledby={'pay-way-title'}>
			<Stack className={'container'}>
				<div className={'pw-card'}>
					<div className={'pw-head'}>
						<div>
							<h2 id={'pay-way-title'}>{t('Pay your way')}</h2>
							<p>{t('Cars you can buy on credit, or trade for your current car.')}</p>
						</div>
						<div role={'tablist'} aria-label={t('Payment option')} className={'pw-tabs'}>
							{TABS.map((item) => (
								<button
									key={item.key}
									type={'button'}
									role={'tab'}
									aria-selected={item.key === tab}
									className={item.key === tab ? 'is-active' : ''}
									onClick={() => setTab(item.key)}
								>
									{t(item.label)}
								</button>
							))}
						</div>
					</div>

					<ul className={'pw-points'}>
						{active.points.map((point) => (
							<li key={point}>
								<span aria-hidden="true">✓</span>
								{t(point)}
							</li>
						))}
					</ul>

					<div className={'pw-grid'}>
						{!loading && cars.length === 0 && <div className={'pw-empty'}>{t(active.empty)}</div>}
						{cars.map((car: Car) => (
							<div key={car._id} className={'pw-item'}>
								<Link href={{ pathname: '/car/detail', query: { id: car._id } }} className={'pw-car'}>
									<div className={'pw-img'}>
										<img
											src={car.carImages?.[0] ? `${REACT_APP_API_URL}/${car.carImages[0]}` : '/img/banner/header1.svg'}
											alt={car.carTitle}
											loading={'lazy'}
										/>
										<span className={`pw-badge ${tab === 'carBarter' ? 'is-barter' : ''}`}>{t(active.label)}</span>
									</div>
									<div className={'pw-body'}>
										<strong>{car.carTitle}</strong>
										<span>
											{car.carYear} · {car.carMileage?.toLocaleString()} km · {t(formatEnum(car.carLocation))}
										</span>
										<b>₩{formatterStr(car.carPrice)}</b>
									</div>
								</Link>
								<button
									type={'button'}
									className={`pw-fav ${car?.meLiked?.[0]?.myFavorite ? 'is-liked' : ''}`}
									aria-label={car?.meLiked?.[0]?.myFavorite ? t('Remove from favorites') : t('Save to favorites')}
									aria-pressed={!!car?.meLiked?.[0]?.myFavorite}
									onClick={() => likeCarHandler(user, car._id)}
								>
									{car?.meLiked?.[0]?.myFavorite ? (
										<FavoriteIcon style={{ color: LIKED_COLOR }} aria-hidden="true" />
									) : (
										<FavoriteBorderIcon aria-hidden="true" />
									)}
								</button>
							</div>
						))}
					</div>

					<div className={'pw-more'}>
						<Link href={`/car?input=${JSON.stringify(seeAllInput)}`} className={'pw-more-btn'}>
							{t(active.seeAll)}
							<svg
								viewBox="0 0 24 24"
								width={16}
								height={16}
								fill="none"
								stroke="currentColor"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M5 12h14" />
								<path d="m13 6 6 6-6 6" />
							</svg>
						</Link>
					</div>
				</div>
			</Stack>
		</Stack>
	);
};

export default PayYourWay;
