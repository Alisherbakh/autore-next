import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	InputAdornment,
	List,
	ListItem,
	MenuItem,
	OutlinedInput,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { NotePencil } from 'phosphor-react';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import { CREATE_NOTICE, UPDATE_NOTICE_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { NoticeCategory, NoticeStatus } from '../../../enums/notice.enum';
import { Notice, NoticesInquiry } from '../../../types/notice/notice';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { T } from '../../../types/common';

interface NoticeManagerProps {
	category: NoticeCategory; // NOTICE yoki FAQ — ikkala admin sahifa shu bitta komponentdan foydalanadi
	title: string;
}

// tablar: undefined = "All" (DELETE'dan boshqa hammasi)
const TABS: { label: string; status?: NoticeStatus }[] = [
	{ label: 'All' },
	{ label: 'Active', status: NoticeStatus.ACTIVE },
	{ label: 'Hold', status: NoticeStatus.HOLD },
	{ label: 'Deleted', status: NoticeStatus.DELETE },
];

interface FormState {
	_id?: string;
	noticeTitle: string;
	noticeContent: string;
	noticeStatus: NoticeStatus;
}
const EMPTY_FORM: FormState = { noticeTitle: '', noticeContent: '', noticeStatus: NoticeStatus.ACTIVE };

const NoticeManager = (props: NoticeManagerProps) => {
	const { category, title } = props;
	const [inquiry, setInquiry] = useState<NoticesInquiry>({ page: 1, limit: 10, search: { noticeCategory: category } });
	const [searchText, setSearchText] = useState<string>('');
	const [form, setForm] = useState<FormState | null>(null); // null = dialog yopiq
	const [formError, setFormError] = useState<string>('');

	/** APOLLO REQUESTS **/
	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [createNotice] = useMutation(CREATE_NOTICE);
	const [updateNoticeByAdmin] = useMutation(UPDATE_NOTICE_BY_ADMIN);

	const notices: Notice[] = data?.getAllNoticesByAdmin?.list ?? [];
	const total: number = data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const changeTabHandler = (status?: NoticeStatus) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, noticeStatus: status } });
	};

	const searchHandler = (text: string) => {
		setInquiry({ ...inquiry, page: 1, search: { ...inquiry.search, text: text || undefined } });
	};

	// dialogdagi "Save": _id bo'lsa tahrirlaydi, bo'lmasa yangisini yaratadi
	const saveHandler = async () => {
		if (!form) return;
		if (form.noticeTitle.trim().length < 3 || form.noticeContent.trim().length < 3) {
			setFormError('Title and content must be at least 3 characters.');
			return;
		}
		try {
			if (form._id) {
				await updateNoticeByAdmin({
					variables: {
						input: { _id: form._id, noticeTitle: form.noticeTitle, noticeContent: form.noticeContent, noticeStatus: form.noticeStatus },
					},
				});
			} else {
				await createNotice({
					variables: {
						input: { noticeCategory: category, noticeTitle: form.noticeTitle, noticeContent: form.noticeContent, noticeStatus: form.noticeStatus },
					},
				});
			}
			setForm(null);
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Saved', 800);
		} catch (err: any) {
			setFormError(err?.message ?? 'Something went wrong');
		}
	};

	// o'chirish = noticeStatus: DELETE (bazadan butunlay o'chmaydi, "Deleted" tabida qoladi)
	const deleteHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Are you sure to delete?'))) return;
			await updateNoticeByAdmin({ variables: { input: { _id: id, noticeStatus: NoticeStatus.DELETE } } });
			await refetch({ input: inquiry });
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const openEdit = (notice: Notice) => {
		setFormError('');
		setForm({ _id: notice._id, noticeTitle: notice.noticeTitle, noticeContent: notice.noticeContent, noticeStatus: notice.noticeStatus });
	};

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>{title}</Typography>
				<Button
					className="btn_add"
					variant={'contained'}
					size={'medium'}
					onClick={() => {
						setFormError('');
						setForm({ ...EMPTY_FORM });
					}}
				>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>

			<Box component={'div'} className={'table-wrap'}>
				<List className={'tab-menu'}>
					{TABS.map((tab) => (
						<ListItem
							key={tab.label}
							onClick={() => changeTabHandler(tab.status)}
							className={inquiry.search.noticeStatus === tab.status ? 'li on' : 'li'}
						>
							{tab.label}
							{inquiry.search.noticeStatus === tab.status ? ` (${total})` : ''}
						</ListItem>
					))}
				</List>
				<Divider />
				<Stack className={'search-area'} sx={{ m: '24px' }}>
					<OutlinedInput
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						sx={{ width: '100%' }}
						className={'search'}
						placeholder="Search by title"
						onKeyDown={(event) => {
							if (event.key === 'Enter') searchHandler(searchText);
						}}
						endAdornment={
							<>
								{searchText && (
									<CancelRoundedIcon
										style={{ cursor: 'pointer' }}
										onClick={() => {
											setSearchText('');
											searchHandler('');
										}}
									/>
								)}
								<InputAdornment position="end" onClick={() => searchHandler(searchText)} style={{ cursor: 'pointer' }}>
									<img src="/img/icons/search_icon.png" alt={'search'} />
								</InputAdornment>
							</>
						}
					/>
				</Stack>
				<Divider />

				<TableContainer>
					<Table sx={{ minWidth: 750 }}>
						<TableHead>
							<TableRow>
								<TableCell>TITLE</TableCell>
								<TableCell>STATUS</TableCell>
								<TableCell>DATE</TableCell>
								<TableCell align="right">ACTION</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{notices.length === 0 && (
								<TableRow>
									<TableCell colSpan={4} align="center">
										No data
									</TableCell>
								</TableRow>
							)}
							{notices.map((notice: Notice) => (
								<TableRow hover key={notice._id}>
									<TableCell>{notice.noticeTitle}</TableCell>
									<TableCell>{notice.noticeStatus}</TableCell>
									<TableCell>{moment(notice.createdAt).format('YYYY.MM.DD')}</TableCell>
									<TableCell align="right">
										<Tooltip title="edit">
											<IconButton onClick={() => openEdit(notice)}>
												<NotePencil size={24} weight="fill" />
											</IconButton>
										</Tooltip>
										{notice.noticeStatus !== NoticeStatus.DELETE && (
											<Tooltip title="delete">
												<IconButton onClick={() => deleteHandler(notice._id)}>
													<DeleteRoundedIcon />
												</IconButton>
											</Tooltip>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>

				<TablePagination
					rowsPerPageOptions={[10, 20, 40]}
					component="div"
					count={total}
					rowsPerPage={inquiry.limit}
					page={inquiry.page - 1}
					onPageChange={(e: any, newPage: number) => setInquiry({ ...inquiry, page: newPage + 1 })}
					onRowsPerPageChange={(e: T) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
				/>
			</Box>

			{/* yaratish / tahrirlash oynasi */}
			<Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth={'sm'}>
				<DialogTitle>{form?._id ? 'Edit' : 'Add'} {category === NoticeCategory.FAQ ? 'FAQ' : 'Notice'}</DialogTitle>
				<DialogContent>
					<Stack sx={{ gap: '16px', pt: '8px' }}>
						<TextField
							label={category === NoticeCategory.FAQ ? 'Question' : 'Title'}
							value={form?.noticeTitle ?? ''}
							onChange={(e) => form && setForm({ ...form, noticeTitle: e.target.value })}
							inputProps={{ maxLength: 100 }}
						/>
						<TextField
							label={category === NoticeCategory.FAQ ? 'Answer' : 'Content'}
							value={form?.noticeContent ?? ''}
							onChange={(e) => form && setForm({ ...form, noticeContent: e.target.value })}
							multiline
							minRows={5}
							// MaterialTheme'da MuiOutlinedInput balandligi 48px qilib qotirilgan — ko'p qatorli maydonda matn
							// yuqoriga (Title ustiga) chiqib ketmasligi uchun balandlikni avtomatik qilamiz
							sx={{ '& .MuiOutlinedInput-root': { height: 'auto', alignItems: 'flex-start' } }}
							inputProps={{ maxLength: 2000 }}
						/>
						<Select
							value={form?.noticeStatus ?? NoticeStatus.ACTIVE}
							onChange={(e) => form && setForm({ ...form, noticeStatus: e.target.value as NoticeStatus })}
						>
							<MenuItem value={NoticeStatus.ACTIVE}>ACTIVE (visible on site)</MenuItem>
							<MenuItem value={NoticeStatus.HOLD}>HOLD (hidden draft)</MenuItem>
							{form?._id && <MenuItem value={NoticeStatus.DELETE}>DELETE</MenuItem>}
						</Select>
						{formError && <Typography color={'error'}>{formError}</Typography>}
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: '16px 24px' }}>
					<Button onClick={() => setForm(null)}>Cancel</Button>
					<Button variant={'contained'} onClick={saveHandler}>
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NoticeManager;
