import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

// Admin: FAQ — Notice bilan bir xil boshqaruv, faqat category: FAQ
const AdminFaq: NextPage = () => {
	return <NoticeManager category={NoticeCategory.FAQ} title={'FAQ Management'} />;
};

export default withAdminLayout(AdminFaq);
