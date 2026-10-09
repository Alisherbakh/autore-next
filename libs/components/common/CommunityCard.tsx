import React from 'react';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Stack, Typography } from '@mui/material';
import { BoardArticle } from '../../types/board-article/board-article';
import Moment from 'react-moment';
import { REACT_APP_API_URL, LIKED_COLOR } from '../../config';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import IconButton from '@mui/material/IconButton';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { useTranslation } from 'next-i18next';

import { CATEGORY_META } from '../community/categories';

interface CommunityCardProps {
	boardArticle: BoardArticle;
	size?: string;
	likeArticleHandler: any;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { boardArticle, size = 'normal', likeArticleHandler } = props;
	const device = useDeviceDetect();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const { t } = useTranslation('common');
	const imagePath: string = boardArticle?.articleImage
		? `${REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: '/img/community/communityImg.png';

	/** HANDLERS **/
	// karta bosilganda: shu maqolaning detail sahifasiga (kategoriya + id bilan) o'tkazadi
	const chooseArticleHandler = (e: React.SyntheticEvent, boardArticle: BoardArticle) => {
		router.push(
			{
				pathname: '/community/detail',
				query: { articleCategory: boardArticle?.articleCategory, id: boardArticle?._id },
			},
			undefined,
			{ shallow: true },
		);
	};

	// muallif ismi bosilganda: agar shu foydalanuvchining o'zi bo'lsa mypage'ga, aks holda uning profil sahifasiga o'tkazadi
	const goMemberPage = (id: string) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	// rasm bo'lmasa muallif nickidan 1–2 harf
	const authorNick: string = boardArticle?.memberData?.memberNick ?? '';
	const authorImage: string | null = boardArticle?.memberData?.memberImage
		? `${REACT_APP_API_URL}/${boardArticle?.memberData?.memberImage}`
		: null;
	const liked: boolean = !!(boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite);

	// mobil va desktop'da bir xil karta — stillar scss/pc/community/communityV2.scss'da
	return (
		<Stack
			sx={size === 'small' ? { width: '285px' } : undefined}
			className="community-general-card-config cm-card"
			onClick={(e) => chooseArticleHandler(e, boardArticle)}
		>
			<div className="cm-card-img">
				<img src={imagePath} alt="" loading={'lazy'} />
				{boardArticle?.articleCategory && (
					<span className="cm-card-cat">{t(CATEGORY_META[boardArticle.articleCategory]?.label ?? boardArticle.articleCategory)}</span>
				)}
			</div>

			<div className="cm-card-body">
				<Typography className="cm-card-title">{boardArticle?.articleTitle}</Typography>

				<div
					className="cm-card-author"
					onClick={(e) => {
						e.stopPropagation();
						goMemberPage(boardArticle?.memberData?._id as string);
					}}
				>
					<span className="cm-avatar">
						{authorImage ? <img src={authorImage} alt="" /> : authorNick.slice(0, 1).toUpperCase() || 'A'}
					</span>
					<span className="cm-author-name">{authorNick}</span>
					<span className="cm-dot" aria-hidden="true">
						·
					</span>
					<Moment className="cm-date" format={'MMM D, YYYY'}>
						{boardArticle?.createdAt}
					</Moment>
				</div>

				<div className="cm-card-stats">
					<span title={t('Views')}>
						<RemoveRedEyeIcon />
						{boardArticle?.articleViews ?? 0}
					</span>
					<span title={t('Comments')}>
						<ChatBubbleOutlineRoundedIcon />
						{boardArticle?.articleComments ?? 0}
					</span>
					<span className="cm-like">
						<IconButton
							color={'default'}
							onClick={(e: any) => likeArticleHandler(e, user, boardArticle?._id)}
							aria-label={liked ? t('Unlike') : t('Like')}
						>
							{liked ? <FavoriteIcon style={{ color: LIKED_COLOR }} /> : <FavoriteBorderIcon />}
						</IconButton>
						{boardArticle?.articleLikes ?? 0}
					</span>
				</div>
			</div>
		</Stack>
	);
};

export default CommunityCard;
