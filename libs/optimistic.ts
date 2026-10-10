import { Dispatch, SetStateAction } from 'react';
import { ApolloCache } from '@apollo/client';

/**
 * OPTIMISTIC UPDATE yordamchilari (like / follow).
 * G'oya: tugma bosilishi bilan ekrandagi holat DARHOL o'zgaradi (yurakcha rangi, son ±1),
 * so'rov esa orqada ketadi. Server javobi kelsa aniq son bilan tenglashtiriladi,
 * xato bo'lsa holat avvalgi ko'rinishiga qaytariladi.
 * Oldin: mutatsiya → butun ro'yxatni refetch → keyin UI o'zgarardi (serverda ~1-1.5s).
 */

type Item = { _id?: string } & Record<string, any>;

const bump = (value: any, delta: number): number => Math.max(0, (Number(value) || 0) + delta);

/** element like qilinganmi (meLiked[0].myFavorite) */
export const isLikedItem = (item: any): boolean => !!item?.meLiked?.[0]?.myFavorite;

/** element follow qilinganmi (meFollowed[0].myFollowing) */
export const isFollowedItem = (item: any): boolean => !!item?.meFollowed?.[0]?.myFollowing;

/** like holatini teskari qiladi va like sonini (likesKey) ±1 qiladi */
export const toggleLike = <I extends Item>(item: I, likesKey: string): I => {
	if (!item) return item;
	const was = isLikedItem(item);
	return {
		...item,
		[likesKey]: bump(item[likesKey], was ? -1 : 1),
		meLiked: [{ ...(item.meLiked?.[0] ?? {}), myFavorite: !was }],
	};
};

/** follow holatini teskari qiladi; followersKey berilsa o'sha son ham ±1 bo'ladi */
export const toggleFollow = <I extends Item>(item: I, followersKey?: string): I => {
	if (!item) return item;
	const was = isFollowedItem(item);
	const next: any = { ...item, meFollowed: [{ ...(item.meFollowed?.[0] ?? {}), myFollowing: !was }] };
	if (followersKey) next[followersKey] = bump(item[followersKey], was ? -1 : 1);
	return next;
};

/** ro'yxatdagi _id === id bo'lgan elementga like toggle */
export const toggleLikeInList = <I extends Item>(list: I[] | undefined | null, id: string, likesKey: string): I[] =>
	(list ?? []).map((item) => (item?._id === id ? toggleLike(item, likesKey) : item));

/** ro'yxatdagi _id === id bo'lgan elementga qisman o'zgarish (patch) qo'llaydi */
export const patchInList = <I extends Item>(list: I[] | undefined | null, id: string, patch: Partial<I>): I[] =>
	(list ?? []).map((item) => (item?._id === id ? { ...item, ...patch } : item));

/**
 * State'dagi RO'YXAT uchun optimistic like.
 * mutate() — like mutatsiyasini yuboradigan funksiya, resultKey — javobdagi maydon nomi (masalan 'likeTargetCar').
 * Xato bo'lsa toggle qaytariladi va xato yuqoriga uzatiladi (handler alert ko'rsatadi).
 */
export const optimisticLikeInList = async <I extends Item>(
	setList: Dispatch<SetStateAction<I[]>>,
	id: string,
	likesKey: string,
	mutate: () => Promise<any>,
	resultKey: string,
): Promise<void> => {
	setList((list) => toggleLikeInList(list, id, likesKey));
	try {
		const res = await mutate();
		const likes = res?.data?.[resultKey]?.[likesKey];
		if (typeof likes === 'number') setList((list) => patchInList(list, id, { [likesKey]: likes } as Partial<I>));
	} catch (err) {
		setList((list) => toggleLikeInList(list, id, likesKey));
		throw err;
	}
};

/** State'dagi BITTA element (masalan detail sahifadagi car/dealer/article) uchun optimistic like */
export const optimisticLikeItem = async (
	setItem: Dispatch<SetStateAction<any>>,
	likesKey: string,
	mutate: () => Promise<any>,
	resultKey: string,
): Promise<void> => {
	setItem((item: any) => toggleLike(item, likesKey));
	try {
		const res = await mutate();
		const likes = res?.data?.[resultKey]?.[likesKey];
		if (typeof likes === 'number') setItem((item: any) => (item ? { ...item, [likesKey]: likes } : item));
	} catch (err) {
		setItem((item: any) => toggleLike(item, likesKey));
		throw err;
	}
};

/**
 * Apollo CACHE'dagi element uchun like toggle (ekran to'g'ridan-to'g'ri useQuery `data`sidan chizilganda).
 * Apollo obyektlarni `__typename + _id` bo'yicha saqlaydi, shuning uchun shu yozuvni o'zgartirsak,
 * uni ko'rsatayotgan barcha komponentlar darhol qayta chiziladi.
 */
export const toggleLikeInCache = (
	cache: ApolloCache<any>,
	typename: string,
	id: string,
	likesKey: string,
	wasLiked: boolean,
): void => {
	const cacheId = cache.identify({ __typename: typename, _id: id });
	if (!cacheId) return;
	cache.modify({
		id: cacheId,
		fields: {
			[likesKey]: (value: any) => bump(value, wasLiked ? -1 : 1),
			meLiked: (value: any) => [{ ...(value?.[0] ?? {}), myFavorite: !wasLiked }],
		},
	});
};
