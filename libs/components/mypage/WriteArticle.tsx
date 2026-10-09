import React from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';
import { useTranslation } from 'next-i18next';
const TuiEditor = dynamic(() => import('../community/Teditor'), { ssr: false });

const WriteArticle: NextPage = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	// mobil va desktop'da bir xil — farqi stillarda (scss/pc/mypage/mypageV2.scss)
	return (
		<div id="mp-write-article" className={'mp-section'}>
			<Stack className="main-title-box">
				<Stack className="right-box">
					<Typography className="main-title">{t('Write an Article')}</Typography>
					<Typography className="sub-title">{t('Share a story, a review or a tip with other drivers.')}</Typography>
				</Stack>
			</Stack>
			<div className="mp-card mp-editor">
				<TuiEditor />
			</div>
		</div>
	);
};

export default WriteArticle;
