import React from 'react';
import { Button, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { useTranslation } from 'next-i18next';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { AuthForm } from '../../hooks/useAuthForm';

interface AuthCardProps {
	form: AuthForm; // useAuthForm() natijasi: state + handler'lar
	onClose: () => void; // "X" tugmasi
	titleId: string; // sarlavha id'si (aria-labelledby uchun)
	asDialog?: boolean; // true: popup ichida (sarlavha h2), false: alohida sahifa (sarlavha h1)
}

// Login / Sign up kartasi (qorong'i "D" dizayn) — /account/join sahifasi va desktop popup'i bir xil kartani ishlatadi
// stillar: scss/pc/account/joinV2.scss (.jn-dialog)
const AuthCard = ({ form, onClose, titleId, asDialog = false }: AuthCardProps) => {
	const { t } = useTranslation('common');
	const { input, loginView, showPassword, setShowPassword, viewChangeHandler, handleInput, doLogin, doSignUp } = form;

	const submit = loginView ? doLogin : doSignUp;
	const disabled = loginView
		? input.nick == '' || input.password == ''
		: input.nick == '' || input.password == '' || input.phone == '' || input.type == '';
	const onEnter = (event: any) => {
		if (event.key == 'Enter' && !disabled) submit();
	};
	const Title = asDialog ? 'h2' : 'h1';

	return (
		<section className={'jn-dialog'} aria-labelledby={titleId}>
			<span className={'jn-glow'} aria-hidden="true" />
			<button type="button" className={'jn-close'} onClick={onClose} aria-label={t('Close')}>
				<CloseRoundedIcon />
			</button>

			<Title id={titleId} className={'jn-title'}>
				{loginView ? t('Welcome back') : t('Join Autore')}
			</Title>
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
						value={input.nick}
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
						value={input.password}
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
								value={input.phone}
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
	);
};

export default AuthCard;
