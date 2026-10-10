import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Button, Stack, Typography, Tab, Tabs, IconButton, Backdrop, Pagination } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { CREATE_COMMENT, LIKE_TARGET_BOARD_ARTICLE, UPDATE_COMMENT } from '../../apollo/user/mutation';
import { GET_BOARD_ARTICLE, GET_COMMENTS } from '../../apollo/user/query';
import Moment from 'react-moment';
import { userVar } from '../../apollo/store';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { CommentInput, CommentsInquiry } from '../../libs/types/comment/comment.input';
import { CommentUpdate } from '../../libs/types/comment/comment.update';
import { Comment } from '../../libs/types/comment/comment';
import dynamic from 'next/dynamic';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { T } from '../../libs/types/common';
import EditIcon from '@mui/icons-material/Edit';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { Messages } from '../../libs/config';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { useTranslation } from 'next-i18next';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { CATEGORY_KEYS, CATEGORY_META } from '../../libs/components/community/categories';
import { optimisticLikeItem } from '../../libs/optimistic';
const ToastViewerComponent = dynamic(() => import('../../libs/components/community/TViewer'), { ssr: false });

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const CommunityDetail: NextPage = ({ initialInput, ...props }: T) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { query } = router;
	const { t } = useTranslation('common');

	const articleId = query?.id as string;
	const articleCategory = query?.articleCategory as string;

	const [comment, setComment] = useState<string>('');
	const [wordsCnt, setWordsCnt] = useState<number>(0);
	const [updatedCommentWordsCnt, setUpdatedCommentWordsCnt] = useState<number>(0);
	const user = useReactiveVar(userVar);
	const [comments, setComments] = useState<Comment[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchFilter, setSearchFilter] = useState<CommentsInquiry>({
		...initialInput,
	});
	const [memberImage, setMemberImage] = useState<string>('/img/community/articleImg.png');
	const [anchorEl, setAnchorEl] = useState<any | null>(null);
	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	const [openBackdrop, setOpenBackdrop] = useState<boolean>(false);
	const [updatedComment, setUpdatedComment] = useState<string>('');
	const [updatedCommentId, setUpdatedCommentId] = useState<string>('');
	const [likeLoading, setLikeLoading] = useState<boolean>(false);
	const [boardArticle, setBoardArticle] = useState<BoardArticle>();

	/** APOLLO REQUESTS **/
	// maqolaga like bosish uchun mutatsiya
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	// izoh yozish uchun mutatsiya
	const [createComment] = useMutation(CREATE_COMMENT);
	// izohni yangilash/o'chirish uchun mutatsiya
	const [updateComment] = useMutation(UPDATE_COMMENT);

	// URL'dagi articleId bo'yicha maqolaning o'zini oladi (sarlavha, matn, muallif rasmi)
	const {
		loading: boardArticleLoading,
		data: boardArticleData,
		error: getBoardArticleError,
		refetch: boardArticleRefetch,
	} = useQuery(GET_BOARD_ARTICLE, {
		fetchPolicy: 'network-only',
		variables: {
			input: articleId,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setBoardArticle(data?.getBoardArticle);
			if (data?.getBoardArticle?.memberData?.memberImage) {
				setMemberImage(`${process.env.REACT_APP_API_URL}/${data?.getBoardArticle?.memberData?.memberImage}`);
			}
		},
	});

	// shu maqolaga yozilgan izohlar ro'yxatini oladi
	const {
		loading: getCommentsLoading,
		data: getCommentsData,
		error: getCommentsError,
		refetch: getCommentsRefetch,
	} = useQuery(GET_COMMENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: searchFilter,
		},
		notifyOnNetworkStatusChange: true,
		onCompleted(data: any) {
			setComments(data.getComments.list);
			setTotal(data.getComments?.metaCounter?.[0]?.total || 0);
		},
	});

	/** LIFECYCLES **/
	// URL'dagi articleId o'zgarganda: izohlar so'rovi shu maqolaga (commentRefId) qarab yuborilishi uchun filtrni yangilaydi
	useEffect(() => {
		if (articleId) setSearchFilter({ ...searchFilter, search: { commentRefId: articleId } });
	}, [articleId]);

	/** HANDLERS **/
	// chap menyudagi tab (Free/Review/News/Tips) bosilganda: /community sahifasiga shu kategoriya bilan qaytaradi
	const tabChangeHandler = (event: React.SyntheticEvent, value: string) => {
		router.replace(
			{
				pathname: '/community',
				query: { articleCategory: value },
			},
			'/community',
			{ shallow: true },
		);
	};

	// maqolaga like bosish (bir vaqtda ikki marta bosilmasligi uchun likeLoading bilan himoyalangan)
	const likeBoArticleHandler = async (user: any, id: any) => {
		try {
			if (!id) return;
			if (!user._id) throw new Error(Messages.error2);
			// optimistic: yurakcha va son DARHOL o'zgaradi, so'rov orqada ketadi (xato bo'lsa avvalgi holatga qaytadi)
			await optimisticLikeItem(
				setBoardArticle,
				'articleLikes',
				() => likeTargetBoardArticle({ variables: { input: id } }),
				'likeTargetBoardArticle',
			);
		} catch (err: any) {
			console.log('ERROR, likeBoArticleHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	// izoh yozish: matn bo'sh bo'lmasa va login qilingan bo'lsa, izohni yuboradi va ro'yxatni yangilaydi
	const creteCommentHandler = async () => {
		if (!comment) return;
		try {
			if (!user?._id) throw new Error(Messages.error2);
			const commentInput: CommentInput = {
				commentGroup: CommentGroup.ARTICLE,
				commentRefId: articleId,
				commentContent: comment,
			};
			await createComment({
				variables: {
					input: commentInput,
				},
			});
			await getCommentsRefetch({ input: searchFilter });
			await boardArticleRefetch({ input: articleId });
			setComment('');
			await sweetMixinSuccessAlert('Successfully commented!');
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	// izohni tahrirlash yoki o'chirish: commentStatus berilsa (DELETE) tasdiqlab o'chiradi, aks holda matnni yangilaydi
	const updateButtonHandler = async (commentId: string, commentStatus?: CommentStatus.DELETE) => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (!commentId) throw new Error('Select a comment to update!');
			if (updatedComment === comments?.find((comment) => comment?._id === commentId)?.commentContent) return;

			const updateData: CommentUpdate = {
				_id: commentId,
				...(commentStatus && { commentStatus: commentStatus }),
				...(updatedComment && { commentContent: updatedComment }),
			};

			if (!updateData?.commentContent && !updateData?.commentStatus)
				throw new Error('Provide data to update your comment!');

			if (commentStatus) {
				if (await sweetConfirmAlert('Do you want to delete the comment?')) {
					await updateComment({
						variables: {
							input: updateData,
						},
					});
					await sweetMixinSuccessAlert('Successfully deleted!');
				} else return;
			} else {
				await updateComment({
					variables: {
						input: updateData,
					},
				});
				await sweetMixinSuccessAlert('Successfully updated!');
			}
			await getCommentsRefetch({ input: searchFilter });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setOpenBackdrop(false);
			setUpdatedComment('');
			setUpdatedCommentWordsCnt(0);
			setUpdatedCommentId('');
		}
	};

	// izoh yozgan a'zoning rasmini qaytaradi, rasmi bo'lmasa standart rasmni ko'rsatadi
	const getCommentMemberImage = (imageUrl: string | undefined) => {
		if (imageUrl) return `${process.env.REACT_APP_API_URL}/${imageUrl}`;
		else return '/img/community/articleImg.png';
	};

	// izoh yozgan a'zo ismi/rasmi bosilganda: o'zi bo'lsa mypage'ga, aks holda uning profil sahifasiga o'tkazadi
	const goMemberPage = (id: any) => {
		if (id === user?._id) router.push('/mypage');
		else router.push(`/member?memberId=${id}`);
	};

	// izohni tahrirlash oynasidagi (Backdrop) "Cancel" bosilganda: oynani yopadi va tahrirlash inputlarini tozalaydi
	const cancelButtonHandler = () => {
		setOpenBackdrop(false);
		setUpdatedComment('');
		setUpdatedCommentWordsCnt(0);
	};

	// izohni tahrirlash inputiga yozilganda: 100 belgidan oshmasa matn va belgilar sonini state'ga yozadi
	const updateCommentInputHandler = (value: string) => {
		if (value.length > 100) return;
		setUpdatedCommentWordsCnt(value.length);
		setUpdatedComment(value);
	};

	// izohlar Pagination komponentidan chaqiriladi: sahifa raqamini yozadi, useQuery avtomatik qayta so'raydi
	const paginationHandler = (e: T, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	/** RENDER **/
	const categoryMeta =
		CATEGORY_META[articleCategory] ?? CATEGORY_META[boardArticle?.articleCategory ?? 'FREE'] ?? CATEGORY_META.FREE;
	const CategoryIcon = categoryMeta.icon;
	const liked: boolean = !!(boardArticle?.meLiked && boardArticle?.meLiked[0]?.myFavorite);
	const articleCover: string | null = boardArticle?.articleImage
		? `${process.env.REACT_APP_API_URL}/${boardArticle?.articleImage}`
		: null;

	// "Write" tugmasi: avvalgidek mypage'dagi maqola yozish bo'limiga o'tkazadi
	const goWritePage = () =>
		router.push({
			pathname: '/mypage',
			query: {
				category: 'writeArticle',
			},
		});

	// kategoriya tablari — bosilganda tabChangeHandler /community ro'yxatiga qaytaradi (avvalgidek)
	const categoryTabs = (orientation: 'vertical' | 'horizontal') => (
		<Tabs
			orientation={orientation}
			variant={orientation === 'horizontal' ? 'scrollable' : 'standard'}
			scrollButtons={false}
			aria-label="community categories"
			TabIndicatorProps={{
				style: { display: 'none' },
			}}
			onChange={tabChangeHandler}
			value={articleCategory ?? false}
			className={'cm-tabs'}
		>
			{CATEGORY_KEYS.map((key: string) => {
				const Icon = CATEGORY_META[key].icon;
				return (
					<Tab
						key={key}
						value={key}
						icon={<Icon />}
						iconPosition="start"
						label={t(CATEGORY_META[key].label)}
						className={`tab-button ${articleCategory === key ? 'active' : ''}`}
					/>
				);
			})}
		</Tabs>
	);

	// maqolaning o'zi: kategoriya, sarlavha, muallif, matn va like tugmasi
	const articleBlock = (
		<article className={`cm-article ${boardArticle ? '' : 'is-loading'}`}>
			{articleCover && (
				<div className="cm-article-cover">
					<img src={articleCover} alt="" />
				</div>
			)}
			<div className="cm-article-head">
				<span className="cm-chip">
					<CategoryIcon />
					{t(categoryMeta.label)}
				</span>
				<Typography component={'h1'} className="cm-article-title">
					{boardArticle?.articleTitle || ' '}
				</Typography>
				<div className="cm-article-meta">
					<div className="cm-author" onClick={() => goMemberPage(boardArticle?.memberData?._id)}>
						<img src={memberImage} alt="" />
						<div>
							<strong>{boardArticle?.memberData?.memberNick}</strong>
							{boardArticle?.createdAt && (
								<Moment className={'cm-time'} format={'MMM D, YYYY · HH:mm'}>
									{boardArticle?.createdAt}
								</Moment>
							)}
						</div>
					</div>
					<div className="cm-article-stats">
						<span title={t('Views')}>
							<VisibilityIcon />
							{boardArticle?.articleViews ?? 0}
						</span>
						<span title={t('Comments')}>
							{boardArticle?.articleComments && boardArticle?.articleComments > 0 ? (
								<ChatIcon />
							) : (
								<ChatBubbleOutlineRoundedIcon />
							)}
							{boardArticle?.articleComments ?? 0}
						</span>
						<span title={t('Likes')}>
							{liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
							{boardArticle?.articleLikes ?? 0}
						</span>
					</div>
				</div>
			</div>

			<div className="cm-article-body">
				<ToastViewerComponent markdown={boardArticle?.articleContent} className={'ytb_play'} />
			</div>

			<div className="cm-article-foot">
				<p>{t('Was this post helpful?')}</p>
				<Button
					className={`cm-like-btn ${liked ? 'is-liked' : ''}`}
					onClick={() => likeBoArticleHandler(user, boardArticle?._id)}
					startIcon={liked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
					aria-pressed={liked}
				>
					{liked ? t('Liked') : t('Like')}
					<span className="cm-like-count">{boardArticle?.articleLikes ?? 0}</span>
				</Button>
			</div>
		</article>
	);

	// izohlar: yozish formasi + ro'yxat + sahifalash (logika o'zgarmagan)
	const commentsBlock = (
		<section className="cm-comments">
			<div className="cm-comments-head">
				<h2>{t('Comments')}</h2>
				<span className="cm-count">{total}</span>
			</div>

			<div className="cm-comment-form">
				<input
					type="text"
					placeholder={user?._id ? t('Leave a comment') : t('Please log in to leave a comment.')}
					value={comment}
					onChange={(e) => {
						if (e.target.value.length > 100) return;
						setWordsCnt(e.target.value.length);
						setComment(e.target.value);
					}}
				/>
				<div className="cm-comment-actions">
					<Typography className={`cm-counter ${wordsCnt >= 90 ? 'is-near' : ''}`}>{wordsCnt}/100</Typography>
					<Button className="cm-btn-primary" onClick={creteCommentHandler} disabled={!comment}>
						{t('Comment')}
					</Button>
				</div>
			</div>

			{total === 0 && (
				<div className="cm-empty cm-empty-sm">
					<ChatBubbleOutlineRoundedIcon />
					<p>{t('No comments yet. Start the conversation!')}</p>
				</div>
			)}

			<div className="cm-comment-list">
				{comments?.map((commentData) => {
					return (
						<div className="cm-comment" key={commentData?._id}>
							<div className="cm-comment-top">
								<div className="cm-author" onClick={() => goMemberPage(commentData?.memberData?._id as string)}>
									<img src={getCommentMemberImage(commentData?.memberData?.memberImage)} alt="" />
									<div>
										<strong>{commentData?.memberData?.memberNick}</strong>
										<Moment className={'cm-time'} format={'MMM D, YYYY · HH:mm'}>
											{commentData?.createdAt}
										</Moment>
									</div>
								</div>
								{commentData?.memberId === user?._id && (
									<div className="cm-comment-tools">
										<IconButton
											aria-label={t('Edit comment')}
											onClick={(e) => {
												setUpdatedComment(commentData?.commentContent);
												setUpdatedCommentWordsCnt(commentData?.commentContent?.length);
												setUpdatedCommentId(commentData?._id);
												setOpenBackdrop(true);
											}}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											className="is-danger"
											aria-label={t('Delete comment')}
											onClick={() => {
												setUpdatedCommentId(commentData?._id);
												updateButtonHandler(commentData?._id, CommentStatus.DELETE);
											}}
										>
											<DeleteForeverIcon />
										</IconButton>
									</div>
								)}
							</div>
							<Typography className="cm-comment-text">{commentData?.commentContent}</Typography>
						</div>
					);
				})}
			</div>

			{total > 0 && (
				<Stack className="cm-pagination">
					<Pagination
						count={Math.ceil(total / searchFilter.limit) || 1}
						page={searchFilter.page}
						shape="circular"
						color="primary"
						onChange={paginationHandler}
					/>
				</Stack>
			)}
		</section>
	);

	// izohni tahrirlash oynasi — bitta (avval har bir izoh ichida takrorlanardi), handlerlar o'sha-o'sha
	const editCommentModal = (
		<Backdrop className="cm-modal-backdrop" open={openBackdrop} sx={{ zIndex: 1300 }}>
			<Stack className="cm-modal" onClick={(e) => e.stopPropagation()}>
				<Typography className="cm-modal-title">{t('Update comment')}</Typography>
				<input
					autoFocus
					value={updatedComment}
					onChange={(e) => updateCommentInputHandler(e.target.value)}
					type="text"
				/>
				<div className="cm-modal-actions">
					<Typography className="cm-counter">{updatedCommentWordsCnt}/100</Typography>
					<div>
						<Button className="cm-btn-ghost" onClick={() => cancelButtonHandler()}>
							{t('Cancel')}
						</Button>
						<Button className="cm-btn-primary" onClick={() => updateButtonHandler(updatedCommentId, undefined)}>
							{t('Update')}
						</Button>
					</div>
				</div>
			</Stack>
		</Backdrop>
	);

	if (device === 'mobile') {
		return (
			<div id="community-detail-page" className="cm-v2 cm-detail cm-mobile">
				{categoryTabs('horizontal')}
				{articleBlock}
				{commentsBlock}
				{editCommentModal}
			</div>
		);
	} else {
		return (
			<div id="community-detail-page" className="cm-v2 cm-detail">
				<div className="cm-wrap">
					<div className="cm-layout">
						<aside className="cm-side">
							<div className="cm-side-head">
								<span className="cm-eyebrow">Autore</span>
								<h2>{t('Community')}</h2>
								<p>{t('Talk cars, share reviews and pick up tips from other drivers.')}</p>
							</div>
							{categoryTabs('vertical')}
							<Button className={'cm-btn-primary cm-write'} onClick={goWritePage} startIcon={<EditRoundedIcon />}>
								{t('Write a post')}
							</Button>
						</aside>

						<section className="cm-main">
							{articleBlock}
							{commentsBlock}
						</section>
					</div>
				</div>
				{editCommentModal}
			</div>
		);
	}
};

CommunityDetail.defaultProps = {
	initialInput: {
		page: 1,
		limit: 5,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: '' },
	},
};

export default withLayoutBasic(CommunityDetail);
