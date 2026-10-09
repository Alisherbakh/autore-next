import React, { useEffect } from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { useRouter } from 'next/router';

const AdminHome: NextPage = (props: any) => {
	const router = useRouter();

	/** LIFECYCLES **/
	// admin panelining bosh sahifasi (/_admin) hech narsa ko'rsatmaydi — darhol "Users" ro'yxatiga yo'naltiradi
	useEffect(() => {
		router.push('/_admin/users');
	}, []);
	return <></>;
};

export default withAdminLayout(AdminHome);
