import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Stack, Box } from '@mui/material';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const About: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device === 'mobile') {
		// mobil: oddiy bir ustun — missiya, rasm, asosiy imkoniyatlar va yordam kartasi
		const features = [
			{ title: t('Browse dealers'), text: t('Browse dealers across nine cities, see their cars and reviews, and contact the one that fits you.') },
			{ title: t('Pay your way'), text: t('Cash, credit or barter — your choice') },
			{ title: t('Community'), text: t('Talk cars, share reviews and pick up tips from other drivers.') },
		];
		return (
			<Stack className={'m-about'}>
				<span className={'m-about-tag'}>{t('About Autore')}</span>
				<h1>{t('We’re on a mission to make buying and selling cars easy.')}</h1>
				<p className={'m-about-lead'}>{t('Korea’s marketplace for new and used cars')}</p>
				<img src="/img/banner/about-stats.jpg" alt="" className={'m-about-img'} />
				<div className={'m-about-list'}>
					{features.map((f, k) => (
						<div className={'m-about-item'} key={f.title}>
							<span className={'m-about-num'}>{String(k + 1).padStart(2, '0')}</span>
							<div>
								<strong>{f.title}</strong>
								<p>{f.text}</p>
							</div>
						</div>
					))}
				</div>
				<div className={'m-cs-call'}>
					<div>
						<span>{t('Need help? Talk to our expert.')}</span>
						<strong>+82 10 4867 2909</strong>
					</div>
					<a href="tel:+821048672909">{t('Call')}</a>
				</div>
				<Link href={'/car'} className={'m-about-cta'}>
					{t('Search cars')}
				</Link>
			</Stack>
		);
	} else {
		return (
			<Stack className={'about-page'}>
				<Stack className={'intro'}>
					<Stack className={'container'}>
						<Stack className={'left'}>
							<strong>We're on a Mission to Make Buying and Selling Cars Easy.</strong>
						</Stack>
						<Stack className={'right'}>
							<p>
								It doesn’t matter how organized you are — a surplus of toys will always ensure your house is a mess
								waiting to happen. Fortunately, getting kids on board with the idea of ditching their stuff is a lot
								easier than it sounds.
								<br />
								<br />
								Maecenas quis viverra metus, et efficitur ligula. Nam congue augue et ex congue, sed luctus lectus
								congue. Integer convallis condimentum sem. Duis elementum tortor eget condimentum tempor. Praesent
								sollicitudin lectus ut pharetra pulvinar.
							</p>
							<Stack className={'boxes'}>
								<div className={'box'}>
									<div>
										<img src="/img/icons/garden.svg" alt="" />
									</div>
									<span>Modern Sedan</span>
									<p>Nullam sollicitudin blandit Nullam maximus.</p>
								</div>
								<div className={'box'}>
									<div>
										<img src="/img/icons/securePayment.svg" alt="" />
									</div>
									<span>Secure Payment</span>
									<p>Nullam sollicitudin blandit Nullam maximus.</p>
								</div>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'statistics'}>
					<Stack className={'container'}>
						<Stack className={'banner'}>
							<img src="/img/banner/about-stats.jpg" alt="" />
						</Stack>
						<Stack className={'info'}>
							<Box component={'div'}>
								<strong>4M</strong>
								<p>Award Winning</p>
							</Box>
							<Box component={'div'}>
								<strong>12K</strong>
								<p>Car Ready</p>
							</Box>
							<Box component={'div'}>
								<strong>20M</strong>
								<p>Happy Customer</p>
							</Box>
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'dealers'}>
					<Stack className={'container'}>
						<span className={'title'}>Our Exclusive Agetns</span>
						<p className={'desc'}>Aliquam lacinia diam quis lacus euismod</p>
						<Stack className={'wrap'}>
							{/*{[1, 2, 3, 4, 5].map(() => {*/}
							{/*	return <DealerCard />;*/}
							{/*})}*/}
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'options'}>
					<img src="/img/banner/about-genesis.jpg" alt="" className={'about-banner'} />
					<Stack className={'container'}>
						<strong>Let’s find the right selling option for you</strong>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/security.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Car Management</span>
								<p>Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/keywording.svg" alt="" />
							</div>
							<div className={'text_-box'}>
								<span>Car Management</span>
								<p>Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.</p>
							</div>
						</Stack>
						<Stack>
							<div className={'icon-box'}>
								<img src="/img/icons/investment.svg" alt="" />
							</div>
							<div className={'text-box'}>
								<span>Car Management</span>
								<p>Nullam sollicitudin blandit eros eu pretium. Nullam maximus ultricies auctor.</p>
							</div>
						</Stack>
						<Stack className={'btn'}>
							Learn More
							<img src="/img/icons/rightup.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'partners'}>
					<Stack className={'container'}>
						<span>Trusted bu the world's best</span>
						<Stack className={'wrap'}>
							<img src="/img/icons/brands/amazon.svg" alt="" />
							<img src="/img/icons/brands/amd.svg" alt="" />
							<img src="/img/icons/brands/cisco.svg" alt="" />
							<img src="/img/icons/brands/dropcam.svg" alt="" />
							<img src="/img/icons/brands/spotify.svg" alt="" />
						</Stack>
					</Stack>
				</Stack>
				<Stack className={'help'}>
					<Stack className={'container'}>
						<Box component={'div'} className={'left'}>
							<strong>Need help? Talk to our expert.</strong>
							<p>Talk to our experts or Browse through more cars.</p>
						</Box>
						<Box component={'div'} className={'right'}>
							<div className={'white'}>
								Contact Us
								<img src="/img/icons/rightup.svg" alt="" />
							</div>
							<div className={'black'}>
								<img src="/img/icons/call.svg" alt="" />
								920 851 9087
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withLayoutBasic(About);
