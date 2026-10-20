import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import HeroSection from '../homepage/HeroSection';
import { userVar } from '../../../apollo/store';
import { useReactiveVar } from '@apollo/client';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';//@ts-ignore
import 'swiper/css';//@ts-ignore
import 'swiper/css/pagination';//@ts-ignore
import 'swiper/css/navigation';

const withLayoutMain = (Component: any) => {
	return (props: any) => {
		const device = useDeviceDetect();
		const user = useReactiveVar(userVar);

		/** LIFECYCLES **/
		// sahifa birinchi ochilganda ishga tushadi: localStorage'da token bo'lsa,
		// undan foydalanuvchi ma'lumotini o'qib global userVar'ni to'ldiradi
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

						{/* V01 hero: sarlavha + 3D mashina + qidiruv */}
						<HeroSection />

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{/* chatting bilan bog'liq mantiq */}
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

export default withLayoutMain;
