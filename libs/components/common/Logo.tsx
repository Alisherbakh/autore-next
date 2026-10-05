import React from 'react';

interface LogoProps {
	dark?: boolean; // true: to'q fon ustida (footer) — oq yozuv
}

// Autore logotipi: ko'k belgi + "AUTORE" yozuvi (V01 dizayn)
const Logo = ({ dark = false }: LogoProps) => {
	return (
		<span className={`autore-logo ${dark ? 'dark' : ''}`}>
			<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
				<rect width="32" height="32" rx="9" fill="#0057FF" />
				<path
					d="M8 21l8-11 8 11"
					fill="none"
					stroke="#FFFFFF"
					strokeWidth="3"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<circle cx="16" cy="21" r="2" fill="#FFFFFF" />
			</svg>
			<span className={'autore-logo-text'}>AUTORE</span>
		</span>
	);
};

export default Logo;
