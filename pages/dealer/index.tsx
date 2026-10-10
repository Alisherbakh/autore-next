import React, { ChangeEvent, MouseEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Button, Pagination } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useTranslation } from 'next-i18next';
import DealerCard from '../../libs/components/common/DealerCard';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Member } from '../../libs/types/member/member';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_DEALERS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Messages } from '../../libs/config';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DealerList: NextPage = ({ initialInput, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [filterSortName, setFilterSortName] = useState('Recent');
	const [sortingOpen, setSortingOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [searchFilter, setSearchFilter] = useState<any>(
		router?.query?.input ? JSON.parse(router?.query?.input as string) : initialInput,
	);
	const [dealers, setDealers] = useState<Member[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	// backend'ga dealerga like bosish uchun mutatsiya (LIKE_TARGET_MEMBER)
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	// dealerlar ro'yxatini backend'dan olib keladi, filtr (searchFilter) o'zgarganda qayta so'raladi
	const {
		loading: getDealersLoading,
		data: getDealersData,
		error: getDealersError,
		refetch: getDealersRefetch,
	} = useQuery(GET_DEALERS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDealers(data?.getDealers?.list);
			setTotal(data?.getDealers?.metaCounter[0]?.total);
		},
	});

	/** LIFECYCLES **/
	// sahifa yuklanganda yoki URL o'zgarganda ishga tushadi: agar URL'da ?input=... bo'lsa
	// filtrni o'shandan o'qiydi, bo'lmasa boshlang'ich filtrni URL'ga yozadi; sahifa raqamini ham shunga moslaydi
	useEffect(() => {
		if (router.query.input) {
			const input_obj = JSON.parse(router?.query?.input as string);
			setSearchFilter(input_obj);
		} else
			router.replace(`/dealer?input=${JSON.stringify(searchFilter)}`, `/dealer?input=${JSON.stringify(searchFilter)}`);

		setCurrentPage(searchFilter.page === undefined ? 1 : searchFilter.page);
	}, [router]);

	/** HANDLERS **/
	// "Sort by" tugmasi bosilganda saralash menyusini ochadi
	const sortingClickHandler = (e: MouseEvent<HTMLElement>) => {
		setAnchorEl(e.currentTarget);
		setSortingOpen(true);
	};

	// saralash menyusini yopadi
	const sortingCloseHandler = () => {
		setSortingOpen(false);
		setAnchorEl(null);
	};

	// menyudan saralash turi (Recent/Oldest/Likes/Views) tanlanganda: searchFilter.sort/direction'ni yangilaydi
	const sortingHandler = (e: React.MouseEvent<HTMLLIElement>) => {
		switch (e.currentTarget.id) {
			case 'recent':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'DESC' });
				setFilterSortName('Recent');
				break;
			case 'old':
				setSearchFilter({ ...searchFilter, sort: 'createdAt', direction: 'ASC' });
				setFilterSortName('Oldest order');
				break;
			case 'likes':
				setSearchFilter({ ...searchFilter, sort: 'memberLikes', direction: 'DESC' });
				setFilterSortName('Likes');
				break;
			case 'views':
				setSearchFilter({ ...searchFilter, sort: 'memberViews', direction: 'DESC' });
				setFilterSortName('Views');
				break;
		}
		setSortingOpen(false);
		setAnchorEl2(null);
	};

	// Pagination komponentidan chaqiriladi: yangi sahifa raqamini URL'ga yozadi va state'ni yangilaydi
	const paginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		await router.push(`/dealer?input=${JSON.stringify(searchFilter)}`, `/dealer?input=${JSON.stringify(searchFilter)}`, {
			scroll: false,
		});
		setCurrentPage(value);
	};

	// dealerga like bosish: login tekshiradi, mutatsiya yuboradi, ro'yxatni yangilaydi
	const likeMemberHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});

			await getDealersRefetch({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** RENDER **/
	// saralash menyusi — desktop va mobil versiyada bir xil ishlatiladi
	const sortMenu = (
		<Menu
			anchorEl={anchorEl}
			open={sortingOpen}
			onClose={sortingCloseHandler}
			sx={{ paddingTop: '5px' }}
			className={'dl-sort-menu'}
		>
			<MenuItem onClick={sortingHandler} id={'recent'} disableRipple>
				{t('Recent')}
			</MenuItem>
			<MenuItem onClick={sortingHandler} id={'old'} disableRipple>
				{t('Oldest')}
			</MenuItem>
			<MenuItem onClick={sortingHandler} id={'likes'} disableRipple>
				{t('Likes')}
			</MenuItem>
			<MenuItem onClick={sortingHandler} id={'views'} disableRipple>
				{t('Views')}
			</MenuItem>
		</Menu>
	);

	// qidiruv maydoni — logika o'zgarmagan: Enter bosilganda searchFilter.search.text yangilanadi
	const searchInput = (
		<label className={'dl-search'}>
			<SearchRoundedIcon />
			<input
				type="text"
				placeholder={t('Search for a dealer')}
				value={searchText}
				onChange={(e: any) => setSearchText(e.target.value)}
				onKeyDown={(event: any) => {
					if (event.key == 'Enter') {
						setSearchFilter({
							...searchFilter,
							search: { ...searchFilter.search, text: searchText },
						});
					}
				}}
			/>
			<kbd className={'dl-kbd'}>Enter</kbd>
		</label>
	);

	// kartalar: yuklanayotganda skeleton, bo'sh bo'lsa xabar, aks holda DealerCard'lar
	const cardList =
		getDealersLoading && !dealers?.length ? (
			Array.from({ length: 8 }).map((_, i: number) => (
				<div className={'dc-skeleton'} key={i} aria-hidden="true">
					<span className={'sk-photo'} />
					<span className={'sk-line'} />
					<span className={'sk-line short'} />
				</div>
			))
		) : dealers?.length === 0 ? (
			<div className={'dl-empty'}>
				<img src="/img/icons/icoAlert.svg" alt="" />
				<strong>{t('No dealers found')}</strong>
				<p>{t('Try a different name or check the spelling.')}</p>
			</div>
		) : (
			dealers.map((dealer: Member) => {
				return <DealerCard dealer={dealer} key={dealer._id} likeMemberHandler={likeMemberHandler} />;
			})
		);

	// sahifalash — logika o'zgarmagan
	const pagination = (
		<Stack className={'dl-pagination'}>
			{dealers.length !== 0 && Math.ceil(total / searchFilter.limit) > 1 && (
				<Stack className="pagination-box">
					<Pagination
						page={currentPage}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={paginationChangeHandler}
						shape="circular"
						color="primary"
					/>
				</Stack>
			)}
			{dealers.length !== 0 && <span>{t('Total {{count}} dealers available', { count: total })}</span>}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<Stack className={'dealer-list-page dl-v2 dl-mobile'}>
				<div className={'dl-head'}>
					<h1 className={'dl-title'}>{t('Dealers')}</h1>
					<p className={'dl-sub'}>{t('Find a trusted dealer and browse their cars.')}</p>
				</div>
				<div className={'dl-toolbar'}>
					{searchInput}
					<div className={'dl-sort'}>
						<span className={'dl-result'}>{total ? t('{{count}} dealers', { count: total }) : ''}</span>
						<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
							{t(filterSortName)}
						</Button>
						{sortMenu}
					</div>
				</div>
				<div className={'dl-grid'}>{cardList}</div>
				{pagination}
			</Stack>
		);
	} else {
		return (
			<Stack className={'dealer-list-page dl-v2'}>
				<div className={'dl-wrap'}>
					<div className={'dl-toolbar'}>
						<div className={'dl-toolbar-left'}>
							{searchInput}
							<span className={'dl-result'}>
								{total ? t('{{count}} dealers', { count: total }) : ''}
								{searchFilter?.search?.text ? ` · “${searchFilter.search.text}”` : ''}
							</span>
						</div>
						<div className={'dl-sort'}>
							<span>{t('Sort by')}</span>
							<Button onClick={sortingClickHandler} endIcon={<KeyboardArrowDownRoundedIcon />}>
								{t(filterSortName)}
							</Button>
							{sortMenu}
						</div>
					</div>
					<div className={'dl-grid'}>{cardList}</div>
					{pagination}
				</div>
			</Stack>
		);
	}
};

DealerList.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: {},
	},
};

export default withLayoutBasic(DealerList);
