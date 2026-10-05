import React from 'react';
import { Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { CarType } from '../../enums/car.enum';

// "Pick a body style" bo'limi: kuzov turi bosilsa /car sahifasi shu tur filtri bilan ochiladi
const CarTypes = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const types = Object.values(CarType);
	const tallTypes: string[] = [CarType.SUV, CarType.VAN, CarType.PICKUP, CarType.WAGON];

	const pushTypeHandler = async (type: CarType) => {
		const input = { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { typeList: [type] } };
		await router.push(`/car?input=${JSON.stringify(input)}`, `/car?input=${JSON.stringify(input)}`);
	};

	return (
		<Stack className={'car-types'}>
			<Stack className={'container'}>
				<Stack className={'section-head'}>
					<span className={'eyebrow'}>{t('BROWSE BY TYPE')}</span>
					<h2>{t('Pick a body style')}</h2>
				</Stack>
				<div className={'type-grid'}>
					{types.map((type: CarType, index: number) => (
						<button type={'button'} className={'type-tile'} key={type} onClick={() => pushTypeHandler(type)}>
							<span className={'type-name'}>
								<strong>{type}</strong>
								<span>{t('Browse')} →</span>
							</span>
							{tallTypes.includes(type) ? (
								<svg viewBox="0 0 400 160" width="140" height="56" aria-hidden="true">
									<path
										d="M18 110 L20 80 Q24 66 50 64 L96 60 Q120 30 150 26 L300 26 Q318 28 330 52 L360 62 Q382 68 384 90 L384 110 Q382 120 372 120 L338 120 A30 30 0 0 0 278 120 L128 120 A30 30 0 0 0 68 120 L28 120 Q18 120 18 110 Z"
										fill={index % 2 === 0 ? '#0057FF' : '#23262F'}
									/>
									<path d="M104 60 Q124 36 152 32 L296 32 Q310 34 320 58 Z" fill="#12151c" opacity="0.85" />
									<circle cx="98" cy="120" r="25" fill="#15171c" />
									<circle cx="98" cy="120" r="12" fill="#c9ccd2" />
									<circle cx="308" cy="120" r="25" fill="#15171c" />
									<circle cx="308" cy="120" r="12" fill="#c9ccd2" />
								</svg>
							) : (
								<svg viewBox="0 0 400 160" width="140" height="56" aria-hidden="true">
									<path
										d="M20 112 L24 92 Q30 84 60 80 L120 74 Q150 48 190 42 L250 42 Q275 44 300 70 L350 78 Q378 82 382 98 L382 112 Q380 120 370 120 L335 120 A30 30 0 0 0 275 120 L130 120 A30 30 0 0 0 70 120 L30 120 Q20 120 20 112 Z"
										fill={index % 2 === 0 ? '#0057FF' : '#23262F'}
									/>
									<path d="M132 74 Q158 52 190 48 L240 48 Q262 50 282 72 Z" fill="#12151c" opacity="0.85" />
									<circle cx="100" cy="120" r="24" fill="#15171c" />
									<circle cx="100" cy="120" r="11" fill="#c9ccd2" />
									<circle cx="305" cy="120" r="24" fill="#15171c" />
									<circle cx="305" cy="120" r="11" fill="#c9ccd2" />
								</svg>
							)}
						</button>
					))}
				</div>
			</Stack>
		</Stack>
	);
};

export default CarTypes;
