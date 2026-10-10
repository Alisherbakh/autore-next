import React, { ChangeEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CarBigCard from '../../libs/components/common/CarBigCard';
import ReviewCard from '../../libs/components/dealer/ReviewCard';
import { Box, Button, Pagination, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import DirectionsCarRoundedIcon from '@mui/icons-material/DirectionsCarRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import Moment from 'react-moment';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { CREATE_COMMENT, LIKE_TARGET_CAR, LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_CARS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { useRouter } from 'next/router';
import { Car } from '../../libs/types/car/car';
import { Member } from '../../libs/types/member/member';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { userVar } from '../../apollo/store';
import { CarsInquiry } from '../../libs/types/car/car.input';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { LIKED_COLOR, Messages, REACT_APP_API_URL } from '../../libs/config';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// rasm bo'lmasa: nickdan 1–2 harf (DealerCard'dagi bilan bir xil)
const getInitials = (name: string = ''): string => {
	const parts = name.split(/[\s_.-]+/).filter(Boolean);
	const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
	return letters.toUpperCase() || 'D';
};

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const DealerDetail: NextPage = ({ initialInput, initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [dealerId, setDealerId] = useState<string | null>(null);
	const [dealer, setDealer] = useState<Member | null>(null);
	const [searchFilter, setSearchFilter] = useState<CarsInquiry>(initialInput);
	const [dealerCars, setDealerCars] = useState<Car[]>([]);
	const [carTotal, setCarTotal] = useState<number>(0);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [dealerComments, setDealerComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.MEMBER,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	// izoh (review) qoldirish uchun mutatsiya
	const [createComment] = useMutation(CREATE_COMMENT);
	// e'longa like bosish uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	// dealerni follow / unfollow qilish uchun mutatsiyalar (MemberPage'dagi bilan bir xil)
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	// dealerning o'ziga like bosish uchun mutatsiya (/dealer sahifasidagi bilan bir xil)
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	// URL'dagi dealerId bo'yicha dealerning o'zini oladi, shu javob ichidan
	// car va comment so'rovlari uchun filtrlarni ham to'ldiradi
	const {
		loading: getMemberLoading,
		data: getMemberData,
		error: getMemberError,
		refetch: getMemberRefetch,
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: dealerId },
		skip: !dealerId,
		onCompleted: (data: T) => {
			setDealer(data?.getMember);
			setSearchFilter({
				...searchFilter,
				search: {
					memberId: data?.getMember?._id,
				},
			});
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: data?.getMember?._id,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: data?.getMember?._id,
			});
		},
	});

	// dealerga tegishli e'lonlar ro'yxatini oladi (searchFilter.memberId aniqlanguncha kutadi)
	const {
		loading: getCarsLoading,
		data: getCarsData,
		error: getCarsError,
		refetch: getCarsRefetch,
	} = useQuery(GET_CARS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		skip: !searchFilter.search.memberId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDealerCars(data?.getCars?.list);
			setCarTotal(data?.getCars?.metaCounter[0]?.total ?? 0);
		},
	});

	// dealerga yozilgan izohlar (review) ro'yxatini oladi
	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: { input: commentInquiry },
		skip: !commentInquiry.search.commentRefId,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setDealerComments(data?.getComments?.list);
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (router.query.dealerId) setDealerId(router.query.dealerId as string);
	}, [router]);

	// filtr (sahifalash) o'zgarganda e'lonlar ro'yxatini qayta so'raydi
	useEffect(() => {
		if (searchFilter.search.memberId) {
			getCarsRefetch({ variables: { input: searchFilter } }).then();
		}
	}, [searchFilter]);

	// izohlar sahifasi o'zgarganda izohlarni qayta so'raydi
	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ variables: { input: commentInquiry } }).then();
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	// muallif/dealer ismi bosilganda: o'zi bo'lsa mypage'ga, aks holda uning profil sahifasiga o'tkazadi
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	// e'lonlar Pagination komponentidan chaqiriladi: sahifa raqamini yozadi
	// (yuqoridagi useEffect searchFilter o'zgarishini kuzatib avtomatik qayta so'raydi)
	const carPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		searchFilter.page = value;
		setSearchFilter({ ...searchFilter });
	};

	// izohlar Pagination komponentidan chaqiriladi: sahifa raqamini yozadi
	// (yuqoridagi useEffect commentInquiry o'zgarishini kuzatib avtomatik qayta so'raydi)
	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	// izoh (review) yozish: login va o'z-o'ziga review yozishni tekshiradi, keyin yuboradi
	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			if (user._id === dealerId) throw new Error('Cannot write a review for yourself');
			await createComment({
				variables: {
					input: insertCommentData,
				},
			});

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// e'longa like bosish: login tekshiradi, mutatsiya yuboradi, ro'yxatni yangilaydi
	const likeCarHandler = async (user: any, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetCar({
				variables: {
					input: id,
				},
			});
			const result = await getCarsRefetch({ input: searchFilter });
			// refetch natijasi bilan kartalarni darhol yangilaymiz (like rangi va soni)
			if (result?.data?.getCars?.list) setDealerCars(result.data.getCars.list);
		} catch (err: any) {
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// dealerni follow qilish (MemberPage'dagi subscribeHandler bilan bir xil tartib),
	// so'ng dealer ma'lumotini qayta olib, tugma holati va followers sonini yangilaydi
	const subscribeHandler = async (id: string) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			const result = await getMemberRefetch({ input: id });
			if (result?.data?.getMember) setDealer(result.data.getMember);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// follow'ni bekor qilish, so'ng dealer ma'lumotini yangilaydi
	const unsubscribeHandler = async (id: string) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			const result = await getMemberRefetch({ input: id });
			if (result?.data?.getMember) setDealer(result.data.getMember);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// dealerga like bosish: login tekshiradi, mutatsiya yuboradi, dealer ma'lumotini yangilaydi
	const likeMemberHandler = async (id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			const result = await getMemberRefetch({ input: id });
			if (result?.data?.getMember) setDealer(result.data.getMember);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	/** RENDER **/
	const dealerName: string = dealer?.memberFullName || dealer?.memberNick || '';
	const dealerImage: string | null = dealer?.memberImage ? `${REACT_APP_API_URL}/${dealer?.memberImage}` : null;
	const isMyself: boolean = !!user?._id && user?._id === dealer?._id;
	const isFollowing: boolean = !!dealer?.meFollowed?.[0]?.myFollowing;
	const isLiked: boolean = !!dealer?.meLiked?.[0]?.myFavorite;

	// dealer "profil" kartasi: rasm, ism, manzil, tavsif, statistika va tugmalar (desktop + mobil)
	const dealerHero = (
		<section className={`dd-hero ${dealer ? '' : 'is-loading'}`}>
			<div className={'dd-avatar'}>
				{dealerImage ? (
					<img src={dealerImage} alt={dealerName} />
				) : (
					<span aria-hidden="true">{getInitials(dealer?.memberNick)}</span>
				)}
			</div>

			<div className={'dd-id'}>
				<div className={'dd-tags'}>
					<span className={'dd-badge'}>{t('DEALER')}</span>
					{dealer?.createdAt && (
						<span className={'dd-since'}>
							<CalendarMonthRoundedIcon />
							{t('Member since')} <Moment format={'MMM YYYY'}>{dealer.createdAt}</Moment>
						</span>
					)}
				</div>
				<h1 className={'dd-name'}>{dealerName || ' '}</h1>
				{dealer?.memberAddress && (
					<p className={'dd-address'}>
						<PlaceRoundedIcon />
						{dealer.memberAddress}
					</p>
				)}
				<p className={`dd-desc ${dealer?.memberDesc ? '' : 'is-empty'}`}>
					{dealer?.memberDesc || t('No description yet.')}
				</p>

				<div className={'dd-actions'}>
					{!isMyself &&
						(isFollowing ? (
							<Button
								className={'dd-btn dd-btn-following'}
								onClick={() => unsubscribeHandler(dealer?._id as string)}
								startIcon={<CheckRoundedIcon />}
							>
								<span className={'label-on'}>{t('Following')}</span>
								<span className={'label-off'}>{t('Unfollow')}</span>
							</Button>
						) : (
							<Button
								className={'dd-btn dd-btn-primary'}
								onClick={() => subscribeHandler(dealer?._id as string)}
								startIcon={<PersonAddAlt1RoundedIcon />}
							>
								{t('Follow')}
							</Button>
						))}
					<Button
						className={`dd-btn dd-btn-like ${isLiked ? 'is-liked' : ''}`}
						onClick={() => likeMemberHandler(dealer?._id as string)}
						startIcon={
							isLiked ? <FavoriteRoundedIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderRoundedIcon />
						}
						aria-label={isLiked ? t('Unlike dealer') : t('Like dealer')}
						aria-pressed={isLiked}
					>
						{dealer?.memberLikes ?? 0}
					</Button>
					{dealer?.memberPhone && (
						<a className={'dd-btn dd-btn-outline'} href={`tel:${dealer.memberPhone}`}>
							<PhoneRoundedIcon />
							{dealer.memberPhone}
						</a>
					)}
					<Button
						className={'dd-btn dd-btn-ghost'}
						onClick={() => redirectToMemberPageHandler(dealer?._id as string)}
						endIcon={<NorthEastRoundedIcon />}
					>
						{t('View profile')}
					</Button>
				</div>
			</div>

			<ul className={'dd-stats'}>
				<li>
					<DirectionsCarRoundedIcon />
					<strong>{dealer?.memberCars ?? 0}</strong>
					<span>{t('Cars')}</span>
				</li>
				<li>
					<PeopleAltRoundedIcon />
					<strong>{dealer?.memberFollowers ?? 0}</strong>
					<span>{t('Followers')}</span>
				</li>
				<li>
					<FavoriteRoundedIcon />
					<strong>{dealer?.memberLikes ?? 0}</strong>
					<span>{t('Likes')}</span>
				</li>
				<li>
					<VisibilityRoundedIcon />
					<strong>{dealer?.memberViews ?? 0}</strong>
					<span>{t('Views')}</span>
				</li>
			</ul>
		</section>
	);

	// dealerning e'lonlari + sahifalash (logika o'zgarmagan)
	const carsSection = (
		<section className={'dd-section dd-cars-section'}>
			<div className={'dd-section-head'}>
				<h2>{dealerName ? t('Cars by {{name}}', { name: dealerName }) : t('Cars')}</h2>
				{carTotal ? <span className={'dd-chip'}>{carTotal}</span> : null}
			</div>
			<Stack className={'dd-cars'}>
				{dealerCars.map((car: Car) => {
					return (
						<div className={'wrap-main'} key={car?._id}>
							<CarBigCard car={car} likeCarHandler={likeCarHandler} key={car?._id} />
						</div>
					);
				})}
			</Stack>
			<Stack className={'dd-pagination'}>
				{carTotal ? (
					<>
						<Stack className="pagination-box">
							<Pagination
								page={searchFilter.page}
								count={Math.ceil(carTotal / searchFilter.limit) || 1}
								onChange={carPaginationChangeHandler}
								shape="circular"
								color="primary"
							/>
						</Stack>
						<span>{t('Total {{count}} cars available', { count: carTotal })}</span>
					</>
				) : (
					<div className={'dd-empty'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('This dealer has no cars listed yet.')}</p>
					</div>
				)}
			</Stack>
		</section>
	);

	// sharhlar ro'yxati + sharh yozish formasi (logika o'zgarmagan)
	const reviewsSection = (
		<section className={'dd-section dd-reviews'}>
			<div className={'dd-section-head'}>
				<h2>{t('Reviews')}</h2>
				{commentTotal !== 0 && (
					<span className={'dd-chip'}>
						<StarRoundedIcon />
						{commentTotal}
					</span>
				)}
			</div>
			<div className={'dd-reviews-grid'}>
				<div className={'dd-review-list'}>
					{commentTotal !== 0 ? (
						<>
							{dealerComments?.map((comment: Comment) => {
								return <ReviewCard comment={comment} key={comment?._id} />;
							})}
							<Box component={'div'} className={'pagination-box'}>
								<Pagination
									page={commentInquiry.page}
									count={Math.ceil(commentTotal / commentInquiry.limit) || 1}
									onChange={commentPaginationChangeHandler}
									shape="circular"
									color="primary"
								/>
							</Box>
						</>
					) : (
						<div className={'dd-empty'}>
							<StarRoundedIcon />
							<p>{t('No reviews yet. Be the first to share your experience.')}</p>
						</div>
					)}
				</div>

				<div className={'dd-review-form'}>
					<Typography className={'dd-form-title'}>{t('Leave a review')}</Typography>
					<Typography className={'dd-form-sub'}>
						{t('How was your experience with {{name}}?', { name: dealerName || t('this dealer') })}
					</Typography>
					<textarea
						placeholder={t('Share details about the cars, service and communication…')}
						onChange={({ target: { value } }: any) => {
							setInsertCommentData({ ...insertCommentData, commentContent: value });
						}}
						value={insertCommentData.commentContent}
					></textarea>
					{!user?._id && <p className={'dd-hint'}>{t('Please log in to write a review.')}</p>}
					<Button
						className={'dd-submit'}
						disabled={insertCommentData.commentContent === '' || user?._id === ''}
						onClick={createCommentHandler}
						endIcon={<NorthEastRoundedIcon />}
					>
						{t('Submit review')}
					</Button>
				</div>
			</div>
		</section>
	);

	if (device === 'mobile') {
		return (
			<Stack className={'dealer-detail-page dd-v2 dd-mobile'}>
				{dealerHero}
				{carsSection}
				{reviewsSection}
			</Stack>
		);
	} else {
		return (
			<Stack className={'dealer-detail-page dd-v2'}>
				<div className={'dd-wrap'}>
					{dealerHero}
					{carsSection}
					{reviewsSection}
				</div>
			</Stack>
		);
	}
};

DealerDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 9,
		search: {
			memberId: '',
		},
	},
	initialComment: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'ASC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutBasic(DealerDetail);
