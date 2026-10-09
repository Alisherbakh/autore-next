import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stack, Box } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import WestIcon from '@mui/icons-material/West';
import EastIcon from '@mui/icons-material/East';
import SectionHead from './SectionHead';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper';
import TopDealerCard from './TopDealerCard';
import DealerCard from '../common/DealerCard';
import { Member } from '../../types/member/member';
import { DealersInquiry } from '../../types/member/member.input';
import { GET_DEALERS } from '../../../apollo/user/query';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_MEMBER } from '../../../apollo/user/mutation';
import { Messages } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

interface TopDealersProps {
	initialInput: DealersInquiry;
}

const TopDealers = (props: TopDealersProps) => {
	const { initialInput } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [topDealers, setTopDealers] = useState<Member[]>([]);

	/** APOLLO REQUESTS **/
	// dealerga like bosish uchun mutatsiya
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
	// GET_DEALERS — apollo/user/query.ts dan; reyting (memberRank) bo'yicha eng yaxshi dealerlarni oladi
	const {
		loading: getDealersLoading, // so'rov hali javob kutayotganini bildiradi
		data: getDealersData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getDealersError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getDealersRefetch, // shu so'rovni qo'lda qayta yuborish uchun funksiya (bu komponentda hozircha chaqirilmagan)
	} = useQuery(GET_DEALERS, {
		fetchPolicy: 'cache-and-network', // avval cache'dagi qiymatni ko'rsatadi, parallel ravishda backend'dan yangisini ham so'raydi
		variables: { input: initialInput }, // sort: memberRank DESC — "eng yuqori reytingli" dealerlar (defaultProps'da belgilangan)
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setTopDealers(data?.getDealers?.list); // kelgan dealerlar ro'yxatini state'ga yozadi
		},
	});

	// dealerga like bosish (DealerCard'dagi yurak): login tekshiradi, mutatsiya yuboradi, ro'yxatni yangilaydi
	const likeMemberHandler = async (user: T, id: string) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			await likeTargetMember({ variables: { input: id } });
			const result = await getDealersRefetch({ input: initialInput });
			if (result?.data?.getDealers?.list) setTopDealers(result.data.getDealers.list);
			await sweetTopSmallSuccessAlert('success', 800);
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};
	/** HANDLERS **/

	if (device === 'mobile') {
		// mobil: gorizontal aylantiriladigan dealer kartalari
		return (
			<section className={'m-sec'} aria-labelledby={'m-dealers-title'}>
				<div className={'m-sec-head'}>
					<h2 id={'m-dealers-title'}>{t('Top Dealers')}</h2>
					<Link href={'/dealer'} className={'m-see'}>
						{t('See all')}
					</Link>
				</div>
				<div className={'m-scroll is-narrow'}>
					{topDealers.map((dealer: Member) => (
						<div className={'m-scroll-item'} key={dealer?._id}>
							<DealerCard dealer={dealer} likeMemberHandler={likeMemberHandler} />
						</div>
					))}
				</div>
			</section>
		);
	} else {
		return (
			<Stack component={'section'} className={'top-dealers hp-section'}>
				<Stack className={'container'}>
					<SectionHead
						title={t('Top Dealers')}
						sub={t('Our Top Dealers always ready to serve you')}
						actions={
							<>
								<Link href={'/dealer'} className={'hp-more'}>
									{t('See All Dealers')}
									<img src="/img/icons/rightup.svg" alt="" width={16} height={16} />
								</Link>
								<div className={'hp-nav'}>
									<button type={'button'} className={'hp-nav-btn swiper-dealers-prev'} aria-label={t('Previous')}>
										<WestIcon />
									</button>
									<button type={'button'} className={'hp-nav-btn swiper-dealers-next'} aria-label={t('Next')}>
										<EastIcon />
									</button>
								</div>
							</>
						}
					/>
					<Stack className={'wrapper'}>
						<Box component={'div'} className={'card-wrapper'}>
							<Swiper
								className={'top-dealers-swiper'}
								slidesPerView={'auto'}
								spaceBetween={29}
								modules={[Autoplay, Navigation, Pagination]}
								navigation={{
									nextEl: '.swiper-dealers-next',
									prevEl: '.swiper-dealers-prev',
								}}
							>
								{topDealers.map((dealer: Member) => {
									return (
										<SwiperSlide className={'top-dealers-slide'} key={dealer?._id}>
											<TopDealerCard dealer={dealer} key={dealer?.memberNick} likeMemberHandler={likeMemberHandler} />
										</SwiperSlide>
									);
								})}
							</Swiper>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

TopDealers.defaultProps = {
	initialInput: {
		page: 1,
		limit: 10,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopDealers;
