import React, { ReactNode } from 'react';

interface SectionHeadProps {
	title: string;
	sub?: string;
	actions?: ReactNode;
	tone?: 'light' | 'dark';
}

// Bosh sahifa bo'limlari uchun yagona sarlavha: <h2>, qisqa izoh va o'ng tomonda amallar (havola / swiper tugmalari)
const SectionHead = (props: SectionHeadProps) => {
	const { title, sub, actions, tone = 'light' } = props;

	return (
		<div className={`hp-head ${tone === 'dark' ? 'is-dark' : ''}`}>
			<div className={'hp-head-text'}>
				<h2>{title}</h2>
				{sub && <p>{sub}</p>}
			</div>
			{actions && <div className={'hp-head-actions'}>{actions}</div>}
		</div>
	);
};

export default SectionHead;
