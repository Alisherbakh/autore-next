import React from 'react';
import { Stack } from '@mui/material';
import { useRouter } from 'next/router';
import { CarBrand } from '../../enums/car.enum';

// Brendlar qatori: brend bosilsa /car sahifasi shu brend filtri bilan ochiladi
const BrandStrip = () => {
	const router = useRouter();
	const brands = Object.values(CarBrand).filter((brand) => brand !== CarBrand.OTHER);

	const pushBrandHandler = async (brand: CarBrand) => {
		const input = { page: 1, limit: 9, sort: 'createdAt', direction: 'DESC', search: { brandList: [brand] } };
		await router.push(`/car?input=${JSON.stringify(input)}`, `/car?input=${JSON.stringify(input)}`);
	};

	return (
		<Stack className={'brand-strip'}>
			<Stack className={'container'}>
				{brands.map((brand: CarBrand) => (
					<button type={'button'} key={brand} onClick={() => pushBrandHandler(brand)}>
						{brand}
					</button>
				))}
			</Stack>
		</Stack>
	);
};

export default BrandStrip;
