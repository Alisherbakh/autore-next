import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';
import { TotalCounter } from '../car/car';

export interface Notice {
	_id: string;
	noticeCategory: NoticeCategory;
	noticeStatus: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Notices {
	list: Notice[];
	metaCounter: TotalCounter[];
}

export interface NoticeInput {
	noticeCategory: NoticeCategory;
	noticeStatus?: NoticeStatus;
	noticeTitle: string;
	noticeContent: string;
}

export interface NoticesInquiry {
	page: number;
	limit: number;
	search: {
		noticeCategory: NoticeCategory;
		noticeStatus?: NoticeStatus;
		text?: string;
	};
}

export interface NoticeUpdate {
	_id: string;
	noticeStatus?: NoticeStatus;
	noticeTitle?: string;
	noticeContent?: string;
}
