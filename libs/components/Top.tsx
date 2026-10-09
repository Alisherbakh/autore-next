import React, { useCallback, useEffect, useRef } from 'react';
import Logo from './common/Logo';
import { useState } from 'react';
import { useRouter, withRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { getJwtToken, logOut, updateUserInfo } from '../auth';
import { Stack, Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { CaretDown } from 'phosphor-react';
import useDeviceDetect from '../hooks/useDeviceDetect';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../apollo/store';
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
		return (
			<Stack className={'top'}>
				<Link href={'/'}>
					<div>{t('Home')}</div>
				</Link>
				<Link href={'/car'}>
					<div>{t('Cars')}</div>
				</Link>
				<Link href={'/dealer'}>
					<div> {t('Dealers')} </div>
				</Link>
				<Link href={'/community?articleCategory=FREE'}>
					<div> {t('Community')} </div>
				</Link>
				<Link href={'/cs'}>
					<div> {t('CS')} </div>
				</Link>
			</Stack>
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
								<Link href={'/account/join'} className={'join-box'}>
									<AccountCircleOutlinedIcon aria-hidden="true" />
									<span>
										{t('Login')} / {t('Register')}
									</span>
								</Link>
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
