import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import CommunityCard from '../common/CommunityCard';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { BoardArticlesInquiry } from '../../types/board-article/board-article.input';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { optimisticLikeInList } from '../../optimistic';

const MemberArticles: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const router = useRouter();
	const [total, setTotal] = useState<number>(0);
	const { memberId } = router.query;
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [memberBoArticles, setMemberBoArticles] = useState<BoardArticle[]>([]);

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_BOARD_ARTICLE — apollo/user/mutation.ts dan; maqolaga like bosish/olib tashlash uchun mutatsiya
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	// GET_BOARD_ARTICLES — apollo/user/query.ts dan; ko'rilayotgan a'zoning yozgan maqolalari ro'yxatini oladi
	const {
		loading: boardArticlesLoading, // so'rov hali javob kutayotganini bildiradi
		data: boardArticles, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getBoardArticlesError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: boardArticlesRefetch, // shu so'rovni qo'lda qayta yuborish (like bosgandan keyin)
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: {
			input: searchFilter, // qaysi a'zo (memberId) va sahifalash shu orqali yuboriladi
		},
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: any) => {
			setMemberBoArticles(data?.getBoardArticles?.list); // kelgan maqolalar ro'yxatini state'ga yozadi
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total || 0); // umumiy sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// URL'dagi memberId o'zgarganda (masalan boshqa a'zoning profiliga o'tilganda) filtrni yangi a'zoga moslashtiradi
	useEffect(() => {
		if (memberId) setSearchFilter({ ...initialInput, search: { memberId: memberId } });
	}, [memberId]);

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, searchFilter o'zgargani uchun useQuery qayta so'raydi
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	// CommunityCard'dagi like ikonkasi bosilganda ishga tushadi
	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation(); // karta o'ziga bosilgandek sahifaga o'tib ketmasligi uchun
			if (!id) return;
			if (!user?._id) throw new Error(Messages.error2);
			// optimistic: yurakcha va son DARHOL o'zgaradi, so'rov orqada ketadi (xato bo'lsa avvalgi holatga qaytadi)
			await optimisticLikeInList(
				setMemberBoArticles,
				id,
				'articleLikes',
				() => likeTargetBoardArticle({ variables: { input: id } }),
				'likeTargetBoardArticle',
			);
		} catch (err: any) {
			console.log('ERROR, likeArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		// mobil: CommunityCard'lar bir ustunda
		return (
			<div id="mp-member-articles" className={'mp-section'}>
				<div className="mp-grid">
					{memberBoArticles?.length === 0 && (
						<div className={'mp-empty'}>
							<strong>{t('No posts yet')}</strong>
						</div>
					)}
					{memberBoArticles?.map((boardArticle: BoardArticle) => {
						return (
							<CommunityCard
								boardArticle={boardArticle}
								likeArticleHandler={likeArticleHandler}
								key={boardArticle?._id}
							/>
						);
					})}
				</div>
				{memberBoArticles?.length !== 0 && (
					<Stack className="mp-pagination">
						<Pagination
							count={Math.ceil(total / searchFilter.limit) || 1}
							page={searchFilter.page}
							shape="circular"
							color="primary"
							onChange={paginationHandler}
						/>
						<Typography className="mp-total">{t('Total {{count}} articles available', { count: total })}</Typography>
					</Stack>
				)}
			</div>
		);
	} else {
		return (
			<div id="member-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Articles</Typography>
					</Stack>
				</Stack>
				<Stack className="articles-list-box">
					{memberBoArticles?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
					{memberBoArticles?.map((boardArticle: BoardArticle) => {
						return (
							<CommunityCard
								boardArticle={boardArticle}
								likeArticleHandler={likeArticleHandler}
								key={boardArticle?._id}
								size={'small'}
							/>
						);
					})}
				</Stack>
				{memberBoArticles?.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(total / searchFilter.limit) || 1}
								page={searchFilter.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} car available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
};

MemberArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MemberArticles;
