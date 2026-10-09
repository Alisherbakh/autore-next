import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { CarBrand } from '../../enums/car.enum';
import useDeviceDetect from '../../hooks/useDeviceDetect';

// Hyundai uslubidagi hero: beton studiyada bitta katta mashina, 6 soniyada almashadi.
// Faqat UI — ma'lumot so'rovi yo'q. Rasmlar: public/img/hero/*.webp (fonsiz, 1000x442).
interface ShowcaseSlide {
	name: string; // ekrandagi sarlavha
	brand: CarBrand; // /car qidiruvidagi brend filtri
	model: string; // /car qidiruvidagi matn
	tag: string; // sarlavha ustidagi kichik yozuv
	sub: string;
	img: string;
}

// 8 ta slayd: luks (Genesis, K9) dan oilaviy va kundalik mashinalargacha
const SLIDES: ShowcaseSlide[] = [
	{ name: 'Kia K9', brand: CarBrand.KIA, model: 'K9', tag: 'FLAGSHIP SEDAN', sub: 'Kia’s flagship luxury sedan.', img: '/img/hero/kia-k9.webp' },
	{ name: 'Genesis G80', brand: CarBrand.GENESIS, model: 'G80', tag: 'LUXURY SEDAN', sub: 'Mid-size luxury sedan for business and family.', img: '/img/hero/genesis-g80.webp' },
	{ name: 'Kia K8', brand: CarBrand.KIA, model: 'K8', tag: 'PREMIUM SEDAN', sub: 'Premium full-size sedan with a fastback profile.', img: '/img/hero/kia-k8.webp' },
	{ name: 'Kia EV9 GT', brand: CarBrand.KIA, model: 'EV9', tag: 'ELECTRIC SUV', sub: 'Three-row electric SUV in GT trim.', img: '/img/hero/kia-ev9gt.webp' },
	{ name: 'Genesis GV70', brand: CarBrand.GENESIS, model: 'GV70', tag: 'LUXURY SUV', sub: 'Sporty mid-size luxury SUV.', img: '/img/hero/genesis-gv70.webp' },
	{ name: 'Kia Carnival', brand: CarBrand.KIA, model: 'Carnival', tag: 'FAMILY MPV', sub: 'Spacious people-mover for the whole family.', img: '/img/hero/kia-carnival.webp' },
	{ name: 'Kia Sorento', brand: CarBrand.KIA, model: 'Sorento', tag: 'MID-SIZE SUV', sub: 'One of Korea’s most popular family SUVs.', img: '/img/hero/kia-sorento.webp' },
	{ name: 'Kia K5', brand: CarBrand.KIA, model: 'K5', tag: 'MID-SIZE SEDAN', sub: 'Sporty mid-size sedan for everyday driving.', img: '/img/hero/kia-k5.webp' },
];

const AUTOPLAY_MS = 6000;

