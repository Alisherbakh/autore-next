/**
 * Community kategoriyalari — faqat ko'rinish uchun (nom, tavsif, ikonka).
 * Qiymatlar libs/enums/board-article.enum.ts dagi BoardArticleCategory bilan bir xil.
 */
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';

// kategoriyalar: nom, qisqa tavsif va ikonka (faqat ko'rinish uchun; qiymatlar BoardArticleCategory enum bilan bir xil)
export const CATEGORY_KEYS: string[] = ['FREE', 'REVIEW', 'NEWS', 'TIPS'];
export const CATEGORY_META: Record<string, { label: string; sub: string; icon: any }> = {
	FREE: {
		label: 'Free Board',
		sub: 'Talk about anything car-related — questions, stories and ideas.',
		icon: ForumRoundedIcon,
	},
	REVIEW: { label: 'Review', sub: 'Honest reviews of cars and dealers from real owners.', icon: RateReviewRoundedIcon },
	NEWS: { label: 'News', sub: 'Car industry news, new launches and market updates.', icon: NewspaperRoundedIcon },
	TIPS: {
		label: 'Tips',
		sub: 'Buying, maintenance and driving tips from the community.',
		icon: TipsAndUpdatesRoundedIcon,
	},
};
