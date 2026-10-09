import React from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack } from '@mui/material';

const Advertisement = () => {
	const device = useDeviceDetect();

	if (device == 'mobile') {
		return (
			<Stack className={'video-frame'}>
				<video
					autoPlay
					muted
					loop
					playsInline
					preload="auto"
					poster="/video/hero-poster.jpg"
					style={{ width: '100%', height: '100%', objectFit: 'cover' }}
				>
					<source src="/video/hero.mp4" type="video/mp4" />
				</video>
			</Stack>
		);
	} else {
		// desktop: videoni sahifa kengligida emas, konteyner ichida 21:9 ramkada ko'rsatadi
		return (
			<Stack component={'section'} className={'hp-ad hp-section'} aria-label={'Advertisement'}>
				<Stack className={'container'}>
					<div className={'video-frame'}>
						<video
							autoPlay
							muted
							loop
							playsInline
							preload="auto"
							poster="/video/hero-poster.jpg"
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						>
							<source src="/video/hero.mp4" type="video/mp4" />
						</video>
					</div>
				</Stack>
			</Stack>
		);
	}
};

export default Advertisement;
