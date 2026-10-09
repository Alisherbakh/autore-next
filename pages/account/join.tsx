import React, { useCallback, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Checkbox, FormControlLabel, FormGroup, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { logIn, signUp } from '../../libs/auth';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(true);
	// parolni ko'rsatish / yashirish (faqat ko'rinish uchun)
	const [showPassword, setShowPassword] = useState<boolean>(false);

	/** HANDLERS **/
	// "SIGNUP"/"LOGIN" havolasi bosilganda: forma ko'rinishini login yoki ro'yxatdan o'tish rejimiga almashtiradi
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	// "User"/"Dealer" checkbox'laridan biri bosilganda: tanlangan turni input.type'ga yozadi,
	// belgi olib tashlansa standart "USER" turiga qaytaradi
	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
		}
	};

	// istalgan input maydoni (nick/password/phone/type) o'zgarganda umumiy input state'ini yangilaydi
	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	// "LOGIN" bosilganda: libs/auth/index.ts dagi logIn() funksiyasini chaqiradi (token oladi, userVar'ni to'ldiradi),
	// muvaffaqiyatli bo'lsa referrer sahifasiga (yoki bosh sahifaga) qaytaradi
	const doLogin = useCallback(async () => {
		console.warn(input);
		try {
			await logIn(input.nick, input.password);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	// "SIGNUP" bosilganda: libs/auth/index.ts dagi signUp() funksiyasini chaqiradi (ro'yxatdan o'tkazadi, token oladi),
	// muvaffaqiyatli bo'lsa referrer sahifasiga (yoki bosh sahifaga) qaytaradi
	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await router.push(`${router.query.referrer ?? '/'}`);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input]);

	console.log('+input: ', input);

	if (device === 'mobile') {
		// mobil: bitta ekran — Login / Sign up tablari (o'sha viewChangeHandler), maydonlar 16px (iOS zoom bo'lmasligi uchun)
		const submit = loginView ? doLogin : doSignUp;
		const disabled = loginView
			? input.nick == '' || input.password == ''
			: input.nick == '' || input.password == '' || input.phone == '' || input.type == '';
		const onEnter = (event: any) => {
			if (event.key == 'Enter' && !disabled) submit();
		};
		return (
			<Stack className={'m-join'}>
				<div className={'m-join-hero'}>
					<span className={'m-join-brand'}>AUTORE</span>
					<h1>{loginView ? t('Welcome back') : t('Create your account')}</h1>
					<p>{t('Korea’s marketplace for new and used cars')}</p>
				</div>
				<div className={'m-join-card'}>
					<div className={'m-segment'} role="tablist">
						<button type="button" role="tab" aria-selected={loginView} className={loginView ? 'is-active' : ''} onClick={() => viewChangeHandler(true)}>
							{t('Login')}
						</button>
						<button type="button" role="tab" aria-selected={!loginView} className={!loginView ? 'is-active' : ''} onClick={() => viewChangeHandler(false)}>
							{t('Sign up')}
						</button>
					</div>
					<label className={'m-field'}>
						<span>{t('Nickname')}</span>
						<input type="text" autoComplete="username" placeholder={t('Your nickname')} onChange={(e) => handleInput('nick', e.target.value)} onKeyDown={onEnter} />
					</label>
					<label className={'m-field'}>
						<span>{t('Password')}</span>
						<input
							type="password"
							autoComplete={loginView ? 'current-password' : 'new-password'}
							placeholder={t('Your password')}
							onChange={(e) => handleInput('password', e.target.value)}
							onKeyDown={onEnter}
						/>
					</label>
					{!loginView && (
						<>
							<label className={'m-field'}>
								<span>{t('Phone')}</span>
								<input type="tel" autoComplete="tel" placeholder={'010-0000-0000'} onChange={(e) => handleInput('phone', e.target.value)} onKeyDown={onEnter} />
							</label>
							<div className={'m-field'}>
								<span>{t('I am a')}</span>
								<div className={'m-join-types'} role="radiogroup" aria-label={t('Account type')}>
									<button type="button" role="radio" aria-checked={input.type == 'USER'} className={input.type == 'USER' ? 'is-active' : ''} onClick={() => handleInput('type', 'USER')}>
										{t('Buyer (User)')}
									</button>
									<button type="button" role="radio" aria-checked={input.type == 'DEALER'} className={input.type == 'DEALER' ? 'is-active' : ''} onClick={() => handleInput('type', 'DEALER')}>
										{t('Dealer')}
									</button>
								</div>
							</div>
						</>
					)}
					<Button className={'m-join-submit'} disabled={disabled} onClick={submit}>
						{loginView ? t('Login') : t('Create account')}
					</Button>
					<p className={'m-join-switch'}>
						{loginView ? t('New to Autore?') : t('Already have an account?')}{' '}
						<button type="button" onClick={() => viewChangeHandler(!loginView)}>
							{loginView ? t('Sign up') : t('Login')}
						</button>
					</p>
				</div>
			</Stack>
		);
	} else {
		// desktop: to'liq ekranli qorong'i "yo'l" foni, markazda forma oynasi — logika o'zgarmagan
		const submit = loginView ? doLogin : doSignUp;
		const disabled = loginView
			? input.nick == '' || input.password == ''
			: input.nick == '' || input.password == '' || input.phone == '' || input.type == '';
		const onEnter = (event: any) => {
			if (event.key == 'Enter' && !disabled) submit();
		};
		return (
			<Stack className={'join-page jn-v2'}>
				{/* fon: tungi yo'l chiroqlari (bezak) */}
				<svg className={'jn-road'} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
					<defs>
						<linearGradient id="jnBeamA" x1="0" y1="1" x2="1" y2="0">
							<stop offset="0" stopColor="#0057FF" stopOpacity="0" />
							<stop offset="0.5" stopColor="#3D8BFF" stopOpacity="0.85" />
							<stop offset="1" stopColor="#A9C6FF" stopOpacity="0" />
						</linearGradient>
						<linearGradient id="jnBeamB" x1="0" y1="1" x2="1" y2="0">
							<stop offset="0" stopColor="#0057FF" stopOpacity="0" />
							<stop offset="0.6" stopColor="#0057FF" stopOpacity="0.55" />
							<stop offset="1" stopColor="#0057FF" stopOpacity="0" />
						</linearGradient>
						<filter id="jnGlow" x="-10%" y="-10%" width="120%" height="120%">
							<feGaussianBlur stdDeviation="9" />
						</filter>
					</defs>
					<path d="M-80 820 C 360 700, 700 520, 1520 300" stroke="url(#jnBeamA)" strokeWidth="14" fill="none" filter="url(#jnGlow)" />
					<path d="M-80 820 C 360 700, 700 520, 1520 300" stroke="url(#jnBeamA)" strokeWidth="2.5" fill="none" />
					<path d="M-80 920 C 400 790, 760 620, 1520 420" stroke="url(#jnBeamB)" strokeWidth="20" fill="none" filter="url(#jnGlow)" />
					<path d="M-80 920 C 400 790, 760 620, 1520 420" stroke="url(#jnBeamB)" strokeWidth="2" fill="none" />
					<path d="M-80 740 C 320 640, 640 450, 1520 200" stroke="url(#jnBeamB)" strokeWidth="1.5" fill="none" opacity="0.7" />
					<path d="M200 960 C 600 840, 980 700, 1520 600" stroke="#FC6C26" strokeOpacity="0.3" strokeWidth="3" fill="none" filter="url(#jnGlow)" />
				</svg>

				<section className={'jn-dialog'} aria-labelledby={'jn-title'}>
					<span className={'jn-glow'} aria-hidden="true" />
					<button type="button" className={'jn-close'} onClick={() => (window.history.length > 1 ? router.back() : router.push('/'))} aria-label={t('Close')}>
						<CloseRoundedIcon />
					</button>

					<h1 id={'jn-title'}>{loginView ? t('Welcome back') : t('Join Autore')}</h1>
					<p className={'jn-sub'}>
						{loginView
							? t('Log in to see the cars you liked and the dealers you follow.')
							: t('Find your next car or start selling — it takes less than a minute.')}
					</p>

					<div className={'jn-tabs'} role="tablist">
						<button type="button" role="tab" aria-selected={loginView} className={loginView ? 'is-active' : ''} onClick={() => viewChangeHandler(true)}>
							{t('Login')}
						</button>
						<button type="button" role="tab" aria-selected={!loginView} className={!loginView ? 'is-active' : ''} onClick={() => viewChangeHandler(false)}>
							{t('Sign up')}
						</button>
					</div>

					<label className={'jn-field'}>
						<span>{t('Nickname')}</span>
						<span className={'jn-input'}>
							<input
								type="text"
								autoComplete="username"
								placeholder={t('Your nickname')}
								onChange={(e) => handleInput('nick', e.target.value)}
								required={true}
								onKeyDown={onEnter}
							/>
						</span>
					</label>
					<label className={'jn-field'}>
						<span>{t('Password')}</span>
						<span className={'jn-input'}>
							<input
								type={showPassword ? 'text' : 'password'}
								autoComplete={loginView ? 'current-password' : 'new-password'}
								placeholder={t('Your password')}
								onChange={(e) => handleInput('password', e.target.value)}
								required={true}
								onKeyDown={onEnter}
							/>
							<button
								type="button"
								className={'jn-eye'}
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? t('Hide password') : t('Show password')}
							>
								{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
							</button>
						</span>
					</label>

					{!loginView && (
						<>
							<label className={'jn-field'}>
								<span>{t('Phone')}</span>
								<span className={'jn-input'}>
									<input
										type="tel"
										autoComplete="tel"
										placeholder={'010-0000-0000'}
										onChange={(e) => handleInput('phone', e.target.value)}
										required={true}
										onKeyDown={onEnter}
									/>
								</span>
							</label>
							<div className={'jn-types'} role="radiogroup" aria-label={t('Account type')}>
								{[
									{ value: 'USER', title: t('Buyer'), text: t('Find, like and follow') },
									{ value: 'DEALER', title: t('Dealer'), text: t('List cars, reach buyers') },
								].map((item) => (
									<button
										type="button"
										role="radio"
										aria-checked={input.type == item.value}
										key={item.value}
										className={`jn-type ${input.type == item.value ? 'is-active' : ''}`}
										onClick={() => handleInput('type', item.value)}
									>
										<strong>{item.title}</strong>
										<small>{item.text}</small>
									</button>
								))}
							</div>
						</>
					)}

					{loginView && (
						<div className={'jn-remember'}>
							<FormGroup>
								<FormControlLabel control={<Checkbox defaultChecked size="small" />} label={t('Remember me')} />
							</FormGroup>
							<a>{t('Lost your password?')}</a>
						</div>
					)}

					<Button className={'jn-submit'} disabled={disabled} onClick={submit} endIcon={<ArrowForwardRoundedIcon />}>
						{loginView ? t('Login') : t('Create account')}
					</Button>

					<p className={'jn-switch'}>
						{loginView ? t('New to Autore?') : t('Already have an account?')}{' '}
						<button type="button" onClick={() => viewChangeHandler(!loginView)}>
							{loginView ? t('Sign up') : t('Login')}
						</button>
					</p>
				</section>
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
