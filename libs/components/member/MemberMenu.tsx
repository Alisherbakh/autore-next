import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Stack, Typography, Box, List, ListItem, Button } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { useQuery } from '@apollo/client';
import { GET_MEMBER } from '../../../apollo/user/query';
import { T } from '../../types/common';
import { useTranslation } from 'next-i18next';
import { toggleFollow } from '../../optimistic';

interface MemberMenuProps {
	subscribeHandler: any;
	unsubscribeHandler: any;
}

const MemberMenu = (props: MemberMenuProps) => {
	const { subscribeHandler, unsubscribeHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const category: any = router.query?.category;
	const [member, setMember] = useState<Member | null>(null);
	const { memberId } = router.query;

	/** APOLLO REQUESTS **/
	// GET_MEMBER — apollo/user/query.ts dan; URL'dagi memberId bo'yicha ko'rilayotgan foydalanuvchining profilini oladi
	// (ism, rasm, followers/followings/cars sonlari, meFollowed holati shu yerdan chiqadi)
	const {
		loading: getMemberLoading, // so'rov hali javob kutayotganini bildiradi
		data: getMemberData, // backend javobi (pastda onCompleted orqali ishlatilyapti)
		error: getMemberError, // so'rov xato bilan tugasa shu yerga tushadi
		refetch: getMemberRefetch, // shu so'rovni qo'lda qayta yuborish (follow/unfollow bosgandan keyin JSX'da ishlatiladi)
	} = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only', // cache'ni emas, har doim backend'ning yangi javobini oladi
		variables: { input: memberId }, // ko'rilayotgan a'zoning ID'si (URL query'dan)
		skip: !memberId, // memberId hali aniqlanmagan bo'lsa so'rov yuborilmaydi
		notifyOnNetworkStatusChange: true, // refetch paytida ham loading holatini kuzatish imkonini beradi
		onCompleted: (data: T) => {
			setMember(data?.getMember); // kelgan profil ma'lumotini state'ga yozadi
		},
	});

	/** OPTIMISTIC follow **/
	// Follow/Unfollow bosilishi bilan tugma va followers soni DARHOL o'zgaradi, so'rov orqada ketadi;
	// handler false qaytarsa (xato) — avvalgi holatga qaytariladi
	const followOptimistic = async (handler: any) => {
		if (!member?._id) return;
		setMember((prev) => toggleFollow(prev as Member, 'memberFollowers'));
		const ok = await handler(member._id, getMemberRefetch, memberId);
		if (ok === false) setMember((prev) => toggleFollow(prev as Member, 'memberFollowers'));
	};

	if (device === 'mobile') {
		// mobil: profil kartasi (Follow tugmasi, statistika) + bo'limlar gorizontal chip'larda
		const isFollowing = !!(member?.meFollowed && member?.meFollowed[0]?.myFollowing);
		const sections = [
			...(member?.memberType === 'DEALER' ? [{ key: 'cars', label: t('Cars') }] : []),
			{ key: 'articles', label: t('Articles') },
			{ key: 'followers', label: t('Followers') },
			{ key: 'followings', label: t('Followings') },
		];
		return (
			<Stack className={'mb-menu'}>
				<div className={'mb-profile'}>
					<span className={'mb-avatar'}>
						{member?.memberImage ? (
							<img src={`${REACT_APP_API_URL}/${member?.memberImage}`} alt="" />
						) : (
							(member?.memberNick ?? 'U').slice(0, 1).toUpperCase()
						)}
					</span>
					{member?.memberType && (
						<span className={`mb-role is-${member.memberType.toLowerCase()}`}>{t(member.memberType)}</span>
					)}
					<Typography component={'h1'} className={'mb-name'}>
						{member?.memberFullName || member?.memberNick || '\u00A0'}
					</Typography>
					{member?.memberAddress && <span className={'mb-address'}>{member.memberAddress}</span>}
					<div className={'mb-actions'}>
						{isFollowing ? (
							<Button className={'mb-btn is-following'} onClick={() => followOptimistic(unsubscribeHandler)}>
								{t('Following')}
							</Button>
						) : (
							<Button className={'mb-btn is-primary'} onClick={() => followOptimistic(subscribeHandler)}>
								{t('Follow')}
							</Button>
						)}
						{member?.memberPhone && (
							<a href={`tel:${member.memberPhone}`} className={'mb-btn is-outline'}>
								{member.memberPhone}
							</a>
						)}
					</div>
					<ul className={'mb-stats'}>
						<li>
							<strong>{member?.memberCars ?? 0}</strong>
							<span>{t('Cars')}</span>
						</li>
						<li>
							<strong>{member?.memberFollowers ?? 0}</strong>
							<span>{t('Followers')}</span>
						</li>
						<li>
							<strong>{member?.memberFollowings ?? 0}</strong>
							<span>{t('Following')}</span>
						</li>
						<li>
							<strong>{member?.memberLikes ?? 0}</strong>
							<span>{t('Likes')}</span>
						</li>
					</ul>
				</div>
				<nav className={'mb-chips'} aria-label={t('Member sections')}>
					{sections.map((section) => (
						<Link
							key={section.key}
							href={{ pathname: '/member', query: { ...router.query, category: section.key } }}
							scroll={false}
							className={category === section.key ? 'is-active' : ''}
							aria-current={category === section.key ? 'page' : undefined}
						>
							{section.label}
						</Link>
					))}
				</nav>
			</Stack>
		);
	} else {
		return (
			<Stack width={'100%'} padding={'30px 24px'}>
				<Stack className={'profile'}>
					<Box component={'div'} className={'profile-img'}>
						<img
							src={member?.memberImage ? `${REACT_APP_API_URL}/${member?.memberImage}` : '/img/profile/defaultUser.svg'}
							alt={'member-photo'}
						/>
					</Box>
					<Stack className={'user-info'}>
						<Typography className={'user-name'}>{member?.memberNick}</Typography>
						<Box component={'div'} className={'user-phone'}>
							<img src={'/img/icons/call.svg'} alt={'icon'} />
							<Typography className={'p-number'}>{member?.memberPhone}</Typography>
						</Box>
						<Typography className={'view-list'}>{member?.memberType}</Typography>
					</Stack>
				</Stack>
				<Stack className="follow-button-box">
					{member?.meFollowed && member?.meFollowed[0]?.myFollowing ? (
						<>
							<Button
								variant="outlined"
								sx={{
									background: '#FFFFFF',
									color: '#23262F',
									borderColor: '#E3E1DA',
									':hover': { background: '#EEF1F7', borderColor: '#23262F' },
								}}
								onClick={() => followOptimistic(unsubscribeHandler)}
							>
								Unfollow
							</Button>
							<Typography>Following</Typography>
						</>
					) : (
						<Button
							variant="contained"
							sx={{ background: '#0057FF', color: '#FFFFFF', ':hover': { background: '#0047D1' } }}
							onClick={() => followOptimistic(subscribeHandler)}
						>
							Follow
						</Button>
					)}
				</Stack>
				<Stack className={'sections'}>
					<Stack className={'section'}>
						<Typography className="title" variant={'h5'}>
							Details
						</Typography>
						<List className={'sub-section'}>
							{member?.memberType === 'DEALER' && (
								<ListItem className={category === 'cars' ? 'focus' : ''}>
									<Link
										href={{
											pathname: '/member',
											query: { ...router.query, category: 'cars' },
										}}
										scroll={false}
										style={{ width: '100%' }}
									>
										<div className={'flex-box'}>
											{category === 'cars' ? (
												<img className={'com-icon'} src={'/img/icons/homeWhite.svg'} alt={'com-icon'} />
											) : (
												<img className={'com-icon'} src={'/img/icons/home.svg'} alt={'com-icon'} />
											)}
											<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
												Cars
											</Typography>
											<Typography className="count-title" variant="subtitle1">
												{member?.memberCars}
											</Typography>
										</div>
									</Link>
								</ListItem>
							)}
							<ListItem className={category === 'followers' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/member',
										query: { ...router.query, category: 'followers' },
									}}
									scroll={false}
									style={{ width: '100%' }}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followers' ? 'white' : 'black'}
											height="800px"
											width="800px"
											version="1.1"
											id="Layer_1"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 328 328"
										>
											<g id="XMLID_350_">
												<path
													id="XMLID_351_"
													d="M52.25,64.001c0,34.601,28.149,62.749,62.75,62.749c34.602,0,62.751-28.148,62.751-62.749
		S149.602,1.25,115,1.25C80.399,1.25,52.25,29.4,52.25,64.001z"
												/>
												<path
													id="XMLID_352_"
													d="M217.394,262.357c2.929,2.928,6.768,4.393,10.606,4.393c3.839,0,7.678-1.465,10.607-4.394
		c5.857-5.858,5.857-15.356-0.001-21.214l-19.393-19.391l19.395-19.396c5.857-5.858,5.857-15.356-0.001-21.214
		c-5.858-5.857-15.356-5.856-21.214,0.001l-30,30.002c-2.813,2.814-4.393,6.629-4.393,10.607c0,3.979,1.58,7.794,4.394,10.607
		L217.394,262.357z"
												/>
												<path
													id="XMLID_439_"
													d="M15,286.75h125.596c19.246,24.348,49.031,40,82.404,40c57.896,0,105-47.103,105-105
		c0-57.896-47.104-105-105-105c-34.488,0-65.145,16.716-84.297,42.47c-7.764-1.628-15.695-2.47-23.703-2.47
		c-63.411,0-115,51.589-115,115C0,280.034,6.716,286.75,15,286.75z M223,146.75c41.355,0,75,33.645,75,75s-33.645,75-75,75
		s-75-33.645-75-75S181.644,146.75,223,146.75z"
												/>
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Followers
										</Typography>
										<Typography className="count-title" variant="subtitle1">
											{member?.memberFollowers}
										</Typography>
									</div>
								</Link>
							</ListItem>
							<ListItem className={category === 'followings' ? 'focus' : ''}>
								<Link
									href={{
										pathname: '/member',
										query: { ...router.query, category: 'followings' },
									}}
									scroll={false}
									style={{ width: '100%' }}
								>
									<div className={'flex-box'}>
										<svg
											className={'com-icon'}
											fill={category === 'followings' ? 'white' : 'black'}
											height="800px"
											width="800px"
											version="1.1"
											id="Layer_1"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 328 328"
										>
											<g id="XMLID_334_">
												<path
													id="XMLID_337_"
													d="M177.75,64.001C177.75,29.4,149.601,1.25,115,1.25c-34.602,0-62.75,28.15-62.75,62.751
		S80.398,126.75,115,126.75C149.601,126.75,177.75,98.602,177.75,64.001z"
												/>
												<path
													id="XMLID_338_"
													d="M228.606,181.144c-5.858-5.857-15.355-5.858-21.214-0.001c-5.857,5.857-5.857,15.355,0,21.214
		l19.393,19.396l-19.393,19.391c-5.857,5.857-5.857,15.355,0,21.214c2.93,2.929,6.768,4.394,10.607,4.394
		c3.838,0,7.678-1.465,10.605-4.393l30-29.998c2.813-2.814,4.395-6.629,4.395-10.607c0-3.978-1.58-7.793-4.394-10.607
		L228.606,181.144z"
												/>
												<path
													id="XMLID_340_"
													d="M223,116.75c-34.488,0-65.145,16.716-84.298,42.47c-7.763-1.628-15.694-2.47-23.702-2.47
		c-63.412,0-115,51.589-115,115c0,8.284,6.715,15,15,15h125.596c19.246,24.348,49.03,40,82.404,40c57.896,0,105-47.103,105-105
		C328,163.854,280.896,116.75,223,116.75z M223,296.75c-41.356,0-75-33.645-75-75s33.644-75,75-75c41.354,0,75,33.645,75,75
		S264.354,296.75,223,296.75z"
												/>
											</g>
										</svg>
										<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
											Followings
										</Typography>
										<Typography className="count-title" variant="subtitle1">
											{member?.memberFollowings}
										</Typography>
									</div>
								</Link>
							</ListItem>
						</List>
					</Stack>
					<Stack className={'section'} sx={{ marginTop: '10px' }}>
						<div>
							<Typography className="title" variant={'h5'}>
								Community
							</Typography>
							<List className={'sub-section'}>
								<ListItem className={category === 'articles' ? 'focus' : ''}>
									<Link
										href={{
											pathname: '/member',
											query: { ...router.query, category: 'articles' },
										}}
										scroll={false}
										style={{ width: '100%' }}
									>
										<div className={'flex-box'}>
											{category === 'articles' ? (
												<img className={'com-icon'} src={'/img/icons/discoveryWhite.svg'} alt={'com-icon'} />
											) : (
												<img className={'com-icon'} src={'/img/icons/discovery.svg'} alt={'com-icon'} />
											)}

											<Typography className={'sub-title'} variant={'subtitle1'} component={'p'}>
												Articles
											</Typography>
											<Typography className="count-title" variant="subtitle1">
												{member?.memberArticles}
											</Typography>
										</div>
									</Link>
								</ListItem>
							</List>
						</div>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default MemberMenu;