const HeroShowcase = () => {
	const { t } = useTranslation('common');
	const [index, setIndex] = useState(0);
	const [playing, setPlaying] = useState(true);
	const device = useDeviceDetect();
	// mobil: surish (swipe) boshlangan nuqta
	const [touchX, setTouchX] = useState<number | null>(null);
	const total = SLIDES.length;

	const go = useCallback((next: number) => setIndex(((next % total) + total) % total), [total]);

	/** LIFECYCLES **/
	// harakatni kamaytirish yoqilgan bo'lsa avtomatik almashish o'chadi
	useEffect(() => {
		if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
	}, []);

	useEffect(() => {
		if (!playing) return;
		const timer = setTimeout(() => go(index + 1), AUTOPLAY_MS);
		return () => clearTimeout(timer);
	}, [playing, index, go]);


	const next = SLIDES[(index + 1) % total];

	// mobil: bitta karta — rasm, matn, tugmalar; barmoq bilan surib almashtiriladi
	if (device === 'mobile') {
		const slide = SLIDES[index];
		return (
			<section
				className={'m-hero'}
				aria-roledescription={'carousel'}
				aria-label={t('Featured cars')}
				onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
				onTouchEnd={(e) => {
					if (touchX === null) return;
					const dx = e.changedTouches[0].clientX - touchX;
					if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
					setTouchX(null);
				}}
			>
				<div className={'m-hero-media'} aria-hidden={'true'}>
					{SLIDES.map((s, k) => (
						<img
							key={s.img}
							src={s.img}
							alt=""
							className={k === index ? 'is-active' : ''}
							width={1000}
							height={442}
							loading={k === 0 ? 'eager' : 'lazy'}
						/>
					))}
				</div>
				<div className={'m-hero-copy'}>
					<span className={'m-hero-tag'}>{t(slide.tag)}</span>
					<h1 id={'hero-title'}>{slide.name}</h1>
					<p>{t(slide.sub)}</p>
					<div className={'m-hero-actions'}>
						<Link href={'/car'} className={'m-hero-btn is-primary'}>
							{t('Search cars')}
						</Link>
						<Link href={'/dealer'} className={'m-hero-btn is-light'}>
							{t('Find a dealer')}
						</Link>
					</div>
				</div>
				<div className={'m-hero-dots'}>
					{SLIDES.map((s, k) => (
						<button
							key={s.name}
							type={'button'}
							className={k === index ? 'is-active' : ''}
							aria-label={t('Show {{name}}', { name: s.name })}
							aria-current={k === index}
							onClick={() => go(k)}
						/>
					))}
				</div>
			</section>
		);
	}

	return (
		<div className={'hero-showcase'} aria-roledescription={'carousel'} aria-label={t('Featured cars')}>
			<div className={'hs-stage'} aria-hidden={'true'}>
				<span className={'hs-wall'} />
				<span className={'hs-beam'} />
				<span className={'hs-floor'} />
				<span className={'hs-shadow'} />
			</div>

			<div className={'hs-inner'}>
				<div className={'hs-copy'}>
					{SLIDES.map((slide, k) => (
						<div key={slide.name} className={`hs-text ${k === index ? 'is-active' : ''}`} aria-hidden={k !== index}>
							<span className={'hs-tag'}>{t(slide.tag)}</span>
							<h1 id={k === index ? 'hero-title' : undefined}>{slide.name}</h1>
							<p>{t(slide.sub)}</p>
							<div className={'hs-actions'}>
								<Link href={'/dealer'} className={'hs-btn is-light'} tabIndex={k === index ? 0 : -1}>
									{t('Find a dealer')}
								</Link>
								<Link href={'/car'} className={'hs-btn is-primary'} tabIndex={k === index ? 0 : -1}>
									{t('Search cars')}
								</Link>
							</div>
						</div>
					))}
				</div>

				<div className={'hs-cars'}>
					{SLIDES.map((slide, k) => (
						<img
							key={slide.img}
							src={slide.img}
							alt={k === index ? slide.name : ''}
							aria-hidden={k !== index}
							className={`hs-car ${k === index ? 'is-active' : ''}`}
							width={1000}
							height={442}
							loading={k === 0 ? 'eager' : 'lazy'}
						/>
					))}
				</div>
			</div>

			<div className={'hs-controls'}>
				<div className={'hs-dots'}>
					{SLIDES.map((slide, k) => (
						<button
							key={slide.name}
							type={'button'}
							className={`hs-dot ${k === index ? 'is-active' : ''}`}
							aria-label={t('Show {{name}}', { name: slide.name })}
							aria-current={k === index}
							onClick={() => go(k)}
						/>
					))}
				</div>
				<button type={'button'} className={'hs-round'} onClick={() => setPlaying(!playing)} aria-label={playing ? t('Pause slideshow') : t('Play slideshow')}>
					{playing ? (
						<svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" aria-hidden="true">
							<rect x="5" y="4" width="4" height="16" rx="1" />
							<rect x="15" y="4" width="4" height="16" rx="1" />
						</svg>
					) : (
						<svg viewBox="0 0 24 24" width={12} height={12} fill="currentColor" aria-hidden="true">
							<path d="M7 4v16l13-8z" />
						</svg>
					)}
				</button>
				<div className={'hs-arrows'}>
					<button type={'button'} className={'hs-round'} onClick={() => go(index - 1)} aria-label={t('Previous car')}>
						<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="m15 6-6 6 6 6" />
						</svg>
					</button>
					<button type={'button'} className={'hs-next'} onClick={() => go(index + 1)} aria-label={t('Next: {{name}}', { name: next.name })}>
						<span>{next.name}</span>
						<svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
							<path d="m9 6 6 6-6 6" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default HeroShowcase;
