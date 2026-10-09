import React, { useState } from 'react';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
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
	const { t } = useTranslation('common');
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

	// mobil va desktop'da bir xil — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-articles" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('Articles')}</Typography>
					<Typography className="sub-title">{t('Posts you have shared with the community.')}</Typography>
				</Stack>
			</Stack>
			<div className="article-list-box mp-grid">
				{boardArticles?.length > 0 ? (
					boardArticles?.map((boardArticle: BoardArticle) => {
						return (
							<CommunityCard
								boardArticle={boardArticle}
								key={boardArticle?._id}
								likeArticleHandler={likeBoArticleHandler}
							/>
						);
					})
				) : (
						<div className={'mp-empty'}>
							<span className={'mp-empty-icon'}>
								<ArticleRoundedIcon />
							</span>
							<strong>{t('No posts yet')}</strong>
							<p>{t('Share a story, a review or a tip with other drivers.')}</p>
							<Link href={'/mypage?category=writeArticle'} className={'mp-btn-link'}>
								{t('Write a post')}
							</Link>
						</div>
				)}
			</div>
			{boardArticles?.length > 0 ? (
				<Stack className="pagination-config mp-pagination">
					<Pagination
						count={Math.ceil(totalCount / searchCommunity.limit)}
						page={searchCommunity.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
					<Typography className="mp-total">{t('Total {{count}} articles available', { count: totalCount ?? 0 })}</Typography>
				</Stack>
			) : null}
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
