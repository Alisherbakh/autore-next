import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { Following } from '../../types/follow/follow';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';

interface MemberFollowingsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowings = (props: MemberFollowingsProps) => {
	const { initialInput, subscribeHandler,likeMemberHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'cars';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowings, setMemberFollowings] = useState<Following[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	// GET_MEMBER_FOLLOWINGS — apollo/user/query.ts dan; ko'rilayotgan foydalanuvchi obuna bo'lgan (following) a'zolar ro'yxatini oladi
	const {
		loading: getMemberFollowingsLoading, // so'rov hali javob kutayotganini bildiradi
		data: getMemberFollowingsData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getMemberFollowersError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getMemberFollowingsRefetch, // shu so'rovni qo'lda qayta yuborish (like/follow bosgandan keyin)
	} = useQuery(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: followInquiry }, // qaysi foydalanuvchi (followerId) va sahifalash shu orqali yuboriladi
		skip: !followInquiry?.search?.followerId, // followerId aniqlanmaguncha so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setMemberFollowings(data?.getMemberFollowings?.list); // kelgan followinglar ro'yxatini state'ga yozadi
			setTotal(data?.getMemberFollowings?.metaCounter[0]?.total); // umumiy sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// sahifa URL'i o'zgarganda (masalan boshqa a'zoning profiliga o'tilganda) ishga tushadi:
	// URL'da memberId bo'lsa o'sha a'zoning followinglarini, bo'lmasa o'zining followinglarini so'raydi
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followerId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followerId: user?._id } });
	}, [router]);

	// sahifalash yoki maqsadli foydalanuvchi (followerId) o'zgarganda ro'yxatni qayta so'raydi
	useEffect(() => {
		getMemberFollowingsRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi (yuqoridagi useEffect avtomatik qayta so'raydi)
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	// mobil va desktop'da bir xil — farqi stillarda (mypage va member sahifasida ishlatiladi)
	return (
		<div id="mp-followings" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">
						{category === 'followers' ? t('Followers') : t('Followings')}
					</Typography>
					<Typography className="sub-title">
						{category === 'followers' ? t('People who follow this profile.') : t('People this profile follows.')}
					</Typography>
				</Stack>
			</Stack>
			<Stack className="follows-list-box mp-people">
				{memberFollowings?.length === 0 && (
					<div className={'mp-empty'}>
						<span className={'mp-empty-icon'}>
							<PeopleAltRoundedIcon />
						</span>
						<strong>{t('Not following anyone yet')}</strong>
					</div>
				)}
				{memberFollowings.map((follower: Following) => {
					const imagePath: string = follower?.followingData?.memberImage
						? `${REACT_APP_API_URL}/${follower?.followingData?.memberImage}`
						: '/img/profile/defaultUser.svg';
					const liked = !!(follower?.meLiked && follower?.meLiked[0]?.myFavorite);
					return (
						<div className="follows-card-box mp-person" key={follower._id}>
							<div className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followingData?._id)}>
								<div className="image-box">
									<img src={imagePath} alt="" />
								</div>
								<div className="information-box">
									<Typography className="name">{follower?.followingData?.memberNick}</Typography>
									<span className="mp-person-meta">
										{t('{{count}} followers', { count: follower?.followingData?.memberFollowers ?? 0 })} ·{' '}
										{t('{{count}} following', { count: follower?.followingData?.memberFollowings ?? 0 })}
									</span>
								</div>
							</div>
							<div className={'details-box'}>
								<button
									type="button"
									className={`mp-like ${liked ? 'is-liked' : ''}`}
									onClick={() => likeMemberHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
									aria-label={liked ? t('Unlike') : t('Like')}
								>
									{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
									{follower?.followingData?.memberLikes ?? 0}
								</button>
							</div>
							{user?._id !== follower?.followingId && (
								<div className="action-box">
									{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
										<Button
											className={'mp-follow is-following'}
											onClick={() => unsubscribeHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
										>
											<span className={'label-on'}>{t('Following')}</span>
											<span className={'label-off'}>{t('Unfollow')}</span>
										</Button>
									) : (
										<Button
											className={'mp-follow'}
											onClick={() => subscribeHandler(follower?.followingData?._id, getMemberFollowingsRefetch, followInquiry)}
										>
											{t('Follow')}
										</Button>
									)}
								</div>
							)}
						</div>
					);
				})}
			</Stack>
			{memberFollowings.length !== 0 && (
				<Stack className="pagination-config mp-pagination">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<Typography className="mp-total">{t('{{count}} following', { count: total ?? 0 })}</Typography>
				</Stack>
			)}
		</div>
	);
};

MemberFollowings.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followerId: '',
		},
	},
};

export default MemberFollowings;
