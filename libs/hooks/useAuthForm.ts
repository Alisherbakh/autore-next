import { useCallback, useState } from 'react';
import { logIn, signUp } from '../auth';
import { sweetMixinErrorAlert } from '../sweetAlert';

// Login / Sign up formasining state va handler'lari (pages/account/join.tsx dan ko'chirilgan, mantiq o'zgarmagan).
// Sahifa ham, popup (AuthModal) ham shu hook'ni ishlatadi.
// onDone — muvaffaqiyatli login/signup'dan keyin nima bo'lishi:
//   sahifada: referrer'ga (yoki bosh sahifaga) o'tish, popup'da: oynani yopish va ma'lumotlarni yangilash
const useAuthForm = (onDone: () => Promise<void> | void, initialLoginView: boolean = true) => {
	const [input, setInput] = useState({ nick: '', password: '', phone: '', type: 'USER' });
	const [loginView, setLoginView] = useState<boolean>(initialLoginView);
	// parolni ko'rsatish / yashirish (faqat ko'rinish uchun)
	const [showPassword, setShowPassword] = useState<boolean>(false);

	/** HANDLERS **/
	// "SIGNUP"/"LOGIN" havolasi bosilganda: forma ko'rinishini login yoki ro'yxatdan o'tish rejimiga almashtiradi
	const viewChangeHandler = (state: boolean) => {
		setLoginView(state);
	};

	// istalgan input maydoni (nick/password/phone/type) o'zgarganda umumiy input state'ini yangilaydi
	const handleInput = useCallback((name: any, value: any) => {
		setInput((prev) => {
			return { ...prev, [name]: value };
		});
	}, []);

	// "User"/"Dealer" checkbox'laridan biri bosilganda: tanlangan turni input.type'ga yozadi,
	// belgi olib tashlansa standart "USER" turiga qaytaradi
	const checkUserTypeHandler = (e: any) => {
		const checked = e.target.checked;
		if (checked) {
			const value = e.target.name;
			handleInput('type', value);
		} else {
			handleInput('type', 'USER');
		}
	};

	// "LOGIN" bosilganda: libs/auth/index.ts dagi logIn() funksiyasini chaqiradi (token oladi, userVar'ni to'ldiradi)
	const doLogin = useCallback(async () => {
		console.warn(input);
		try {
			await logIn(input.nick, input.password);
			await onDone();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, onDone]);

	// "SIGNUP" bosilganda: libs/auth/index.ts dagi signUp() funksiyasini chaqiradi (ro'yxatdan o'tkazadi, token oladi)
	const doSignUp = useCallback(async () => {
		console.warn(input);
		try {
			await signUp(input.nick, input.password, input.phone, input.type);
			await onDone();
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		}
	}, [input, onDone]);

	return { input, loginView, showPassword, setShowPassword, viewChangeHandler, handleInput, checkUserTypeHandler, doLogin, doSignUp };
};

export type AuthForm = ReturnType<typeof useAuthForm>;

export default useAuthForm;
