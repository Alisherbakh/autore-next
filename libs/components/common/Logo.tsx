import React from 'react';

interface LogoProps {
	dark?: boolean; // true: to'q fon ustida (footer) — oq yozuv
}

// Autore logotipi: ko'k belgi + "AUTORE" yozuvi (V01 dizayn)
// hover animatsiyasi v01.scss'dagi .autore-logo blokida (fon/soya effektisiz)
const Logo = ({ dark = false }: LogoProps) => {
	return (
		<span className={`autore-logo ${dark ? 'dark' : ''}`}>
			<svg className={'autore-logo-mark'} width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
				<rect className={'autore-logo-badge'} width="32" height="32" rx="9" fill="#0057FF" />
				<path
					className={'autore-logo-chevron'}
					d="M8 21l8-11 8 11"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle className={'autore-logo-dot'} cx="16" cy="21" r="2" fill="#FFFFFF" />
			</svg>
			{/* har bir harf alohida span — hover'da navbat bilan ko'tariladi (--i: kechikish tartibi) */}
			<span className={'autore-logo-text'} aria-label={'AUTORE'}>
				{'AUTORE'.split('').map((letter, i) => (
					<span key={i} aria-hidden="true" style={{ '--i': i } as React.CSSProperties}>
						{letter}
					</span>
				))}
			</span>
		</span>
	);
};

export default Logo;
