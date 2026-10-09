import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Pagination, Stack, Typography } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { useTranslation } from 'next-i18next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { useRouter } from 'next/router';
import { FollowInquiry } from '../../types/follow/follow.input';
import { useQuery, useReactiveVar } from '@apollo/client';
import { GET_MEMBER_FOLLOWERS } from '../../../apollo/user/query';
import { Follower } from '../../types/follow/follow';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { userVar } from '../../../apollo/store';
import { T } from '../../types/common';

interface MemberFollowsProps {
	initialInput: FollowInquiry;
	subscribeHandler: any;
	unsubscribeHandler: any;
	likeMemberHandler: any;
	redirectToMemberPageHandler: any;
}

const MemberFollowers = (props: MemberFollowsProps) => {
	const { initialInput,likeMemberHandler, subscribeHandler, unsubscribeHandler, redirectToMemberPageHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [total, setTotal] = useState<number>(0);
	const category: any = router.query?.category ?? 'cars';
	const [followInquiry, setFollowInquiry] = useState<FollowInquiry>(initialInput);
	const [memberFollowers, setMemberFollowers] = useState<Follower[]>([]);
	const user = useReactiveVar(userVar);

	/** APOLLO REQUESTS **/
	// GET_MEMBER_FOLLOWERS — apollo/user/query.ts dan; ko'rilayotgan foydalanuvchini kuzatib turgan (follower) a'zolar ro'yxatini oladi
	const {
		loading: getMemberFollowersLoading, // so'rov hali javob kutayotganini bildiradi
		data: getMemberFollowersData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getMemberFollowersError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getMemberFollowersRefetch, // shu so'rovni qo'lda qayta yuborish (like/follow bosgandan keyin)
	} = useQuery(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: followInquiry }, // qaysi foydalanuvchi (followingId) va sahifalash shu orqali yuboriladi
		skip: !followInquiry?.search?.followingId, // followingId aniqlanmaguncha so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			// so'rov muvaffaqiyatli tugagach avtomatik ishga tushadi
			setMemberFollowers(data?.getMemberFollowers?.list); // kelgan followerlar ro'yxatini state'ga yozadi
			setTotal(data?.getMemberFollowers?.metaCounter[0]?.total); // umumiy sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// sahifa URL'i o'zgarganda (masalan boshqa a'zoning profiliga o'tilganda) ishga tushadi:
	// URL'da memberId bo'lsa o'sha a'zoning followerlarini, bo'lmasa o'zining followerlarini so'raydi
	useEffect(() => {
		if (router.query.memberId)
			setFollowInquiry({ ...followInquiry, search: { followingId: router.query.memberId as string } });
		else setFollowInquiry({ ...followInquiry, search: { followingId: user?._id } });
	}, [router]);

	// sahifalash yoki maqsadli foydalanuvchi (followingId) o'zgarganda ro'yxatni qayta so'raydi
	useEffect(() => {
		getMemberFollowersRefetch({ input: followInquiry }).then();
	}, [followInquiry]);

	/** HANDLERS **/
	// Pagination komponentidan chaqiriladi: sahifa raqamini yozadi (yuqoridagi useEffect avtomatik qayta so'raydi)
	const paginationHandler = async (event: ChangeEvent<unknown>, value: number) => {
		followInquiry.page = value;
		setFollowInquiry({ ...followInquiry });
	};

	// mobil va desktop'da bir xil — farqi stillarda (mypage va member sahifasida ishlatiladi)
	return (
		<div id="mp-followers" className={'mp-section'}>
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
				{memberFollowers?.length === 0 && (
					<div className={'mp-empty'}>
						<span className={'mp-empty-icon'}>
							<PeopleAltRoundedIcon />
						</span>
						<strong>{t('No followers yet')}</strong>
					</div>
				)}
				{memberFollowers.map((follower: Follower) => {
					const imagePath: string = follower?.followerData?.memberImage
						? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
						: '/img/profile/defaultUser.svg';
					const liked = !!(follower?.meLiked && follower?.meLiked[0]?.myFavorite);
					return (
						<div className="follows-card-box mp-person" key={follower._id}>
							<div className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
								<div className="image-box">
									<img src={imagePath} alt="" />
								</div>
								<div className="information-box">
									<Typography className="name">{follower?.followerData?.memberNick}</Typography>
									<span className="mp-person-meta">
										{t('{{count}} followers', { count: follower?.followerData?.memberFollowers ?? 0 })} ·{' '}
										{t('{{count}} following', { count: follower?.followerData?.memberFollowings ?? 0 })}
									</span>
								</div>
							</div>
							<div className={'details-box'}>
								<button
									type="button"
									className={`mp-like ${liked ? 'is-liked' : ''}`}
									onClick={() => likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)}
									aria-label={liked ? t('Unlike') : t('Like')}
								>
									{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
									{follower?.followerData?.memberLikes ?? 0}
								</button>
							</div>
							{user?._id !== follower?.followerId && (
								<div className="action-box">
									{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
										<Button
											className={'mp-follow is-following'}
											onClick={() => unsubscribeHandler(follower?.followerData?._id, null, followInquiry)}
										>
											<span className={'label-on'}>{t('Following')}</span>
											<span className={'label-off'}>{t('Unfollow')}</span>
										</Button>
									) : (
										<Button
											className={'mp-follow'}
											onClick={() => subscribeHandler(follower?.followerData?._id, null, followInquiry)}
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
			{memberFollowers.length !== 0 && (
				<Stack className="pagination-config mp-pagination">
					<Pagination
						page={followInquiry.page}
						count={Math.ceil(total / followInquiry.limit)}
						onChange={paginationHandler}
						shape="circular"
						color="primary"
					/>
					<Typography className="mp-total">{t('{{count}} followers', { count: total ?? 0 })}</Typography>
				</Stack>
			)}
		</div>
	);
};

MemberFollowers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		search: {
			followingId: '',
		},
	},
};

export default MemberFollowers;
