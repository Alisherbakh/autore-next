import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Pagination, Stack, Typography } from '@mui/material';
import CommunityCard from '../common/CommunityCard';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { BoardArticle } from '../../types/board-article/board-article';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyArticles: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const [searchCommunity, setSearchCommunity] = useState({
		...initialInput,
		search: { memberId: user._id },
	});
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_BOARD_ARTICLE — apollo/user/mutation.ts dan; maqolaga like bosish/olib tashlash uchun mutatsiya
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	// GET_BOARD_ARTICLES — apollo/user/query.ts dan; tizimga kirgan foydalanuvchining o'z yozgan maqolalari ro'yxatini oladi
	const {
		loading: boardArticlesLoading, // so'rov hali javob kutayotganini bildiradi
		data: boardArticlesData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getBoardArticlesError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: boardArticlesRefetch, // shu so'rovni qo'lda qayta yuborish (masalan like bosgandan keyin)
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: {
			input: searchCommunity, // search.memberId = joriy foydalanuvchi, shuning uchun faqat o'z maqolalari keladi
		},
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted(data: T) {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setBoardArticles(data?.getBoardArticles?.list); // kelgan maqolalar ro'yxatini state'ga yozadi
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total); // umumiy sonini state'ga yozadi
		},
	});

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, searchCommunity o'zgargani uchun useQuery qayta so'raydi
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	// CommunityCard'dagi like ikonkasi bosilganda ishga tushadi
	const likeBoArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation(); // karta o'ziga bosilgandek sahifaga o'tib ketmasligi uchun hodisani to'xtatadi
			if (!id) return; // maqola id'si bo'lmasa, davom etmaydi
			if (!user?._id) throw new Error(Messages.error2); // login qilinmagan bo'lsa xato chiqaradi

			await likeTargetBoardArticle({
				variables: {
					input: id, // like bosilayotgan maqolaning ID'si
				},
			});
			await boardArticlesRefetch({ input: searchCommunity }); // ro'yxatni yangilaydi (like soni yangilanishi uchun)

			await sweetTopSmallSuccessAlert('Success!', 750); // qisqa muvaffaqiyat xabari (750ms)
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	if (device === 'mobile') {
		return <>ARTICLE PAGE MOBILE</>;
	} else
		return (
			<div id="my-articles-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">Article</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="article-list-box">
					{boardArticles?.length > 0 ? (
						boardArticles?.map((boardArticle: BoardArticle) => {
							return <CommunityCard 
							boardArticle={boardArticle} 
							key={boardArticle?._id} 
							size={'small'}
							likeArticleHandler={likeBoArticleHandler}
							/>;
						})
					) : (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Articles found!</p>
						</div>
					)}
				</Stack>

				{boardArticles?.length > 0 && (
					<Stack className="pagination-conf">
						<Stack className="pagination-box">
							<Pagination
								count={Math.ceil(totalCount / searchCommunity.limit)}
								page={searchCommunity.page}
								shape="circular"
								color="primary"
								onChange={paginationHandler}
							/>
						</Stack>
						<Stack className="total">
							<Typography>Total {totalCount ?? 0} article(s) available</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
};

MyArticles.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default MyArticles;
