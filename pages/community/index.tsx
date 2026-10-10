import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab, Typography, Button, Pagination } from '@mui/material';
import CommunityCard from '../../libs/components/common/CommunityCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { T } from '../../libs/types/common';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { CATEGORY_KEYS, CATEGORY_META } from '../../libs/components/community/categories';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Community: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const { t } = useTranslation('common');
	const articleCategory = query?.articleCategory as string;
	const [searchCommunity, setSearchCommunity] = useState<BoardArticlesInquiry>(initialInput);
	const [boardArticles, setBoardArticles] = useState<BoardArticle[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	if (articleCategory) initialInput.search.articleCategory = articleCategory;

	/** APOLLO REQUESTS **/
	// maqolaga like bosish uchun mutatsiya
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	// tanlangan tab (FREE/NEWS/...) bo'yicha maqolalar ro'yxatini oladi
	const {
		loading: boardArticlesLoading,
		data: boardArticlesData,
		error: getBoardArticlesError,
		refetch: boardArticlesRefetch,
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchCommunity,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setBoardArticles(data?.getBoardArticles?.list);
			setTotalCount(data?.getBoardArticles?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	// sahifa birinchi ochilganda: URL'da ?articleCategory yo'q bo'lsa, standart "FREE" kategoriyasini URL'ga qo'shadi
	useEffect(() => {
		if (!query?.articleCategory)
			router.push(
				{
					pathname: router.pathname,
					query: { articleCategory: 'FREE' },
				},
				router.pathname,
				{ shallow: true },
			);
	}, []);

	/** HANDLERS **/
	// chap menyudagi tab (Free/Review/News/Tips) bosilganda: filtrni yangi kategoriyaga o'zgartiradi va URL'ni yangilaydi
	const tabChangeHandler = async (e: T, value: string) => {
		console.log(value);

		setSearchCommunity({ ...searchCommunity, page: 1, search: { articleCategory: value as BoardArticleCategory } });
		await router.push(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			router.pathname,
			{ shallow: true },
		);
	};

	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, searchCommunity o'zgargani uchun useQuery qayta so'raydi
	const paginationHandler = (e: T, value: number) => {
		setSearchCommunity({ ...searchCommunity, page: value });
	};

	// maqolaga like bosish: sahifaga o'tishni to'xtatadi (stopPropagation), login tekshiradi, mutatsiya yuboradi
	const likeArticleHandler = async (e: any, user: any, id: string) => {
		try {
			e.stopPropagation();
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetBoardArticle({
				variables: {
					input: id,
				},
			});
			await boardArticlesRefetch({ input: searchCommunity });
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** RENDER **/
	const activeCategory: string = searchCommunity.search.articleCategory ?? 'FREE';
	const activeMeta = CATEGORY_META[activeCategory] ?? CATEGORY_META.FREE;

	// "Write" tugmasi: avvalgidek mypage'dagi maqola yozish bo'limiga o'tkazadi
	const goWritePage = () =>
		router.push({
			pathname: '/mypage',
			query: {
				category: 'writeArticle',
			},
		});

	// kategoriya tablari (desktop'da vertikal menyu, mobilda gorizontal chip'lar)
	const categoryTabs = (orientation: 'vertical' | 'horizontal') => (
		<TabList
			orientation={orientation}
			variant={orientation === 'horizontal' ? 'scrollable' : 'standard'}
			scrollButtons={false}
			aria-label="community categories"
			TabIndicatorProps={{
				style: { display: 'none' },
			}}
			onChange={tabChangeHandler}
			className={'cm-tabs'}
		>
			{CATEGORY_KEYS.map((key: string) => {
				const Icon = CATEGORY_META[key].icon;
				return (
					<Tab
						key={key}
						value={key}
						icon={<Icon />}
						iconPosition="start"
						label={t(CATEGORY_META[key].label)}
						className={`tab-button ${activeCategory == key ? 'active' : ''}`}
					/>
				);
			})}
		</TabList>
	);

	// maqolalar ro'yxati — har bir kategoriya uchun alohida TabPanel (avvalgidek)
	const panels = CATEGORY_KEYS.map((key: string) => (
		<TabPanel value={key} key={key} className={'cm-panel'}>
			<div className="list-box cm-grid">
				{totalCount ? (
					boardArticles?.map((boardArticle: BoardArticle) => {
						return (
							<CommunityCard
								boardArticle={boardArticle}
								key={boardArticle?._id}
								likeArticleHandler={likeArticleHandler}
							/>
						);
					})
				) : (
					<div className={'cm-empty'}>
						<span className={'cm-empty-icon'}>
							<ForumRoundedIcon />
						</span>
						<strong>{t('No posts in {{category}} yet', { category: t(CATEGORY_META[key].label) })}</strong>
						<p>{t('Be the first to start a conversation.')}</p>
						<Button className={'cm-btn-primary'} onClick={goWritePage} startIcon={<EditRoundedIcon />}>
							{t('Write the first post')}
						</Button>
					</div>
				)}
			</div>
		</TabPanel>
	));

	// sahifalash — logika o'zgarmagan
	const pagination =
		totalCount > 0 ? (
			<Stack className="cm-pagination">
				<Pagination
					count={Math.ceil(totalCount / searchCommunity.limit)}
					page={searchCommunity.page}
					shape="circular"
					color="primary"
					onChange={paginationHandler}
				/>
				<Typography className="cm-total">
					{t('Total {{count}} articles available', { count: totalCount })}
				</Typography>
			</Stack>
		) : null;

	if (device === 'mobile') {
		return (
			<div id="community-list-page" className="cm-v2 cm-mobile">
				<TabContext value={activeCategory}>
					<div className="cm-head">
						<div>
							<h1 className="cm-title">{t('Community')}</h1>
							<p className="cm-sub">{t(activeMeta.sub)}</p>
						</div>
						<Button className={'cm-btn-primary cm-write-sm'} onClick={goWritePage} startIcon={<EditRoundedIcon />}>
							{t('Write')}
						</Button>
					</div>
					{categoryTabs('horizontal')}
					{panels}
					{pagination}
				</TabContext>
			</div>
		);
	} else {
		return (
			<div id="community-list-page" className="cm-v2">
				<div className="cm-wrap">
					<TabContext value={activeCategory}>
						<div className="cm-layout">
							<aside className="cm-side">
								<div className="cm-side-head">
									<span className="cm-eyebrow">Autore</span>
									<h2>{t('Community')}</h2>
									<p>{t('Talk cars, share reviews and pick up tips from other drivers.')}</p>
								</div>
								{categoryTabs('vertical')}
								<Button className={'cm-btn-primary cm-write'} onClick={goWritePage} startIcon={<EditRoundedIcon />}>
									{t('Write a post')}
								</Button>
							</aside>

							<section className="cm-main">
								<header className="cm-head">
									<div>
										<h1 className="cm-title">{t(activeMeta.label)}</h1>
										<p className="cm-sub">{t(activeMeta.sub)}</p>
									</div>
									{totalCount > 0 && (
										<span className="cm-count">{t('{{count}} posts', { count: totalCount })}</span>
									)}
								</header>
								{panels}
								{pagination}
							</section>
						</div>
					</TabContext>
				</div>
			</div>
		);
	}
};

Community.defaultProps = {
	initialInput: {
		page: 1,
		limit: 6,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			articleCategory: 'FREE',
		},
	},
};

export default withLayoutBasic(Community);
