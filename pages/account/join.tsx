import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import useAuthForm from '../../libs/hooks/useAuthForm';
import AuthCard from '../../libs/components/auth/AuthCard';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Join: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	// forma state'i va handler'lari (login, signup, maydonlar) — libs/hooks/useAuthForm.ts (popup ham shuni ishlatadi)
	// muvaffaqiyatli bo'lsa referrer sahifasiga (yoki bosh sahifaga) qaytaradi
	const form = useAuthForm(async () => {
		await router.push(`${router.query.referrer ?? '/'}`);
	});
	const { input, loginView, viewChangeHandler, handleInput, doLogin, doSignUp } = form;

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
		// desktop: oddiy sahifa foni (Porcelain), markazda qorong'i karta — xuddi popup'dagidek (libs/components/auth/AuthCard.tsx)
		return (
			<Stack className={'join-page jn-v2'}>
				<AuthCard form={form} titleId={'jn-title'} onClose={() => (window.history.length > 1 ? router.back() : router.push('/'))} />
			</Stack>
		);
	}
};

export default withLayoutBasic(Join);
