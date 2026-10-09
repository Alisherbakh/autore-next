import React from 'react';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Member } from '../../types/member/member';
import DealerCard from '../common/DealerCard';

interface TopDealerProps {
	dealer: Member;
	likeMemberHandler?: any;
}
const TopDealerCard = (props: TopDealerProps) => {
	const { dealer, likeMemberHandler } = props;
	const device = useDeviceDetect();
	const dealerImage = dealer?.memberImage
		? `${process.env.REACT_APP_API_URL}/${dealer?.memberImage}`
		: '/img/profile/defaultUser.svg';

	if (device === 'mobile') {
		return (
			<Stack className="top-dealer-card">
				<img src={dealerImage} alt="" />

				<strong>{dealer?.memberNick}</strong>
				<span>{dealer?.memberType}</span>
			</Stack>
		);
	} else {
		// desktop: /dealer sahifasidagi bilan bir xil karta (like tugmasisiz — bosh sahifada like mantiqi yo'q)
		return <DealerCard dealer={dealer} likeMemberHandler={likeMemberHandler} />;
	}
};

export default TopDealerCard;
