import React, { ChangeEvent, useEffect, useState } from 'react';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import { Box, CircularProgress, Dialog, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { NextPage } from 'next';
import Review from '../../libs/components/car/Review';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import CarBigCard from '../../libs/components/common/CarBigCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { Car } from '../../libs/types/car/car';
import { Member } from '../../libs/types/member/member';
import moment from 'moment';
import { formatEnum, formatterStr } from '../../libs/utils';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../libs/config';
import { userVar } from '../../apollo/store';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { Comment } from '../../libs/types/comment/comment';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { CarStatus } from '../../libs/enums/car.enum';
import { Pagination as MuiPagination } from '@mui/material';
import Link from 'next/link';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next'; //@ts-ignore
import 'swiper/css'; //@ts-ignore
import 'swiper/css/pagination';
import { GET_COMMENTS, GET_CARS, GET_CAR, GET_DEALERS } from '../../apollo/user/query';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { CREATE_COMMENT, LIKE_TARGET_CAR, LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { patchInList, toggleLike, toggleLikeInCache, toggleLikeInList } from '../../libs/optimistic';

SwiperCore.use([Autoplay, Navigation, Pagination]);

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
//@ts-ignore
const CarDetail: NextPage = ({ initialComment, ...props }: any) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const [carId, setCarId] = useState<string | null>(null);
	const [car, setCar] = useState<Car | null>(null);
	const [viewerIndex, setViewerIndex] = useState<number>(-1); // -1 = rasm ko'ruvchi yopiq
	const [destinationCars, setDestinationCars] = useState<Car[]>([]);
	const [commentInquiry, setCommentInquiry] = useState<CommentsInquiry>(initialComment);
	const [carComments, setCarComments] = useState<Comment[]>([]);
	const [commentTotal, setCommentTotal] = useState<number>(0);
	const [insertCommentData, setInsertCommentData] = useState<CommentInput>({
		commentGroup: CommentGroup.CAR,
		commentContent: '',
		commentRefId: '',
	});

	/** APOLLO REQUESTS **/
	// LIKE_TARGET_CAR — apollo/user/mutation.ts dan; e'longa like bosish/olib tashlash uchun mutatsiya
	const [likeTargetCar] = useMutation(LIKE_TARGET_CAR);
	// dealerga like bosish uchun mutatsiya (dealer kartasidagi yurak)
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	const client = useApolloClient(); // optimistic like uchun Apollo cache'ga yozish

	// dealer kartasi uchun: dealer like qilingan-qilinmaganini (meLiked) va likes sonini oladi.
	// GET_MEMBER emas, GET_DEALERS ishlatiladi: getMember dealerga view yozadi (nestar'da mashina sahifasi dealer view'ini oshirmaydi),
	// getDealers esa view yozmaydi. Nick bo'yicha aniq (^...$) qidiradi va ro'yxatdan shu dealer _id'sini tanlaydi.
	const dealerNick: string = car?.memberData?.memberNick ?? '';
	const dealerNickPattern = `^${dealerNick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
	const { data: getDealerData, refetch: getDealerRefetch } = useQuery(GET_DEALERS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 10, search: { text: dealerNickPattern } } },
		skip: !dealerNick,
	});
	const dealerFromList: Member | undefined = getDealerData?.getDealers?.list?.find(
		(item: Member) => item._id === car?.memberData?._id,
	);
	const dealerLiked: boolean = !!dealerFromList?.meLiked?.[0]?.myFavorite;
	const dealerLikes: number = dealerFromList?.memberLikes ?? car?.memberData?.memberLikes ?? 0;

	// dealerga like bosish: login tekshiradi, mutatsiya yuboradi, dealer ma'lumotini yangilaydi
	const likeDealerHandler = async () => {
		const id = car?.memberData?._id;
		if (!id) return;
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED).then();
		// optimistic: dealer kartasi GET_DEALERS `data`sidan chiziladi — Apollo cache'dagi Member yozuvini darhol o'zgartiramiz
		const wasLiked = dealerLiked;
		toggleLikeInCache(client.cache, 'Member', id, 'memberLikes', wasLiked);
		try {
			await likeTargetMember({ variables: { input: id } }); // javobdagi aniq memberLikes cache'ga o'zi yoziladi
		} catch (err: any) {
			toggleLikeInCache(client.cache, 'Member', id, 'memberLikes', !wasLiked);
			console.log('ERROR, likeDealerHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};
	// CREATE_COMMENT — apollo/user/mutation.ts dan; izoh (review) yozish uchun mutatsiya
	const [createComment] = useMutation(CREATE_COMMENT);

	// GET_CAR — apollo/user/query.ts dan; URL'dagi ?id bo'yicha aynan shu e'lonning o'zini oladi
	const {
		loading: getCarLoading, // so'rov hali javob kutayotganini bildiradi (pastda butun sahifa uchun loading sifatida ishlatiladi)
		data: getCarData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getCarError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getCarRefetch, // shu so'rovni qo'lda qayta yuborish (like bosgandan keyin e'lonni yangilash uchun)
	} = useQuery(GET_CAR, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: carId }, // e'lon ID'si (URL'dan)
		skip: !carId, // carId hali aniqlanmagan bo'lsa so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			if (data?.getCar) setCar(data?.getCar); // kelgan e'lon ma'lumotini state'ga yozadi
		},
	});

	// GET_CARS — shu e'lon joylashgan hududdagi (carLocation) o'xshash 4 ta e'lonni oladi ("Destination Car" bo'limi uchun)
	const {
		loading: getCarsLoading,
		data: getCarsData,
		error: getCarsError,
		refetch: getCarsRefetch, // like bosgandan keyin o'xshash e'lonlar ro'yxatini yangilash uchun
	} = useQuery(GET_CARS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: {
			input: {
				page: 1,
				limit: 4,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: {
					locationList: car?.carLocation ? [car?.carLocation] : [], // faqat shu joylashuvdagi e'lonlar
				},
			},
		},
		skip: !carId && !car, // hali e'lon aniqlanmagan bo'lsa so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getCars?.list) setDestinationCars(data?.getCars?.list); // kelgan o'xshash e'lonlarni state'ga yozadi
		},
	});

	// GET_COMMENTS — apollo/user/query.ts dan; shu e'longa yozilgan izohlar ro'yxatini oladi
	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch, // izoh yozilgandan/sahifalash o'zgargandan keyin ro'yxatni qayta so'rash uchun
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: { input: initialComment }, // izohlar sahifalash/filtri (defaultProps'dan)
		skip: !commentInquiry.search.commentRefId, // shu e'longa tegishli commentRefId hali aniqlanmaguncha so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			if (data?.getComments?.list) setCarComments(data?.getComments?.list); // kelgan izohlar ro'yxatini state'ga yozadi
			setCommentTotal(data?.getComments?.metaCounter[0]?.total ?? 0); // umumiy izohlar sonini state'ga yozadi
		},
	});

	/** LIFECYCLES **/
	// URL'dagi ?id o'zgarganda (sahifa ochilganda yoki boshqa e'longa o'tilganda): carId'ni,
	// izohlar filtrini va yangi izoh yozish uchun commentRefId'ni shu e'lon ID'siga moslaydi
	useEffect(() => {
		if (router.query.id) {
			setCarId(router.query.id as string);
			setCommentInquiry({
				...commentInquiry,
				search: {
					commentRefId: router.query.id as string,
				},
			});
			setInsertCommentData({
				...insertCommentData,
				commentRefId: router.query.id as string,
			});
		}
	}, [router]);

	// commentInquiry (sahifalash yoki commentRefId) o'zgarganda izohlarni qayta so'raydi
	useEffect(() => {
		if (commentInquiry.search.commentRefId) {
			getCommentsRefetch({ input: commentInquiry });
		}
	}, [commentInquiry]);

	/** HANDLERS **/
	// like ikonkasi bosilganda ishga tushadi (asosiy e'lon yoki "Destination Car" kartalaridan biri uchun)
	const likeCarHandler = async (user: T, id: string) => {
		if (!id) return;
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED).then();
		// optimistic: asosiy e'lon va pastdagi o'xshash e'lonlar kartasida yurakcha/son DARHOL o'zgaradi
		const flip = () => {
			setCar((prev) => (prev && prev._id === id ? toggleLike(prev, 'carLikes') : prev));
			setDestinationCars((list) => toggleLikeInList(list, id, 'carLikes'));
		};
		flip();
		try {
			const res = await likeTargetCar({ variables: { input: id } });
			const likes = res?.data?.likeTargetCar?.carLikes;
			if (typeof likes === 'number') {
				// server qaytargan aniq son bilan tenglashtiramiz
				setCar((prev) => (prev && prev._id === id ? { ...prev, carLikes: likes } : prev));
				setDestinationCars((list) => patchInList(list, id, { carLikes: likes }));
			}
		} catch (err: any) {
			flip(); // xato: avvalgi holatga qaytaramiz
			console.log('ERROR, likeCarHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// izohlar Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, useEffect avtomatik qayta so'raydi
	const commentPaginationChangeHandler = async (event: ChangeEvent<unknown>, value: number) => {
		commentInquiry.page = value;
		setCommentInquiry({ ...commentInquiry });
	};

	// "Submit Review" bosilganda: login tekshiradi, izohni yuboradi, matnni tozalaydi va izohlar ro'yxatini yangilaydi
	const createCommentHandler = async () => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createComment({ variables: { input: insertCommentData } });

			setInsertCommentData({ ...insertCommentData, commentContent: '' });

			await getCommentsRefetch({ input: commentInquiry });
		} catch (err: any) {
			await sweetErrorHandling(err);
		}
	};

	/** VIEW HELPERS (faqat ko'rinish uchun) **/
	// enum qiymatlarini o'qishga qulay qiladi: GASOLINE → Gasoline, DAEGU → Daegu
	const pretty = (value?: string | null): string =>
		value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase().replace(/_/g, ' ') : '—';
	// tarjima qilinadigan enum qiymatlari (GASOLINE → Gasoline → 가솔린 / Бензин)
	const label = (value?: string | null): string => (value ? t(formatEnum(value)) : '—');
	const images: string[] = car?.carImages ?? [];
	const imageUrl = (img: string) => `${REACT_APP_API_URL}/${img}`;
	const smallImages = images.slice(1, 5);
	const listedDays = car?.createdAt ? moment().diff(car.createdAt, 'days') : 0;
	const listedText =
		listedDays === 0
			? t('Listed today')
			: listedDays === 1
			? t('Listed 1 day ago')
			: t('Listed {{count}} days ago', { count: listedDays });
	const liked = !!(car?.meLiked && car?.meLiked[0]?.myFavorite);
	const dealer = car?.memberData;
	const dealerName = dealer?.memberFullName || dealer?.memberNick || '';
	const dealerInitials = (dealer?.memberNick ?? 'D')
		.split(/[\s_.-]+/)
		.filter(Boolean)
		.map((p) => p[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	const mapQuery = [car?.carAddress, pretty(car?.carLocation), 'South Korea'].filter(Boolean).join(', ');
	const galleryColumns = smallImages.length === 0 ? '1fr' : smallImages.length <= 2 ? '3fr 1fr' : '3fr 1fr 1fr';
	const galleryRows = smallImages.length >= 2 ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)';

	const specs = [
		{ label: 'Year', value: car?.carYear ?? '—', d: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4' },
		{ label: 'Mileage', value: `${car?.carMileage?.toLocaleString() ?? 0} km`, d: 'M12 13l4-4M4 17a8 8 0 1 1 16 0' },
		{
			label: 'Fuel',
			value: label(car?.carFuelType),
			d: 'M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M3 20h12M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3M7 8h4',
		},
		{ label: 'Transmission', value: label(car?.carTransmission), d: 'M6 4v16M12 4v16M18 4v8M6 12h12' },
		{
			label: 'Body type',
			value: label(car?.carType),
			d: 'M3 14l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l3 5v3H3zM7 17v2M17 17v2',
		},
		{ label: 'Brand', value: formatEnum(car?.carBrand), d: 'M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z' },
	];
	const details = [
		{ k: 'Brand / Model', v: `${formatEnum(car?.carBrand)} ${car?.carModel ?? ''}`.trim() },
		{ k: 'Year', v: car?.carYear ?? '—' },
		{ k: 'Mileage', v: `${car?.carMileage?.toLocaleString() ?? 0} km` },
		{ k: 'Car type', v: label(car?.carType) },
		{ k: 'Fuel type', v: label(car?.carFuelType) },
		{ k: 'Condition', v: label(car?.carCondition) },
		{ k: 'Transmission', v: label(car?.carTransmission) },
		{ k: 'Seats', v: car?.carSeats ?? '—' },
		{ k: 'Engine size', v: car?.carEngineSize ? `${car.carEngineSize.toLocaleString()} cc` : '—' },
		{ k: 'Color', v: car?.carColor ? pretty(car.carColor) : '—' },
		{
			k: 'Options',
			v: [car?.carBarter && t('Barter'), car?.carCredit && t('Credit')].filter(Boolean).join(' / ') || '—',
		},
		{ k: 'Location', v: label(car?.carLocation) },
	];

	// faqat birinchi yuklanishda spinner: like bosilgandan keyingi refetch'da ham getCarLoading true bo'ladi
	// (notifyOnNetworkStatusChange), oldin butun sahifa spinner bilan almashib "refresh" bo'lgandek ko'rinardi
	if (getCarLoading && !car) {
		return (
			<Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '1080px' }}>
				<CircularProgress size={'4rem'} />
			</Stack>
		);
	}

	// mobil va desktop'da bir xil tuzilma; mobilda ustunlar ketma-ket, galereya suriladigan bo'ladi
	// va pastda narx + "Call dealer" paneli doim ko'rinib turadi (stillar scss/mobile/carDetail.scss'da)
	{
		return (
			<div id={'car-detail-page'} className={`cd-v2 ${device === 'mobile' ? 'cd-mobile' : ''}`}>
				<div className={'cd-wrap'}>
					{/* breadcrumb */}
					<nav aria-label={t('Breadcrumb')} className={'cd-crumbs'}>
						<Link href={'/car'}>{t('Cars')}</Link>
						<span aria-hidden="true">/</span>
						<span>{formatEnum(car?.carBrand)}</span>
						<span aria-hidden="true">/</span>
						<strong>{car?.carTitle}</strong>
					</nav>

					{/* galereya: 1 katta + 4 kichik; istalgan rasm bosilsa to'liq ekranli ko'ruvchi ochiladi */}
					<section
						aria-label={t('Photos')}
						className={'cd-gallery'}
						style={{ gridTemplateColumns: galleryColumns, gridTemplateRows: galleryRows }}
					>
						{images.length === 0 ? (
							<div className={'cd-tile is-main is-empty'}>{t('No photos')}</div>
						) : (
							[images[0], ...smallImages].map((img: string, k: number) => (
								<button
									type={'button'}
									key={img}
									className={`cd-tile ${k === 0 ? 'is-main' : ''}`}
									onClick={() => setViewerIndex(k)}
									aria-label={t('Open photo {{n}} of {{total}}', { n: k + 1, total: images.length })}
								>
									<img src={imageUrl(img)} alt={k === 0 ? car?.carTitle ?? '' : ''} />
								</button>
							))
						)}
						{images.length > 0 && (
							<>
								<span className={'cd-photo-count'}>{t('{{count}} photos', { count: images.length })}</span>
								<button type={'button'} className={'cd-btn cd-all-photos'} onClick={() => setViewerIndex(0)}>
									{t('View all photos')}
								</button>
							</>
						)}
					</section>

					<div className={'cd-columns'}>
						{/* CHAP USTUN */}
						<div className={'cd-main'}>
							<div className={'cd-head'}>
								<span className={'cd-tag'}>
									{label(car?.carCondition).toUpperCase()} · {label(car?.carType).toUpperCase()}
								</span>
								<h1>{car?.carTitle}</h1>
								{/* narx — mashina nomi ostida */}
								<div className={'cd-title-price'}>
									<span className={'cd-currency'}>₩</span>
									{formatterStr(car?.carPrice)}
								</div>
								<div className={'cd-meta'}>
									<span>{label(car?.carLocation)}</span>
									<span>{listedText}</span>
									<span>
										<RemoveRedEyeIcon /> {t('{{count}} views', { count: car?.carViews ?? 0 })}
									</span>
									{/* like: rasmlar ostida, views yonida — bosilsa like qo'yadi / olib tashlaydi */}
									<button
										type={'button'}
										className={`cd-like ${liked ? 'is-liked' : ''}`}
										aria-pressed={liked}
										aria-label={liked ? t('Remove like from this car') : t('Like this car')}
										// @ts-ignore
										onClick={() => likeCarHandler(user, car?._id)}
									>
										{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
										{t('{{count}} likes', { count: car?.carLikes ?? 0 })}
									</button>
								</div>
							</div>

							<section aria-label={t('Key specs')} className={'cd-specs'}>
								{specs.map((s) => (
									<div className={'cd-spec'} key={s.label}>
										<span className={'cd-spec-icon'}>
											<svg
												viewBox="0 0 24 24"
												width={20}
												height={20}
												fill="none"
												stroke="currentColor"
												strokeWidth="1.8"
												strokeLinecap="round"
												strokeLinejoin="round"
												aria-hidden="true"
											>
												<path d={s.d} />
											</svg>
										</span>
										<span className={'cd-spec-label'}>{t(s.label)}</span>
										<span className={'cd-spec-value'}>{s.value}</span>
									</div>
								))}
							</section>

							<section className={'cd-section'}>
								<h2>{t('About this car')}</h2>
								<p className={`cd-desc ${car?.carDesc ? '' : 'is-empty'}`}>
									{car?.carDesc || t('The dealer hasn’t added a description yet.')}
								</p>
							</section>

							<section className={'cd-section'}>
								<h2>{t('Car details')}</h2>
								<dl className={'cd-details'}>
									{details.map((d) => (
										<div key={d.k}>
											<dt>{t(d.k)}</dt>
											<dd>{d.v}</dd>
										</div>
									))}
								</dl>
							</section>

							<section className={'cd-section'}>
								<h2>{t('Location')}</h2>
								<div className={'cd-map'}>
									{/* oldin hamma e'lon uchun bir xil (Daegu) xarita edi — endi e'lonning o'z manzili */}
									<iframe
										title={`${t('Map')}: ${mapQuery}`}
										src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=13&output=embed`}
										width="100%"
										height="100%"
										style={{ border: 0 }}
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
									></iframe>
								</div>
							</section>

							<section className={'cd-section'}>
								<div className={'cd-section-head'}>
									<h2>{t('Reviews')}</h2>
									<span>
										{commentTotal === 1
											? t('{{count}} review', { count: commentTotal })
											: t('{{count}} reviews', { count: commentTotal })}
									</span>
								</div>
								{commentTotal !== 0 && (
									<div className={'cd-review-list'}>
										{carComments?.map((comment: Comment) => {
											return <Review comment={comment} key={comment?._id} />;
										})}
										{Math.ceil(commentTotal / commentInquiry.limit) > 1 && (
											<Box component={'div'} className={'pagination-box'}>
												<MuiPagination
													page={commentInquiry.page}
													count={Math.ceil(commentTotal / commentInquiry.limit)}
													onChange={commentPaginationChangeHandler}
													shape="circular"
													color="primary"
												/>
											</Box>
										)}
									</div>
								)}
								<div className={'cd-review-form'}>
									{commentTotal === 0 && (
										<span className={'cd-muted'}>{t('No reviews yet. Be the first to share your experience.')}</span>
									)}
									<label htmlFor={'cd-review'}>{t('Your review')}</label>
									<textarea
										id={'cd-review'}
										rows={4}
										placeholder={t('What did you think of this car or dealer?')}
										onChange={({ target: { value } }: any) => {
											setInsertCommentData({ ...insertCommentData, commentContent: value });
										}}
										value={insertCommentData.commentContent}
									></textarea>
									<button
										type={'button'}
										className={'cd-btn cd-dark cd-submit'}
										disabled={insertCommentData.commentContent === '' || user?._id === ''}
										onClick={createCommentHandler}
									>
										{t('Submit review')}
									</button>
								</div>
							</section>
						</div>

						{/* O'NG USTUN: narx + dealer (yopishqoq panel) */}
						<aside aria-label={t('Price and dealer')} className={'cd-side'}>
							<div className={'cd-panel'}>
								<div>
									<span className={'cd-muted'}>{t('Price')}</span>
									<div className={'cd-price'}>₩{formatterStr(car?.carPrice)}</div>
								</div>
								<div className={'cd-badges'}>
									{car?.carStatus === CarStatus.RESERVED && (
										<span className={'cd-badge is-reserved'}>{t('Reserved')}</span>
									)}
									<span className={`cd-badge ${car?.carBarter ? 'is-on' : ''}`}>
										{car?.carBarter ? `✓ ${t('Barter available')}` : t('No barter')}
									</span>
									<span className={`cd-badge ${car?.carCredit ? 'is-on' : ''}`}>
										{car?.carCredit ? `✓ ${t('Credit available')}` : t('No credit')}
									</span>
								</div>

								<div className={'cd-divider'} />

								{/* dealer kartasi: kim sotyapti, manzil, qisqa tavsif, statistika va tugmalar */}
								<div className={'cd-dealer-card'}>
									<span className={'cd-eyebrow'}>{t('Sold by')}</span>
									<Link href={{ pathname: '/dealer/detail', query: { dealerId: dealer?._id } }} className={'cd-dealer'}>
										{dealer?.memberImage ? (
											<img src={imageUrl(dealer.memberImage)} alt={dealerName} />
										) : (
											<span className={'cd-dealer-initials'} aria-hidden="true">
												{dealerInitials}
											</span>
										)}
										<div>
											<span className={'cd-dealer-top'}>
												<strong>{dealerName}</strong>
												<span className={'cd-dealer-badge'}>{t('DEALER')}</span>
											</span>
											{dealer?.memberAddress && (
												<span className={'cd-dealer-address'}>
													<PlaceRoundedIcon />
													{dealer.memberAddress}
												</span>
											)}
										</div>
										<ChevronRightRoundedIcon className={'cd-dealer-go'} />
									</Link>
									{dealer?.memberDesc && <p className={'cd-dealer-desc'}>{dealer.memberDesc}</p>}
									<div className={'cd-dealer-stats'}>
										<button
											type={'button'}
											className={`cd-dealer-like ${dealerLiked ? 'is-liked' : ''}`}
											onClick={likeDealerHandler}
											aria-pressed={dealerLiked}
											aria-label={dealerLiked ? t('Unlike dealer') : t('Like dealer')}
										>
											{dealerLiked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
											{dealerLikes}
										</button>
										<span title={t('Views')}>
											<RemoveRedEyeIcon />
											{dealer?.memberViews ?? 0}
										</span>
										{dealer?.createdAt && (
											<span>
												{t('Member since')} {new Date(dealer.createdAt).getFullYear()}
											</span>
										)}
									</div>
									<div className={'cd-actions'}>
										{dealer?.memberPhone && (
											<a href={`tel:${dealer.memberPhone}`} className={'cd-btn cd-action cd-call'}>
												<PhoneRoundedIcon />
												{dealer.memberPhone}
											</a>
										)}
										<Link
											href={{ pathname: '/dealer/detail', query: { dealerId: dealer?._id } }}
											className={'cd-btn cd-action cd-outline'}
										>
											{t('View dealer')}
										</Link>
									</div>
								</div>
							</div>
							<div className={'cd-note'}>
								{listedText} · {label(car?.carLocation)}
							</div>
						</aside>
					</div>

					{destinationCars.length !== 0 && (
						<section className={'cd-similar'}>
							<div className={'cd-section-head'}>
								<div>
									<h2>{t('Similar cars')}</h2>
									<p className={'cd-muted'}>{t('More cars in {{city}}', { city: label(car?.carLocation) })}</p>
								</div>
								<Link href={'/car'} className={'cd-link'}>
									{t('See all')} →
								</Link>
							</div>
							<div className={'cd-similar-grid'}>
								{destinationCars.map((item: Car) => (
									<CarBigCard car={item} likeCarHandler={likeCarHandler} key={item?._id} />
								))}
							</div>
						</section>
					)}
				</div>

				{device === 'mobile' && (
					<div className={'cd-mbar'} aria-label={t('Price and dealer')}>
						<div className={'cd-mbar-price'}>
							<span>{t('Price')}</span>
							<strong>₩{formatterStr(car?.carPrice)}</strong>
						</div>
						<Link
							href={{ pathname: '/dealer/detail', query: { dealerId: dealer?._id } }}
							className={'cd-mbar-btn is-outline'}
							aria-label={t('View dealer')}
						>
							<StorefrontRoundedIcon />
						</Link>
						{dealer?.memberPhone ? (
							<a href={`tel:${dealer.memberPhone}`} className={'cd-mbar-btn is-primary'}>
								<PhoneRoundedIcon />
								{t('Call dealer')}
							</a>
						) : (
							<Link
								href={{ pathname: '/dealer/detail', query: { dealerId: dealer?._id } }}
								className={'cd-mbar-btn is-primary'}
							>
								{t('View dealer')}
							</Link>
						)}
					</div>
				)}

				{/* to'liq ekranli rasm ko'ruvchi */}
				<Dialog
					fullScreen
					open={viewerIndex >= 0 && images.length > 0}
					onClose={() => setViewerIndex(-1)}
					onKeyDown={(e: any) => {
						if (e.key === 'ArrowRight') setViewerIndex((viewerIndex + 1) % images.length);
						if (e.key === 'ArrowLeft') setViewerIndex((viewerIndex - 1 + images.length) % images.length);
					}}
					PaperProps={{ className: 'cd-viewer' }}
				>
					<div className={'cd-viewer-top'}>
						<span>
							{viewerIndex + 1} / {images.length}
						</span>
						<strong>{car?.carTitle}</strong>
						<button type={'button'} className={'cd-round'} onClick={() => setViewerIndex(-1)} aria-label={t('Close')}>
							<CloseRoundedIcon />
						</button>
					</div>
					<div className={'cd-viewer-stage'}>
						<button
							type={'button'}
							className={'cd-round'}
							onClick={() => setViewerIndex((viewerIndex - 1 + images.length) % images.length)}
							aria-label={t('Previous photo')}
						>
							<WestIcon />
						</button>
						<div className={'cd-viewer-frame'}>
							{viewerIndex >= 0 && images[viewerIndex] && (
								<img src={imageUrl(images[viewerIndex])} alt={`${car?.carTitle ?? ''} photo ${viewerIndex + 1}`} />
							)}
						</div>
						<button
							type={'button'}
							className={'cd-round'}
							onClick={() => setViewerIndex((viewerIndex + 1) % images.length)}
							aria-label={t('Next photo')}
						>
							<EastIcon />
						</button>
					</div>
					<div className={'cd-viewer-thumbs'}>
						{images.map((img: string, k: number) => (
							<button
								type={'button'}
								key={img}
								className={k === viewerIndex ? 'is-active' : ''}
								onClick={() => setViewerIndex(k)}
								aria-label={t('Show photo {{n}}', { n: k + 1 })}
							>
								<img src={imageUrl(img)} alt="" />
							</button>
						))}
					</div>
				</Dialog>
			</div>
		);
	}
};

CarDetail.defaultProps = {
	initialComment: {
		page: 1,
		limit: 3, // bir sahifada 3 ta sharh
		sort: 'createdAt',
		direction: 'DESC',
		search: {
			commentRefId: '',
		},
	},
};

export default withLayoutFull(CarDetail);
