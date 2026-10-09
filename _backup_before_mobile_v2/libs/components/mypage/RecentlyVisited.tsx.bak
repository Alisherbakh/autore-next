import React, { useState } from 'react';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CarCard from '../car/CarCard';
import { Car } from '../../types/car/car';
import { T } from '../../types/common';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';

const RecentlyVisited: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [recentlyVisited, setRecentlyVisited] = useState<Car[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchVisited, setSearchVisited] = useState<T>({ page: 1, limit: 6 });

	/** APOLLO REQUESTS **/
	// GET_VISITED — apollo/user/query.ts dan; foydalanuvchi yaqinda ochib ko'rgan e'lonlar ro'yxatini backend'dan oladi
	const {
		loading: getVisitedLoading, // so'rov hali javob kutayotganini bildiradi
		data: getVisitedData, // backend javobi (getVisited obyekti shu ichida, lekin pastda onCompleted orqali ishlatilyapti)
		error: getVisitedError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getVisitedRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya
	} = useQuery(GET_VISITED, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: {
			input: searchVisited, // sahifalash (page/limit) ma'lumoti backend'ga shu orqali yuboriladi
		},
		onCompleted(data: T) {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setRecentlyVisited(data.getVisited?.list); // kelgan e'lonlar ro'yxatini state'ga yozadi
			setTotal(data.getVisited?.metaCounter?.[0]?.total || 0); // umumiy sonini state'ga yozadi (topilmasa 0)
		},
	});

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: bosilgan sahifa raqamini searchVisited.page'ga yozadi
	// (searchVisited o'zgargani uchun useQuery avtomatik qayta so'raydi)
	const paginationHandler = (e: T, value: number) => {
		setSearchVisited({ ...searchVisited, page: value });
	};

	// mobil va desktop'da bir xil — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-recent" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('Recently Visited')}</Typography>
					<Typography className="sub-title">{t('Cars you looked at recently.')}</Typography>
				</Stack>
			</Stack>
			<div className="favorites-list-box mp-grid">
				{recentlyVisited?.length ? (
					recentlyVisited?.map((car: Car) => {
						return <CarCard car={car} recentlyVisited={true} key={car?._id} />;
					})
				) : (
						<div className={'mp-empty'}>
							<span className={'mp-empty-icon'}>
								<HistoryRoundedIcon />
							</span>
							<strong>{t('Nothing here yet')}</strong>
							<p>{t('Cars you open will show up here.')}</p>
							<Link href={'/car'} className={'mp-btn-link'}>
								{t('Browse cars')}
							</Link>
						</div>
				)}
			</div>
			{recentlyVisited?.length ? (
				<Stack className="pagination-config mp-pagination">
					<Pagination
						count={Math.ceil(total / searchVisited.limit)}
						page={searchVisited.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="mp-total">{t('Total {{count}} recently visited cars', { count: total ?? 0 })}</Typography>
				</Stack>
			) : null}
		</div>
	);
};

export default RecentlyVisited;
