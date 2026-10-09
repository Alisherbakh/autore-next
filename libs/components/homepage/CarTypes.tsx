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
					{types.map((type: CarType) => (
						<button type={'button'} className={'type-tile'} key={type} onClick={() => pushTypeHandler(type)}>
							{/* haqiqiy mashina rasmi: public/img/types/<tur>.jpg (mualliflar — public/img/fiber/CREDITS.md) */}
							<span className={'type-photo'}>
								<img src={`/img/types/${type.toLowerCase()}.jpg`} alt={type} loading={'lazy'} />
							</span>
							<span className={'type-name'}>
								<strong>{type}</strong>
								<span>{t('Browse')} →</span>
							</span>
						</button>
					))}
				</div>
			</Stack>
		</Stack>
	);
};

export default CarTypes;
