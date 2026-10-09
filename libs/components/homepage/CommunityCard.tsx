import React from 'react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Moment from 'react-moment';
import { BoardArticle } from '../../types/board-article/board-article';

interface CommunityCardProps {
	vertical: boolean;
	article: BoardArticle;
	index: number;
}

const CommunityCard = (props: CommunityCardProps) => {
	const { vertical, article, index } = props;
	const device = useDeviceDetect();
	const { t } = useTranslation('common');
	const articleImage = article?.articleImage
		? `${process.env.REACT_APP_API_URL}/${article?.articleImage}`
		: '/img/event.svg';

	// mobil va desktop'da bir xil karta
	{
		if (vertical) {
			return (
				<Link
					href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
					className={'vertical-card'}
				>
					<span className={'community-img'}>
						<img src={articleImage} alt={''} loading={'lazy'} />
						<span className={'community-rank'}>{index + 1}</span>
					</span>
					<strong>{article?.articleTitle}</strong>
					<span className={'community-meta'}>{t('Free Board')}</span>
				</Link>
			);
		} else {
			return (
				<Link
					href={`/community/detail?articleCategory=${article?.articleCategory}&id=${article?._id}`}
					className={'horizontal-card'}
				>
					<img src={articleImage} alt={''} loading={'lazy'} />
					<span className={'horizontal-text'}>
						<strong>{article.articleTitle}</strong>
						<span className={'community-meta'}>
							<Moment format="DD.MM.YY">{article?.createdAt}</Moment>
						</span>
					</span>
				</Link>
			);
		}
	}
};

export default CommunityCard;
