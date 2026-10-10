import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import MyCars from '../../libs/components/mypage/MyCars';
import MyFavorites from '../../libs/components/mypage/MyFavorites';
import RecentlyVisited from '../../libs/components/mypage/RecentlyVisited';
import AddCar from '../../libs/components/mypage/AddNewCar';
import MyProfile from '../../libs/components/mypage/MyProfile';
import MyArticles from '../../libs/components/mypage/MyArticles';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
import { LIKE_TARGET_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../apollo/user/mutation';
import { Messages } from '../../libs/config';
import MyMenu from '../../libs/components/mypage/MyMenu';
import WriteArticle from '../../libs/components/mypage/WriteArticle';
import MemberFollowers from '../../libs/components/member/MemberFollowers';
import { sweetErrorHandling, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import MemberFollowings from '../../libs/components/member/MemberFollowings';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const MyPage: NextPage = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const category: any = router.query?.category ?? 'myProfile';

	/** APOLLO REQUESTS **/
	// boshqa foydalanuvchiga obuna bo'lish (follow) uchun mutatsiya
	const [subscribe] = useMutation(SUBSCRIBE);
	// obunani bekor qilish (unfollow) uchun mutatsiya
	const [unsubscribe] = useMutation(UNSUBSCRIBE);
	// foydalanuvchiga like bosish uchun mutatsiya
	const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);

	/** LIFECYCLES **/
	// ADMIN-GUARD emas, LOGIN-GUARD: userVar bo'sh (login qilinmagan) bo'lsa bosh sahifaga qaytaradi —
	// mypage faqat tizimga kirgan foydalanuvchilar uchun
	useEffect(() => {
		if (!user._id) router.push('/').then();
	}, [user]);

	/** HANDLERS **/
	// foydalanuvchiga obuna bo'lish, so'ng caller bergan refetch orqali ro'yxatni yangilaydi
	const subscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			console.log('id: ', id);
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await subscribe({
				variables: {
					input: id,
				},
			});
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// obunani bekor qilish, so'ng ro'yxatni yangilaydi
	const unsubscribeHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) throw new Error(Messages.error1);
			if (!user._id) throw new Error(Messages.error2);

			await unsubscribe({
				variables: {
					input: id,
				},
			});
			await refetch({ input: query });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	// foydalanuvchiga like bosish, so'ng ro'yxatni yangilaydi
	const likeMemberHandler = async (id: string, refetch: any, query: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);

			await likeTargetMember({
				variables: {
					input: id,
				},
			});
			await refetch({ input: query });
		} catch (err: any) {
			console.log('ERROR, likeMemberHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// follower/following ro'yxatidagi a'zo ismi bosilganda: o'zi bo'lsa mypage'ga, aks holda uning profil sahifasiga o'tkazadi
	const redirectToMemberPageHandler = async (memberId: string) => {
		try {
			if (memberId === user?._id) await router.push(`/mypage?memberId=${memberId}`);
			else await router.push(`/member?memberId=${memberId}`);
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	// mobil va desktop'da bir xil tuzilma — desktop'da 2 ustun (menyu + kontent), mobilda bir ustun
	return (
		<div id="my-page" className={`mp-v2 ${device === 'mobile' ? 'mp-mobile' : ''}`}>
			<div className="mp-wrap">
				<aside className={'left-config mp-side'}>
					<MyMenu />
				</aside>
				<main className="main-config mp-content">
					{category === 'addCar' && <AddCar />}
					{category === 'myCars' && <MyCars />}
					{category === 'myFavorites' && <MyFavorites />}
					{category === 'recentlyVisited' && <RecentlyVisited />}
					{category === 'myArticles' && <MyArticles />}
					{category === 'writeArticle' && <WriteArticle />}
					{category === 'myProfile' && <MyProfile />}
					{category === 'followers' && (
						<MemberFollowers
							subscribeHandler={subscribeHandler}
							unsubscribeHandler={unsubscribeHandler}
							redirectToMemberPageHandler={redirectToMemberPageHandler}
							likeMemberHandler={likeMemberHandler}
						/>
					)}
					{category === 'followings' && (
						<MemberFollowings
							subscribeHandler={subscribeHandler}
							unsubscribeHandler={unsubscribeHandler}
							redirectToMemberPageHandler={redirectToMemberPageHandler}
							likeMemberHandler={likeMemberHandler}
						/>
					)}
				</main>
			</div>
		</div>
	);
};

export default withLayoutBasic(MyPage);
