import React, { useState } from 'react';
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
		try {
			if (!id) return; // e'lon id'si bo'lmasa, davom etmaydi
			if (!user._id) throw new Error(Messages.error2); // login qilinmagan bo'lsa xato chiqaradi ("Please login first!")

			await likeTargetCar({
				variables: {
					input: id, // like bosilayotgan e'lonning ID'si
				},
			});
			// bu sahifa faqat "sevimlilar"ni ko'rsatgani uchun, like bosish odatda uni ro'yxatdan chiqarib yuboradi —
			// shuning uchun ro'yxatni backend'dan qayta so'raymiz, u holda o'chgan element ekranda ham yo'qoladi
			await getFavoritesRefetch({ input: searchFavorites });
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message); // konsolga xato matnini chiqaradi
			sweetMixinErrorAlert(err.message).then(); // foydalanuvchiga alert ko'rsatadi
		}
	};

	if (device === 'mobile') {
		return <div>AUTORE MY FAVORITES MOBILE</div>;
	} else {
		return (
			<div id="my-favorites-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Favorites</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="favorites-list-box">
					{myFavorites?.length ? (
						myFavorites?.map((car: Car) => {
							return <CarCard car={car} likeCarHandler={likeCarHandler} myFavorites={true} />;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Favorites found!</p>
						</div>
					)}
				</Stack>
				{myFavorites?.length ? (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFavorites.limit)}
								page={searchFavorites.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>
								Total {total} favorite car{total > 1 ? 's' : ''}
							</Typography>
						</Stack>
					</Stack>
				) : null}
			</div>
		);
	}
};

export default MyFavorites;
