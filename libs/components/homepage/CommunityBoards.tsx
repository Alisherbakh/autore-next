import React, { useState } from 'react';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import CommunityCard from './CommunityCard';
import { BoardArticle } from '../../types/board-article/board-article';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { useQuery } from '@apollo/client';
import { T } from '../../types/common';

const CommunityBoards = () => {
	const device = useDeviceDetect();
	const [searchCommunity, setSearchCommunity] = useState({
		page: 1,
		sort: 'articleViews',
		direction: 'DESC',
	});
	const [newsArticles, setNewsArticles] = useState<BoardArticle[]>([]);
	const [freeArticles, setFreeArticles] = useState<BoardArticle[]>([]);

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
		return <div>COMMUNITY BOARDS (MOBILE)</div>;
	} else {
		return (
			<Stack className={'community-board'}>
				<Stack className={'container'}>
					<Stack>
						<Typography variant={'h1'}>COMMUNITY BOARD HIGHLIGHTS</Typography>
					</Stack>
					<Stack className="community-main">
						<Stack className={'community-left'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=NEWS'}>
									<span>News</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap'}>
								{newsArticles.map((article, index) => {
									return <CommunityCard vertical={true} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
						<Stack className={'community-right'}>
							<Stack className={'content-top'}>
								<Link href={'/community?articleCategory=FREE'}>
									<span>Free</span>
								</Link>
								<img src="/img/icons/arrowBig.svg" alt="" />
							</Stack>
							<Stack className={'card-wrap vertical'}>
								{freeArticles.map((article, index) => {
									return <CommunityCard vertical={false} article={article} index={index} key={article?._id} />;
								})}
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default CommunityBoards;
