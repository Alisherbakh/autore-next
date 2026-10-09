import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';
import CommunityCard from './CommunityCard';
import SectionHead from './SectionHead';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);
	// mobil: qaysi tab ochiq (News / Free Board)
	const [mobileTab, setMobileTab] = useState<'NEWS' | 'FREE'>('NEWS');

	/** APOLLO REQUESTS **/
	// GET_BOARD_ARTICLES — apollo/user/query.ts dan; "NEWS" kategoriyasidagi maqolalarni oladi (bosh sahifaning chap ustuni uchun)
	const {
		loading: getNewsArticlesLoading, // so'rov hali javob kutayotganini bildiradi
		data: getNewsArticlesData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getNewsArticlesError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getNewsArticlesRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: { ...searchCommunity, limit: 6, search: { articleCategory: BoardArticleCategory.NEWS } } }, // faqat NEWS kategoriyasi, 6 tagacha
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setNewsArticles(data?.getBoardArticles?.list); // kelgan NEWS maqolalarini state'ga yozadi
		},
	});

	// GET_BOARD_ARTICLES — xuddi shu so'rov, lekin "FREE" kategoriyasi uchun (bosh sahifaning o'ng ustuni uchun)
	const {
		loading: getFreeArticlesLoading, // so'rov hali javob kutayotganini bildiradi
		data: getFreeArticlesData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getFreeArticlesError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getFreeArticlesRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya
	} = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: { ...searchCommunity, limit: 3, search: { articleCategory: BoardArticleCategory.FREE } } }, // faqat FREE kategoriyasi, 3 tagacha
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setFreeArticles(data?.getBoardArticles?.list); // kelgan FREE maqolalarini state'ga yozadi
		},
	});

	if (device === 'mobile') {
		// mobil: News / Free Board tablari, ostida gorizontal kartalar ro'yxati
		const isNews = mobileTab === 'NEWS';
		const list = isNews ? newsArticles : freeArticles;
		const loading = isNews ? getNewsArticlesLoading : getFreeArticlesLoading;
		return (
			<section className={'m-sec m-community'} aria-labelledby={'m-community-title'}>
				<div className={'m-sec-head'}>
					<h2 id={'m-community-title'}>{t('Community')}</h2>
					<Link href={`/community?articleCategory=${mobileTab}`} className={'m-see'}>
						{t('See all')}
					</Link>
				</div>
				<div className={'m-segment'} role="tablist">
					<button type="button" role="tab" aria-selected={isNews} className={isNews ? 'is-active' : ''} onClick={() => setMobileTab('NEWS')}>
						{t('News')}
					</button>
					<button type="button" role="tab" aria-selected={!isNews} className={!isNews ? 'is-active' : ''} onClick={() => setMobileTab('FREE')}>
						{t('Free Board')}
					</button>
				</div>
				<div className={'m-community-list'} aria-busy={loading}>
					{loading && !list?.length && [0, 1, 2].map((i) => <div key={`sk-${i}`} className={'m-skeleton is-row'} aria-hidden="true" />)}
					{!loading && !list?.length && <p className={'m-empty'}>{isNews ? t('No news posts yet.') : t('No free board posts yet.')}</p>}
					{list?.map((article, index) => (
						<CommunityCard vertical={false} article={article} index={index} key={article?._id} />
					))}
				</div>
			</section>
		);
	} else {
		// yuklanayotganda skelet qatorlar, ro'yxat bo'sh bo'lsa — bo'sh holat matni
		const renderColumn = (articles: BoardArticle[], loading: boolean, vertical: boolean, emptyText: string) => {
			if (loading && !articles?.length) {
				return [0, 1, 2].map((i) => <div key={`sk-${i}`} className={'community-skeleton'} aria-hidden="true" />);
			}
			if (!articles?.length) {
				return <p className={'community-empty'}>{emptyText}</p>;
			}
			return articles.map((article, index) => (
				<CommunityCard vertical={vertical} article={article} index={index} key={article?._id} />
			));
		};

		return (
			<Stack component={'section'} className={'community-board hp-section'}>
				<Stack className={'container'}>
					<SectionHead title={t('Community Board Highlights')} sub={t('Most-read posts from the Autore community')} />
					<Stack className="community-main">
						<Stack className={'community-left'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=NEWS'}>
									<span>{t('News')}</span>
									<img src="/img/icons/arrowBig.svg" alt="" width={20} height={20} />
								</Link>
							</Stack>
							<Stack className={'card-wrap'} aria-busy={getNewsArticlesLoading}>
								{renderColumn(newsArticles, getNewsArticlesLoading, true, t('No news posts yet.'))}
							</Stack>
						</Stack>
						<Stack className={'community-right'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=FREE'}>
									<span>{t('Free')}</span>
									<img src="/img/icons/arrowBig.svg" alt="" width={20} height={20} />
								</Link>
							</Stack>
							<Stack className={'card-wrap vertical'} aria-busy={getFreeArticlesLoading}>
								{renderColumn(freeArticles, getFreeArticlesLoading, false, t('No free board posts yet.'))}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
