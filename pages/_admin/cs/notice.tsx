import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

// Admin: e'lonlar (Notice) — ro'yxat, qidiruv, qo'shish, tahrirlash, o'chirish NoticeManager ichida
const AdminNotice: NextPage = () => {
	return <NoticeManager category={NoticeCategory.NOTICE} title={'Notice Management'} />;
};

export default withAdminLayout(AdminNotice);
