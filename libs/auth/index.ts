import decodeJWT from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';

// localStorage'dan JWT tokenni o'qib qaytaradi (brauzerda bo'lsagina)
export function getJwtToken(): any {
	if (typeof window !== 'undefined') { // faqat brauzerda ishlaydi, serverda localStorage yo'q
		return localStorage.getItem('accessToken') ?? ''; // tokenni o'qiydi, bo'lmasa bo'sh qator qaytaradi
	}
}

// JWT tokenni localStorage'ga yozib saqlaydi
export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token); // token'ni 'accessToken' nomi bilan saqlaydi
}

// Foydalanuvchini tizimga kiritadi: token so'raydi, saqlaydi va profil ma'lumotini yangilaydi
export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password }); // serverdan token so'rayapti

		if (jwtToken) {
			updateStorage({ jwtToken }); // tokenni localStorage'ga saqlayapti, update accessToken
			updateUserInfo(jwtToken); // token ichidan foydalanuvchi ma'lumotini olib, global state'ga yozyapti
		}
	} catch (err) {
		console.warn('login err', err); // xatoni console'ga chiqaryapti
		logOut(); // xato bo'lsa, tizimdan chiqarib yuboryapti (tozalayapti)
		//throw new Error('Login Err'); // xatoni yuqoriga uzatyapti
	}
};

// Backend'ga LOGIN so'rovini yuborib, JWT token oladi
const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo(); // GraphQL so'rov yuborish uchun client olyapti

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN, // LOGIN mutatsiyasini chaqiryapti
			variables: { input: { memberNick: nick, memberPassword: password } }, // login va parolni yuboryapti
			fetchPolicy: 'network-only', // cache'dan emas, har doim serverdan yangi javob olyapti
		});

		console.log('---------- login ----------');
		const { accessToken } = result?.data?.login; // javobdan tokenni ajratib olyapti

		return { jwtToken: accessToken }; // tokenni qaytaryapti
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) { // serverdan kelgan xato xabariga qarab
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again'); // login/parol xato deb ogohlantiryapti
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!'); // foydalanuvchi bloklangan deb ogohlantiryapti
				break;
		}
		throw new Error('token error'); // xatoni yuqoriga uzatyapti
	}
};

// Yangi foydalanuvchini ro'yxatdan o'tkazadi: token so'raydi, saqlaydi va profil ma'lumotini yangilaydi
export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type }); // serverdan ro'yxatdan o'tish uchun token so'rayapti

		if (jwtToken) {
			updateStorage({ jwtToken }); // tokenni localStorage'ga saqlayapti
			updateUserInfo(jwtToken); // token ichidan foydalanuvchi ma'lumotini olib, global state'ga yozyapti
		}
	} catch (err) {
		console.warn('login err', err); // xatoni console'ga chiqaryapti
		logOut(); // xato bo'lsa, tizimdan chiqarib yuboryapti (tozalayapti)
		//throw new Error('Login Err'); // xatoni yuqoriga uzatyapti
	}
};

// Backend'ga SIGN_UP so'rovini yuborib, yangi foydalanuvchi uchun JWT token oladi
const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo(); // GraphQL so'rov yuborish uchun client olyapti

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP, // SIGN_UP mutatsiyasini chaqiryapti
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type }, // ro'yxatdan o'tish ma'lumotlarini yuboryapti
			},
			fetchPolicy: 'network-only', // cache'dan emas, har doim serverdan yangi javob olyapti
		});

		console.log('---------- login ----------');
		const { accessToken } = result?.data?.signup; // javobdan tokenni ajratib olyapti

		return { jwtToken: accessToken }; // tokenni qaytaryapti
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors[0].message) { // serverdan kelgan xato xabariga qarab
			case 'Definer: login and password do not match':
				await sweetMixinErrorAlert('Please check your password again'); // login/parol xato deb ogohlantiryapti
				break;
			case 'Definer: user has been blocked!':
				await sweetMixinErrorAlert('User has been blocked!'); // foydalanuvchi bloklangan deb ogohlantiryapti
				break;
		}
		throw new Error('token error'); // xatoni yuqoriga uzatyapti
	}
};

// Tokenni saqlaydi va boshqa oynalar (tab)larga "login bo'ldi" deb signal beradi
export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken); // tokenni localStorage'ga yozyapti
	window.localStorage.setItem('login', Date.now().toString()); // login vaqtini belgilab, boshqa tablarga xabar beryapti
};

// Token ichidagi foydalanuvchi ma'lumotlarini o'qib, global state (userVar)ga yozadi
export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false; // token bo'lmasa, hech narsa qilmaydi

	const claims = decodeJWT<CustomJwtPayload>(jwtToken); // tokenni deshifrlab, ichidagi ma'lumotni olyapti
	userVar({ // global foydalanuvchi state'ini shu ma'lumotlar bilan to'ldiryapti
		_id: claims._id ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberAuthType: claims.memberAuthType,
		memberPhone: claims.memberPhone ?? '',
		memberNick: claims.memberNick ?? '',
		memberFullName: claims.memberFullName ?? '',
		memberImage:
			claims.memberImage === null || claims.memberImage === undefined
				? '/img/profile/defaultUser.svg'
				: `${claims.memberImage}`,
		memberAddress: claims.memberAddress ?? '',
		memberDesc: claims.memberDesc ?? '',
		memberCars: claims.memberCars,
		memberRank: claims.memberRank,
		memberArticles: claims.memberArticles,
		memberPoints: claims.memberPoints,
		memberLikes: claims.memberLikes,
		memberViews: claims.memberViews,
		memberWarnings: claims.memberWarnings,
		memberBlocks: claims.memberBlocks,
	});
};

// Foydalanuvchini tizimdan chiqaradi: tokenni o'chiradi, state'ni tozalaydi va sahifani qayta yuklaydi
export const logOut = () => {
	deleteStorage(); // localStorage'dan tokenni o'chiryapti
	deleteUserInfo(); // global state'ni bo'shatyapti
	window.location.reload(); // sahifani yangilayapti (tozalab boshlash uchun)
};

// Mobil uchun: logOut bilan bir xil, lekin joriy sahifani yangilash o'rniga bosh sahifaga o'tkazadi
// (homePath — tanlangan tilga mos bosh sahifa manzili, masalan '/' yoki '/kr')
export const logOutToHome = (homePath: string = '/') => {
	deleteStorage(); // localStorage'dan tokenni o'chiryapti
	deleteUserInfo(); // global state'ni bo'shatyapti
	window.location.assign(homePath); // bosh sahifaga to'liq yuklash bilan o'tadi (tozalab boshlash uchun)
};

// Tokenni localStorage'dan o'chiradi va boshqa tablarga "logout bo'ldi" deb signal beradi
const deleteStorage = () => {
	localStorage.removeItem('accessToken'); // tokenni o'chiryapti
	window.localStorage.setItem('logout', Date.now().toString()); // logout vaqtini belgilab, boshqa tablarga xabar beryapti
};

// Global foydalanuvchi state'ini bo'sh/standart qiymatlarga qaytaradi
const deleteUserInfo = () => {
	userVar({ // hamma maydonlarni bo'sh/0 qilib qo'yyapti
		_id: '',
		memberType: '',
		memberStatus: '',
		memberAuthType: '',
		memberPhone: '',
		memberNick: '',
		memberFullName: '',
		memberImage: '',
		memberAddress: '',
		memberDesc: '',
		memberCars: 0,
		memberRank: 0,
		memberArticles: 0,
		memberPoints: 0,
		memberLikes: 0,
		memberViews: 0,
		memberWarnings: 0,
		memberBlocks: 0,
	});
};
