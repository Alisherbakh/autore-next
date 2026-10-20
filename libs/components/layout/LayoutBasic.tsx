import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { useTranslation } from 'next-i18next';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const withLayoutBasic = (Component: any) => {
	return (props: any) => {
		const router = useRouter();
		const { t, i18n } = useTranslation('common');
		const device = useDeviceDetect();
		const [authHeader, setAuthHeader] = useState<boolean>(false);
		const user = useReactiveVar(userVar);

		const memoizedValues = useMemo(() => {
			let title = '',
				desc = '',
				bgImage = '';

			// barcha ichki sahifalar uchun bitta sarlavha fon rasmi: Autore showroom (public/img/banner/page-autore.jpg)
			switch (router.pathname) {
				case '/car':
					title = 'Car Search';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/dealer':
					title = 'Dealers';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/dealer/detail':
					title = 'Dealer Page';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/mypage':
					title = 'my page';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/community':
					title = 'Community';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/community/detail':
					title = 'Community Detail';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/cs':
					title = 'CS';
					desc = 'We are glad to see you again!';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/account/join':
					title = 'Login/Signup';
					desc = 'Authentication Process';
					bgImage = '/img/banner/page-autore.jpg';
					setAuthHeader(true);
					break;
				case '/member':
					title = 'Member Page';
					desc = 'Home / For Sale';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				case '/about':
					title = 'About Autore';
					desc = 'Korea’s marketplace for new and used cars';
					bgImage = '/img/banner/page-autore.jpg';
					break;
				default:
					break;
			}

			return { title, desc, bgImage };
		}, [router.pathname]);

		/** LIFECYCLES **/
		// sahifa birinchi ochilganda ishga tushadi: localStorage'da token bo'lsa,
		// undan foydalanuvchi ma'lumotini o'qib global userVar'ni to'ldiradi (sahifa yangilanganda ham login holati saqlanishi uchun)
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []); // faqat bir marta, komponent birinchi chizilganda ishga tushadi

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>Autore</title>
						<meta name={'title'} content={`Autore`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{/* chatting (mobil): to'liq ekranli chat oynasi */}
						<Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>Autore</title>
						<meta name={'title'} content={`Autore`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						{/* login / sign up sahifasida sarlavha banneri yo'q — sahifaning o'zi to'liq ekranli qorong'i fon */}
						{router.pathname !== '/account/join' && (
						<Stack
							className={`header-basic ${authHeader && 'auth'}`}
							style={{
								// 1-qatlam: rasm chetlarini tungi osmon rangiga silliq o'tkazadi (keng ekranda chok ko'rinmasligi uchun), 2-qatlam: rasm
								backgroundImage: `linear-gradient(90deg, #080b14 0%, rgba(8, 11, 20, 0) 7%, rgba(8, 11, 20, 0) 93%, #080b14 100%), url(${memoizedValues.bgImage})`,
								// rasm ekran kengligida, lekin 1536px'dan (asl o'lchami) kattalashmaydi — keng ekranda sarlavha belgining ustiga tushmasligi uchun
								backgroundSize: 'min(100%, 1536px) 100%, min(100%, 1536px) auto',
								backgroundRepeat: 'no-repeat',
								// 1536px kenglikda AUTORE belgisi y≈135px'da (135/1536 ≈ 8.8vw) — har qanday ekranda belgi navbar (87px) ostidan boshlanadi
								backgroundPosition: 'center top, center calc(100px - min(8.8vw, 135px))',
								backgroundColor: '#080b14', // keng ekranda rasm chetidagi bo'sh joy — tungi osmon rangi
								boxShadow: 'inset 10px 40px 150px 40px rgb(24 22 36)',
							}}
						>
							<Stack className={'container'}>
								<strong>{t(memoizedValues.title)}</strong>
								<span>{t(memoizedValues.desc)}</span>
							</Stack>
						</Stack>
						)}

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

					 <Chat />

						<Stack id={'footer'}>
							<Footer />
						</Stack>
					</Stack>
				</>
			);
		}
	};
};

export default withLayoutBasic;
