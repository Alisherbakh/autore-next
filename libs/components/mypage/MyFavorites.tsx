import React, { useState } from 'react';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CarCard from '../car/CarCard';
import { Car } from '../../types/car/car';
import { T } from '../../types/common';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_CAR } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';

const MyFavorites: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [myFavorites, setMyFavorites] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFavorites, setSearchFavorites] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_CAR — apollo/user/mutation.ts dan; e'longa like bosish/olib tashlash uchun mutatsiya funksiyasi
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);

	// GET_FAVORITES — apollo/user/query.ts dan; foydalanuvchi like bosgan (sevimli) e'lonlar ro'yxatini backend'dan oladi
	const {
		loading: getFavoritesLoading, // so'rov hali javob kutayotganini bildiradi (masalan loading spinner uchun)
		data: getFavoritesData, // backend javobi (getFavorites obyekti shu ichida, lekin quyida onCompleted orqali ishlatilyapti)
		error: getFavoritesError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getFavoritesRefetch, // shu so'rovni qo'lda qayta yuborish (masalan like bosgandan keyin ro'yxatni yangilash uchun)
	} = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: {
			input: searchFavorites, // sahifalash (page/limit) ma'lumoti backend'ga shu orqali yuboriladi
		},
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted(data: T) {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setMyFavorites(data.getFavorites?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
			setTotal(data.getFavorites?.metaCounter?.[0]?.total || 0); // umumiy sonini state'ga yozadi (topilmasa 0)
		},
	});

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: bosilgan sahifa raqamini searchFavorites.page'ga yozadi
	// (searchFavorites o'zgargani uchun useQuery avtomatik qayta so'raydi)
	const paginationHandler = (e: T, value: number) => {
		setSearchFavorites({ ...searchFavorites, page: value });
	};

	// CarCard'dagi like ikonkasi bosilganda ishga tushadi (user va e'lon id'si prop orqali keladi)
	const likeCarHandler = async (user: any, id: string) => {
		if (!id) return;
		if (!user._id) return sweetMixinErrorAlert(Messages.error2).then();
		// optimistic: bu sahifa faqat sevimlilarni ko'rsatadi — like olib tashlangan karta DARHOL yo'qoladi,
		// so'rov orqada ketadi; xato bo'lsa ro'yxat avvalgi holatiga qaytadi
		const prevList = myFavorites;
		const prevTotal = total;
		setMyFavorites((list) => (list ?? []).filter((car) => car?._id !== id));
		setTotal((count) => Math.max(0, count - 1));
		try {
			await likeTargetCar({ variables: { input: id } });
			getFavoritesRefetch({ input: searchFavorites }).then(); // sahifani to'ldirish uchun orqada (kutmasdan) yangilaymiz
		} catch (err: any) {
			setMyFavorites(prevList);
			setTotal(prevTotal);
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// mobil va desktop'da bir xil — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-favorites" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('My Favorites')}</Typography>
					<Typography className="sub-title">{t('Cars you liked, saved in one place.')}</Typography>
				</Stack>
			</Stack>
			<div className="favorites-list-box mp-grid">
				{myFavorites?.length ? (
					myFavorites?.map((car: Car) => {
						return <CarCard car={car} likeCarHandler={likeCarHandler} myFavorites={true} key={car?._id} />;
					})
				) : (
					<div className={'mp-empty'}>
						<span className={'mp-empty-icon'}>
							<FavoriteBorderRoundedIcon />
						</span>
						<strong>{t('No favorites yet')}</strong>
						<p>{t('Tap the heart on any car to save it here.')}</p>
						<Link href={'/car'} className={'mp-btn-link'}>
							{t('Browse cars')}
						</Link>
					</div>
				)}
			</div>
			{myFavorites?.length ? (
				<Stack className="pagination-config mp-pagination">
					<Pagination
						count={Math.ceil(total / searchFavorites.limit)}
						page={searchFavorites.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="mp-total">{t('Total {{count}} favorite cars', { count: total ?? 0 })}</Typography>
				</Stack>
			) : null}
		</div>
	);
};

export default MyFavorites;
