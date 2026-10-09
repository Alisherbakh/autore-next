import React, { ChangeEvent, useEffect, useState } from 'react';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
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

	if (device === 'mobile') {
		return <div>AUTORE FOLLOWS MOBILE</div>;
	} else {
		return (
			<div id="member-follows-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">{category === 'followers' ? 'Followers' : 'Followings'}</Typography>
					</Stack>
				</Stack>
				<Stack className="follows-list-box">
					<Stack className="listing-title-box">
						<Typography className="title-text">Name</Typography>
						<Typography className="title-text">Details</Typography>
						<Typography className="title-text">Subscription</Typography>
					</Stack>
					{memberFollowers?.length === 0 && (
						<div className={'no-data'}>
							<img src="/img/icons/icoAlert.svg" alt="" />
							<p>No Followers yet!</p>
						</div>
					)}
					{memberFollowers.map((follower: Follower) => {
						const imagePath: string = follower?.followerData?.memberImage
							? `${REACT_APP_API_URL}/${follower?.followerData?.memberImage}`
							: '/img/profile/defaultUser.svg';
						return (
							<Stack className="follows-card-box" key={follower._id}>
								<Stack className={'info'} onClick={() => redirectToMemberPageHandler(follower?.followerData?._id)}>
									<Stack className="image-box">
										<img src={imagePath} alt="" />
									</Stack>
									<Stack className="information-box">
										<Typography className="name">{follower?.followerData?.memberNick}</Typography>
									</Stack>
								</Stack>
								<Stack className={'details-box'}>
									<Box className={'info-box'} component={'div'}>
										<p>Followers</p>
										<span>({follower?.followerData?.memberFollowers})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										<p>Followings</p>
										<span>({follower?.followerData?.memberFollowings})</span>
									</Box>
									<Box className={'info-box'} component={'div'}>
										{follower?.meLiked && follower?.meLiked[0]?.myFavorite ? (
											<FavoriteIcon
												style={{ color: LIKED_COLOR }}
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
												}
											/>
										) : (
											<FavoriteBorderIcon
												onClick={() =>
													likeMemberHandler(follower?.followerData?._id, getMemberFollowersRefetch, followInquiry)
												}
											/>
										)}
										<span>({follower?.followerData?.memberLikes})</span>
									</Box>
								</Stack>
								{user?._id !== follower?.followerId && (
									<Stack className="action-box">
										{follower.meFollowed && follower.meFollowed[0]?.myFollowing ? (
											<>
												<Typography>Following</Typography>
												<Button
													variant="outlined"
													sx={{ background: '#FFFFFF', color: '#23262F', borderColor: '#E3E1DA', ':hover': { background: '#EEF1F7', borderColor: '#23262F' } }}
													onClick={() => unsubscribeHandler(follower?.followerData?._id, null, followInquiry)}
												>
													Unfollow
												</Button>
											</>
										) : (
											<Button
												variant="contained"
												sx={{ background: '#0057FF', color: '#FFFFFF', ':hover': { background: '#0047D1' } }}
												onClick={() => subscribeHandler(follower?.followerData?._id, null, followInquiry)}
											>
												Follow
											</Button>
										)}
									</Stack>
								)}
							</Stack>
						);
					})}
				</Stack>
				{memberFollowers.length !== 0 && (
					<Stack className="pagination-config">
						<Stack className="pagination-box">
							<Pagination
								page={followInquiry.page}
								count={Math.ceil(total / followInquiry.limit)}
								onChange={paginationHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<Stack className="total-result">
							<Typography>{total} followers</Typography>
						</Stack>
					</Stack>
				)}
			</div>
		);
	}
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
