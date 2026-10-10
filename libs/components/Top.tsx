import React, { useCallback, useEffect, useRef } from 'react';
import Logo from './common/Logo';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, logOutToHome, updateUserInfo } from '../auth';
import { Stack, Box, Drawer } from '@mui/material';
import { sweetConfirmAlert } from '../sweetAlert';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { authModalVar, userVar } from '../../apollo/store';
import { Logout } from '@mui/icons-material';
import { REACT_APP_API_URL } from '../config';

const Top = () => {
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const router = useRouter();
	const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
	const [lang, setLang] = useState<string | null>('en');
	const drop = Boolean(anchorEl2);
	const [colorChange, setColorChange] = useState(false);
	const [anchorEl, setAnchorEl] = React.useState<any | HTMLElement>(null);
	let open = Boolean(anchorEl);
	const [bgColor, setBgColor] = useState<boolean>(false);
	const [logoutAnchor, setLogoutAnchor] = React.useState<null | HTMLElement>(null);
	const logoutOpen = Boolean(logoutAnchor);
	// mobil: pastdan ochiladigan menyu oynasi
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);

	/** LIFECYCLES **/
	// birinchi marta kirilganda localStorage'da til (locale) saqlanmagan bo'lsa "en"ni standart qilib belgilaydi,
	// saqlangan bo'lsa o'sha tilni state'ga o'qiydi (bayroq ikonkasi shu qiymatga qarab chiziladi)
	useEffect(() => {
		if (localStorage.getItem('locale') === null) {
			localStorage.setItem('locale', 'en');
			setLang('en');
		} else {
			setLang(localStorage.getItem('locale'));
		}
	}, [router]);

	// sahifa manziliga qarab navbar fonini o'zgartiradi (masalan car/detail sahifasida boshqacha ko'rinish uchun)
	useEffect(() => {
		switch (router.pathname) {
			case '/car/detail':
				setBgColor(true);
				break;
			default:
				break;
		}
	}, [router]);

	// sahifa birinchi ochilganda: localStorage'da token bo'lsa, undan foydalanuvchi ma'lumotini o'qib
	// global userVar'ni to'ldiradi (shu orqali navbar'da login/logout holati to'g'ri ko'rsatiladi)
	useEffect(() => {
		const jwt = getJwtToken();
		if (jwt) updateUserInfo(jwt);
	}, []);

	/** HANDLERS **/
	// til bayrog'i bosilganda til tanlash menyusini ochadi
	const langClick = (e: any) => {
		setAnchorEl2(e.currentTarget);
	};

	// til tanlash menyusini yopadi
	const langClose = () => {
		setAnchorEl2(null);
	};

	// menyudan til (en/kr/ru) tanlanganda: state va localStorage'ga yozadi, so'ng shu til bilan joriy sahifani qayta yuklaydi
	// (til kodi to'g'ridan-to'g'ri beriladi — avval bayroq rasmining id'si o'qilardi va koreys bayrog'i "uz" yuborardi)
	const langChoice = useCallback(
		async (locale: string) => {
			setLang(locale);
			localStorage.setItem('locale', locale);
			setAnchorEl2(null);
			await router.push(router.asPath, router.asPath, { locale });
		},
		[router],
	);

	// sahifa skroll qilinganda ishga tushadi: 50px'dan ko'p pastga tushilsa navbar fonini "rangli" qiladi
	const changeNavbarColor = () => {
		if (window.scrollY >= 50) {
			setColorChange(true);
		} else {
			setColorChange(false);
		}
	};

	// (hozircha JSX'da ishlatilmagan) hover menyusini yopadi
	const handleClose = () => {
		setAnchorEl(null);
	};

	// (hozircha JSX'da ishlatilmagan) sichqoncha ustidan o'tilganda menyuni ochadi/yopadi (toggle)
	const handleHover = (event: any) => {
		if (anchorEl !== event.currentTarget) {
			setAnchorEl(event.currentTarget);
		} else {
			setAnchorEl(null);
		}
	};

	const StyledMenu = styled((props: MenuProps) => (
		<Menu
			elevation={0}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'right',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'right',
			}}
			{...props}
		/>
	))(({ theme }) => ({
		'& .MuiPaper-root': {
			top: '109px',
			borderRadius: 6,
			marginTop: theme.spacing(1),
			minWidth: 160,
			color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
			boxShadow:
				'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
			'& .MuiMenu-list': {
				padding: '4px 0',
			},
			'& .MuiMenuItem-root': {
				'& .MuiSvgIcon-root': {
					fontSize: 18,
					color: theme.palette.text.secondary,
					marginRight: theme.spacing(1.5),
				},
				'&:active': {
					backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
				},
			},
		},
	}));

	// skroll listener'i bir marta qo'shiladi va komponent yo'qolganda olib tashlanadi
	useEffect(() => {
		changeNavbarColor();
		window.addEventListener('scroll', changeNavbarColor, { passive: true });
		return () => window.removeEventListener('scroll', changeNavbarColor);
	}, []);

	// bosh sahifada, skroll qilinmaguncha navbar hero rasmi ustida shaffof bo'ladi
	const onHero = router.pathname === '/' && !colorChange;
	// joriy sahifa havolasini belgilash (aria-current + chiziq)
	const isActive = (path: string) => (path === '/' ? router.pathname === '/' : router.pathname.startsWith(path));
	const langName = lang === 'kr' ? t('Korean') : lang === 'ru' ? t('Russian') : t('English');

	if (device == 'mobile') {
		// mobil: tepada ilova paneli (logo + til + menyu), pastda doimiy tab bar, menyu — pastdan ochiladigan oyna
		const tabs = [
			{ href: '/', path: '/', label: t('Home'), icon: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5' },
			{ href: '/car', path: '/car', label: t('Cars'), icon: 'M3 15l2-5h14l2 5v3H3zM7 18h.01M17 18h.01' },
			{ href: '/dealer', path: '/dealer', label: t('Dealers'), icon: 'M3 9l1.5-5h15L21 9M4 9v11h16V9M9 20v-6h6v6' },
			{
				href: '/community?articleCategory=FREE',
				path: '/community',
				label: t('Community'),
				icon: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
			},
			{
				href: user?._id ? '/mypage' : '/account/join',
				path: user?._id ? '/mypage' : '/account',
				label: t('My'),
				icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6',
			},
		];
		const sheetLinks = [
			...tabs.slice(0, 4),
			{ href: '/cs', path: '/cs', label: t('Customer service'), icon: 'M4 13a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 13v4a2 2 0 0 0 2 2h1v-6H4' },
			{ href: '/about', path: '/about', label: t('About Autore'), icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01' },
		];
		const userImage = user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : null;
		const svgIcon = (d: string, size = 22) => (
			<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
				<path d={d} />
			</svg>
		);

		return (
			<>
				<header className={'m-appbar'}>
					<Link href={'/'} className={'m-logo'} aria-label={'Autore home'}>
						<Logo />
					</Link>
					<div className={'m-appbar-actions'}>
						<button type="button" className={'m-lang'} onClick={() => setSheetOpen(true)} aria-label={t('Language')}>
							{svgIcon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18', 16)}
							{(lang ?? 'en').toUpperCase()}
						</button>
						<button type="button" className={'m-icon-btn'} onClick={() => setSheetOpen(true)} aria-label={t('Open menu')}>
							{svgIcon('M4 7h16M4 12h16M4 17h16', 24)}
						</button>
					</div>
				</header>

				{/* mashina sahifasida pastda o'zining narx + qo'ng'iroq paneli bor — tab bar ko'rsatilmaydi */}
				{router.pathname !== '/car/detail' && (
				<nav className={'m-tabbar'} aria-label={t('Main')}>
					{tabs.map((tab) => {
						const active = isActive(tab.path);
						return (
							<Link key={tab.label} href={tab.href} className={`m-tab ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined}>
								<span className={'m-tab-icon'}>{svgIcon(tab.icon)}</span>
								{tab.label}
							</Link>
						);
					})}
				</nav>
				)}

				<Drawer
					anchor={'bottom'}
					open={sheetOpen}
					onClose={() => setSheetOpen(false)}
					PaperProps={{ className: 'm-sheet' }}
				>
					<span className={'m-sheet-handle'} aria-hidden="true" />
					{user?._id ? (
						<div className={'m-sheet-profile'}>
							<span className={'m-sheet-avatar'}>
								{userImage ? <img src={userImage} alt="" /> : (user?.memberNick ?? 'U').slice(0, 1).toUpperCase()}
							</span>
							<div className={'m-sheet-who'}>
								<strong>{user?.memberNick}</strong>
								<span className={`m-sheet-role is-${(user?.memberType ?? 'USER').toLowerCase()}`}>{t(user?.memberType ?? 'USER')}</span>
							</div>
							<Link href={'/mypage'} className={'m-sheet-btn'} onClick={() => setSheetOpen(false)}>
								{t('My Page')}
							</Link>
						</div>
					) : (
						<Link href={'/account/join'} className={'m-sheet-login'} onClick={() => setSheetOpen(false)}>
							{t('Login / Sign up')}
						</Link>
					)}

					<nav className={'m-sheet-links'} aria-label={t('Pages')}>
						{sheetLinks.map((link) => (
							<Link key={link.label} href={link.href} onClick={() => setSheetOpen(false)} className={isActive(link.path) ? 'is-active' : ''}>
								{svgIcon(link.icon)}
								<span>{link.label}</span>
								{svgIcon('m9 6 6 6-6 6', 18)}
							</Link>
						))}
					</nav>

					<div className={'m-sheet-lang'}>
						<span>{t('Language')}</span>
						<div role="radiogroup" aria-label={t('Language')}>
							{[
								{ code: 'en', label: 'English' },
								{ code: 'kr', label: '한국어' },
								{ code: 'ru', label: 'Русский' },
							].map((item) => (
								<button
									type="button"
									role="radio"
									aria-checked={lang === item.code}
									key={item.code}
									className={lang === item.code ? 'is-active' : ''}
									onClick={async () => {
										setSheetOpen(false);
										await langChoice(item.code);
									}}
								>
									{item.label}
								</button>
							))}
						</div>
					</div>

					{user?._id && (
						<button
							type="button"
							className={'m-sheet-logout'}
							onClick={async () => {
								setSheetOpen(false);
								if (await sweetConfirmAlert(t('Do you want to logout?'))) {
									// mobil: chiqqandan keyin bosh sahifaga (tanlangan til saqlanadi)
									const homePath = router.locale && router.locale !== router.defaultLocale ? `/${router.locale}` : '/';
									logOutToHome(homePath);
								}
							}}
						>
							{svgIcon('M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10', 20)}
							{t('Logout')}
						</button>
					)}
				</Drawer>
			</>
		);
	} else {
		return (
			<Stack className={'navbar'}>
				<Stack
					className={`navbar-main ${colorChange ? 'transparent' : ''} ${bgColor ? 'transparent' : ''} ${onHero ? 'on-hero' : ''}`}
				>
					<Stack className={'container'}>
						<Box component={'div'} className={'logo-box'}>
							<Link href={'/'} aria-label={'Autore home'}>
								<Logo dark={onHero} />
							</Link>
						</Box>
						<nav className={'router-box'} aria-label={t('Main')}>
							{[
								{ href: '/', path: '/', label: t('Home') },
								{ href: '/car', path: '/car', label: t('Cars') },
								{ href: '/dealer', path: '/dealer', label: t('Dealers') },
								{ href: '/community?articleCategory=FREE', path: '/community', label: t('Community') },
								...(user?._id ? [{ href: '/mypage', path: '/mypage', label: t('My Page') }] : []),
								{ href: '/cs', path: '/cs', label: t('CS') },
							].map((item) => (
								<Link
									href={item.href}
									key={item.path}
									className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
									aria-current={isActive(item.path) ? 'page' : undefined}
								>
									{item.label}
								</Link>
							))}
						</nav>
						<Box component={'div'} className={'user-box'}>
							{user?._id ? (
								<>
									<button
										type={'button'}
										className={'login-user'}
										aria-label={t('Account menu')}
										aria-haspopup={'menu'}
										aria-expanded={logoutOpen}
										onClick={(event: any) => setLogoutAnchor(event.currentTarget)}
									>
										<img
											src={
												user?.memberImage ? `${REACT_APP_API_URL}/${user?.memberImage}` : '/img/profile/defaultUser.svg'
											}
											alt=""
											width={40}
											height={40}
										/>
									</button>

									<Menu
										id="basic-menu"
										anchorEl={logoutAnchor}
										open={logoutOpen}
										onClose={() => {
											setLogoutAnchor(null);
										}}
										sx={{ mt: '5px' }}
									>
										<MenuItem onClick={() => router.push('/mypage')}>{t('My Page')}</MenuItem>
										<MenuItem onClick={() => logOut()}>
											<Logout fontSize="small" className={'logout-icon'} aria-hidden="true" />
											{t('Logout')}
										</MenuItem>
									</Menu>
								</>
							) : (
								<button type="button" className={'join-box'} aria-haspopup={'dialog'} onClick={() => authModalVar({ open: true, loginView: true })}>
									<AccountCircleOutlinedIcon aria-hidden="true" />
									<span>
										{t('Login')} / {t('Register')}
									</span>
								</button>
							)}

							<div className={'lan-box'}>
<Button
									disableRipple
									className="btn-lang"
									onClick={langClick}
									aria-label={`${t('Language')}: ${langName}`}
									aria-haspopup={'menu'}
									endIcon={<CaretDown size={14} weight="fill" className={'lang-caret'} aria-hidden="true" />}
								>
									<Box component={'div'} className={'flag'}>
										<img src={`/img/flag/lang${lang ?? 'en'}.png`} alt="" width={24} height={24} />
									</Box>
								</Button>

								<StyledMenu anchorEl={anchorEl2} open={drop} onClose={langClose} sx={{ position: 'absolute' }}>
									<MenuItem disableRipple onClick={() => langChoice('en')} lang={'en'}>
										<img className="img-flag" src={'/img/flag/langen.png'} alt="" width={24} height={24} />
										{'English'}
									</MenuItem>
									<MenuItem disableRipple onClick={() => langChoice('kr')} lang={'ko'}>
										<img className="img-flag" src={'/img/flag/langkr.png'} alt="" width={24} height={24} />
										{'한국어'}
									</MenuItem>
									<MenuItem disableRipple onClick={() => langChoice('ru')} lang={'ru'}>
										<img className="img-flag" src={'/img/flag/langru.png'} alt="" width={24} height={24} />
										{'Русский'}
									</MenuItem>
								</StyledMenu>
							</div>
						</Box>
					</Stack>
				</Stack>
			</Stack>
		);
	}
};

export default withRouter(Top);
