import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import { useTranslation } from 'next-i18next';
import Logo from './common/Logo';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import useDeviceDetect from '../hooks/useDeviceDetect';
import { Stack, Box } from '@mui/material';
import moment from 'moment';

const Footer = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	if (device == 'mobile') {
		// mobil: ixcham to'q footer — telefon, yig'iladigan havola guruhlari (details/summary), ijtimoiy tarmoqlar
		const groups = [
			{ title: t('Popular search'), items: [t('Cars for sale'), t('Cheapest cars')] },
			{
				title: t('Quick links'),
				items: [t('Terms of use'), t('Privacy policy'), t('Pricing plans'), t('Our services'), t('Contact support'), t('FAQs')],
			},
			{ title: t('Discover'), items: [t('Seoul'), t('Gyeonggi-do'), t('Busan'), t('Jeju')] },
		];
		return (
			<Stack className={'footer-container m-footer'}>
				<span className={'m-footer-logo'}>
					<Logo dark />
				</span>
				<a href="tel:+821048672909" className={'m-footer-phone'}>
					<span>{t('Toll-free customer care')}</span>
					<strong>+82 10 4867 2909</strong>
				</a>
				<div className={'m-footer-groups'}>
					{groups.map((group) => (
						<details key={group.title}>
							<summary>
								{group.title}
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
									<path d="m6 9 6 6 6-6" />
								</svg>
							</summary>
							<ul>
								{group.items.map((item) => (
									<li key={item}>{item}</li>
								))}
							</ul>
						</details>
					))}
				</div>
				<div className={'m-footer-social'} aria-label={t('Follow us on social media')}>
					<FacebookOutlinedIcon />
					<TelegramIcon />
					<InstagramIcon />
					<TwitterIcon />
				</div>
				<span className={'m-footer-copy'}>
					© Autore {moment().year()}. {t('All rights reserved.')}
				</span>
			</Stack>
		);
	} else {
		return (
			<Stack className={'footer-container'}>
				<Stack className={'main'}>
					<Stack className={'left'}>
						<Box component={'div'} className={'footer-box'}>
							<span className={'logo'}>
								<Logo dark />
							</span>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('Toll-free customer care')}</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<span>{t('Live support')}</span>
							<p>+82 10 4867 2909</p>
						</Box>
						<Box component={'div'} className={'footer-box'}>
							<p>{t('Follow us on social media')}</p>
							<div className={'media-box'}>
								<FacebookOutlinedIcon />
								<TelegramIcon />
								<InstagramIcon />
								<TwitterIcon />
							</div>
						</Box>
					</Stack>
					<Stack className={'right'}>
						<Box component={'div'} className={'top'}>
							<strong>{t('Keep yourself up to date')}</strong>
							<div>
								<input type="text" placeholder={t('Your email')} />
								<span>{t('Subscribe')}</span>
							</div>
						</Box>
						<Box component={'div'} className={'bottom'}>
							<div>
								<strong>{t('Popular search')}</strong>
								<span>{t('Cars for sale')}</span>
								<span>{t('Cheapest cars')}</span>
							</div>
							<div>
								<strong>{t('Quick links')}</strong>
								<span>{t('Terms of use')}</span>
								<span>{t('Privacy policy')}</span>
								<span>{t('Pricing plans')}</span>
								<span>{t('Our services')}</span>
								<span>{t('Contact support')}</span>
								<span>{t('FAQs')}</span>
							</div>
							<div>
								<strong>{t('Discover')}</strong>
								<span>{t('Seoul')}</span>
								<span>{t('Gyeonggi-do')}</span>
								<span>{t('Busan')}</span>
								<span>{t('Jeju')}</span>
							</div>
						</Box>
					</Stack>
				</Stack>
				<Stack className={'second'}>
					<span>© Autore {moment().year()}. {t('All rights reserved.')}</span>
					{/* bosh sahifa galereyasi rasmlari CC BY-SA — mualliflarni ko'rsatish talab qilinadi */}
					<a href={'/img/fiber/CREDITS.md'} target={'_blank'} rel={'noreferrer'} style={{ color: 'inherit' }}>
						<span>{t('Site photos: Wikimedia Commons (CC BY / BY-SA)')}</span>
					</a>
					<span>{t('Privacy · Terms · Sitemap')}</span>
				</Stack>
			</Stack>
		);
	}
};

export default Footer;
