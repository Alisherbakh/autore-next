import React, { useMemo, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { CATEGORY_KEYS, CATEGORY_META } from './categories';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common'; //@ts-ignore
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { Message } from '../../enums/common.enum';
import { sweetErrorHandling, sweetTopSuccessAlert } from '../../sweetAlert';

const TuiEditor = () => {
	const { t } = useTranslation('common');
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.FREE);

	/** APOLLO REQUESTS **/
	// CREATE_BOARD_ARTICLE — apollo/user/mutation.ts dan; yangi community maqolasini yaratish uchun mutatsiya
	const [createboardArticle] = useMutation(CREATE_BOARD_ARTICLE);

	// forma qiymatlarini (sarlavha, matn, rasm) saqlab turadigan oddiy obyekt — useState emas, chunki
	// bu qiymatlar o'zgarganda komponentni qayta chizish shart emas (faqat "Register" bosilganda kerak bo'ladi)
	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';

		return { articleTitle, articleContent, articleImage };
	}, []); // faqat bir marta yaratiladi (bo'sh dependency array)

	/** HANDLERS **/
	// Toast UI Editor ichiga rasm tashlanganda (drag-drop yoki tanlanganda) ishga tushadi:
	// rasmni GraphQL upload orqali backend'ga yuboradi va qaytgan URL'ni editor'ga ko'rsatadi
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData(); // ko'p qismli (multipart) so'rov tanasini yaratadi
			formData.append(
				'operations', // GraphQL multipart spetsifikatsiyasi talab qiladigan maxsus nom
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`, // backend'dagi "bitta rasm yuklash" mutatsiyasi matni
					variables: {
						file: null, // haqiqiy fayl hali bu yerda emas — pastda 'map' orqali bog'lanadi
						target: 'article', // rasm qaysi papkaga saqlanishi (maqola rasmlari)
					},
				}),
			);
			formData.append(
				'map', // qaysi formData kaliti ('0') qaysi GraphQL o'zgaruvchisiga (variables.file) tegishli ekanini bildiradi
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image); // tanlangan/tashlangan rasm faylining o'zi, 'map'dagi '0' kaliti bilan bog'lanadi

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data', // fayl yuklash uchun majburiy header
					'apollo-require-preflight': true, // Apollo Server'ga bu GraphQL multipart so'rov ekanini bildiradi
					Authorization: `Bearer ${token}`, // login qilingan foydalanuvchi tokeni (backend qaysi foydalanuvchi ekanini bilishi uchun)
				},
			});

			const responseImage = response.data.data.imageUploader; // backend qaytargan yuklangan rasm fayl nomi (masalan "article/xxxx.png")
			console.log('=responseImage: ', responseImage);
			memoizedValues.articleImage = responseImage; // yuklangan rasm nomini forma qiymatlariga yozadi (keyin maqola yaratishda ishlatiladi)

			return `${REACT_APP_API_URL}/${responseImage}`; // Toast UI Editor ko'rsatishi uchun rasmning to'liq URL'ini qaytaradi
		} catch (err) {
			console.log('Error, uploadImage:', err); // xato bo'lsa konsolga chiqaradi (foydalanuvchiga alert ko'rsatilmaydi)
		}
	};

	// "Category" select'i o'zgarganda: tanlangan kategoriyani (FREE/TIPS/NEWS/REVIEW) state'ga yozadi
	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	// "Title" input'i o'zgarganda: sarlavhani memoizedValues'ga yozadi (qayta render qilmasdan)
	const articleTitleHandler = (e: T) => {
		console.log(e.target.value);
		memoizedValues.articleTitle = e.target.value;
	};

	// "Register" tugmasi bosilganda: editor'dan matnni o'qib, sarlavha bilan birga CREATE_BOARD_ARTICLE mutatsiyasiga yuboradi,
	// muvaffaqiyatli bo'lsa "Mening maqolalarim" sahifasiga qaytaradi
	const handleRegisterButton = async () => {
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (memoizedValues.articleContent === '' && memoizedValues.articleTitle === '') {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}

			await createboardArticle({
				variables: {
					input: { ...memoizedValues, articleCategory },
				},
			});

			await sweetTopSuccessAlert('Article is created successfully', 700);
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log(err);
			sweetErrorHandling(new Error(Message.INSERT_ALL_INPUTS)).then();
		}
	};

	// "Register" tugmasini bosib bo'lmaydigan (disabled) qilish shartini tekshiradi:
	// matn yoki sarlavha bo'sh bo'lsa tugma bosilmaydigan bo'ladi
	const doDisabledCheck = () => {
		if (memoizedValues.articleContent === '' || memoizedValues.articleTitle === '') {
			return true;
		}
	};

	return (
		<Stack className={'mp-write'}>
			<div className={'mp-write-meta'}>
				<div className={'mp-field'}>
					<span className={'title'}>{t('Category')}</span>
					<div className={'mp-cat-chips'} role="radiogroup">
						{CATEGORY_KEYS.map((key: string) => {
							const Icon = CATEGORY_META[key].icon;
							return (
								<button
									type="button"
									role="radio"
									aria-checked={articleCategory === key}
									key={key}
									className={`mp-cat-chip ${articleCategory === key ? 'is-active' : ''}`}
									onClick={() => changeCategoryHandler({ target: { value: key } })}
								>
									<Icon />
									{t(CATEGORY_META[key].label)}
								</button>
							);
						})}
					</div>
				</div>
				<label className={'mp-field'}>
					<span className={'title'}>{t('Title')}</span>
					<input
						type="text"
						className={'description-input'}
						placeholder={t('Give your post a clear title')}
						onChange={articleTitleHandler}
					/>
				</label>
			</div>

			<Editor
				initialValue={'Type here'}
				placeholder={'Type here'}
				previewStyle={'vertical'}
				height={'640px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<div className={'mp-write-foot'}>
				<Button className={'mp-btn-primary'} onClick={handleRegisterButton}>
					{t('Publish post')}
				</Button>
			</div>
		</Stack>
	);
};

export default TuiEditor;
