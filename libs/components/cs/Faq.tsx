import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import { useQuery } from '@apollo/client';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { GET_NOTICES } from '../../../apollo/user/query';
import { NoticeCategory } from '../../enums/notice.enum';
import { Notice } from '../../types/notice/notice';
import { useTranslation } from 'next-i18next';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const [expanded, setExpanded] = useState<string | false>(false);

	/** APOLLO REQUESTS **/
	// GET_NOTICES (noticeCategory: FAQ) — savol-javoblarni admin panelda admin yozadi, bu yerda faqat ACTIVE'lari ko'rinadi
	const { data } = useQuery(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, search: { noticeCategory: NoticeCategory.FAQ } } },
	});
	const faqs: Notice[] = data?.getNotices?.list ?? [];

	/** HANDLERS **/
	// bitta savol (accordion) bosilganda ochiladi/yopiladi; bir vaqtda faqat bitta savol ochiq turadi
	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	if (device === 'mobile') {
		// mobil: savol kartalari — bittasi ochiladi (o'sha expanded holati)
		return (
			<Stack className={'m-faq'}>
				{faqs.length === 0 && <p className={'m-empty'}>{t('No FAQ yet.')}</p>}
				{faqs.map((ele: Notice) => {
					const open = expanded === ele._id;
					return (
						<div className={`m-faq-item ${open ? 'is-open' : ''}`} key={ele._id}>
							<button
								type="button"
								aria-expanded={open}
								aria-controls={`m-faq-${ele._id}`}
								onClick={(e) => handleChange(ele._id)(e, !open)}
							>
								<span className={'m-faq-q'}>Q</span>
								<strong>{ele.noticeTitle}</strong>
								<KeyboardArrowDownRoundedIcon className={'m-faq-arrow'} />
							</button>
							{open && (
								<p id={`m-faq-${ele._id}`} className={'m-faq-a'}>
									{ele.noticeContent}
								</p>
							)}
						</div>
					);
				})}
			</Stack>
		);
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'wrap'} component={'div'}>
					{faqs.length === 0 && <Typography sx={{ p: '24px' }}>No FAQ yet.</Typography>}
					{faqs.map((ele: Notice) => (
						<Accordion expanded={expanded === ele._id} onChange={handleChange(ele._id)} key={ele._id}>
							<AccordionSummary className="question" aria-controls={`faq-${ele._id}`}>
								<Typography className="badge" variant={'h4'}>
									Q
								</Typography>
								<Typography> {ele.noticeTitle}</Typography>
							</AccordionSummary>
							<AccordionDetails id={`faq-${ele._id}`}>
								<Stack className={'answer flex-box'}>
									<Typography className="badge" variant={'h4'} color={'primary'}>
										A
									</Typography>
									<Typography sx={{ whiteSpace: 'pre-line' }}> {ele.noticeContent}</Typography>
								</Stack>
							</AccordionDetails>
						</Accordion>
					))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
