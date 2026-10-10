import React, { useCallback } from 'react';
import { Dialog } from '@mui/material';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { authModalVar } from '../../../apollo/store';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import useAuthForm from '../../hooks/useAuthForm';
import AuthCard from './AuthCard';

// popup ichidagi forma: har ochilishda yangidan yaratiladi (maydonlar bo'sh bo'ladi)
const AuthModalBody = ({ initialLoginView, onClose }: { initialLoginView: boolean; onClose: () => void }) => {
	const client = useApolloClient();

	// muvaffaqiyatli login/signup: oynani yopadi va ochiq sahifadagi ma'lumotlarni (meLiked, meFollowed...) yangi token bilan qayta so'raydi
	const onDone = useCallback(async () => {
		onClose();
		try {
			await client.refetchQueries({ include: 'active' });
		} catch (err: any) {
			console.log('ERROR, AuthModal refetch:', err?.message);
		}
	}, [client, onClose]);

	const form = useAuthForm(onDone, initialLoginView);
	return <AuthCard form={form} onClose={onClose} titleId={'jn-modal-title'} asDialog />;
};

// Login / Sign up popup (faqat desktop): joriy sahifa ustida ochiladi, orqa fon xiralashadi (blur)
// ochish: authModalVar({ open: true, loginView: true }) — masalan Top'dagi "Login / Register" tugmasi
const AuthModal = () => {
	const device = useDeviceDetect();
	const { open, loginView } = useReactiveVar(authModalVar);

	const close = useCallback(() => {
		authModalVar({ ...authModalVar(), open: false });
	}, []);

	if (device !== 'desktop') return null;

	return (
		<Dialog
			open={open}
			onClose={close}
			scroll={'body'}
			maxWidth={false}
			className={'jn-modal'}
			aria-labelledby={'jn-modal-title'}
			BackdropProps={{ className: 'jn-modal-backdrop' }}
			PaperProps={{ className: 'jn-modal-paper', elevation: 0 }}
		>
			{open && <AuthModalBody initialLoginView={loginView} onClose={close} />}
		</Dialog>
	);
};

export default AuthModal;
