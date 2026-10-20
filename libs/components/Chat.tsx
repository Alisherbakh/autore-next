import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import CloseIcon from '@mui/icons-material/Close';
import MarkChatUnreadIcon from '@mui/icons-material/MarkChatUnread';
import { useRouter } from 'next/router';
import ScrollableFeed from 'react-scrollable-feed';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { Member } from '../types/member/member';
import { Messages, REACT_APP_API_URL } from '../config';
import { sweetErrorAlert } from '../sweetAlert';
import useDeviceDetect from '../hooks/useDeviceDetect';
import AiAssistant from './AiAssistant';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useTranslation } from 'next-i18next';

const NewMessage = (type: any) => {
	if (type === 'right') {
		return (
			<Box
				component={'div'}
				flexDirection={'row'}
				style={{ display: 'flex' }}
				alignItems={'flex-end'}
				justifyContent={'flex-end'}
				sx={{ m: '10px 0px' }}
			>
				<div className={'msg_right'}></div>
			</Box>
		);
	} else {
		return (
			<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
				<Avatar alt={'jonik'} src={'/img/profile/defaultUser.svg'} />
				<div className={'msg_left'}></div>
			</Box>
		);
	}
};

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member;
	action: string;
}

const Chat = () => {
	const chatContentRef = useRef<HTMLDivElement>(null);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const textInput = useRef(null);
	const [messageInput, setMessageInput] = useState<string>('');
	const [open, setOpen] = useState(false);
	const [openButton, setOpenButton] = useState(false);
	const router = useRouter();
	const user = useReactiveVar(userVar); // joriy login qilgan foydalanuvchi ma'lumotlari (reactive variable orqali)
	const socket = useReactiveVar(socketVar); // client.ts'dagi LoggingWebSocket yaratgan aktiv WebSocket ulanishi
	const device = useDeviceDetect(); // 'mobile' yoki 'desktop'
	const [tab, setTab] = useState<'ai' | 'live'>('ai'); // AI yordamchi yoki Live chat
	const { t } = useTranslation('common');

	/** LIFECYCLES **/
	// socket o'zgarganda: WebSocket'dan xabar kelganda ishlaydigan handler'ni ulaydi
	useEffect(() => {
		if (!socket) return; // socket hali ulanmagan bo'lsa (masalan birinchi render) — kutadi
		socket.onmessage = (msg) => {
			const data = JSON.parse(msg.data); // kelgan xabarni (JSON string) obyektga aylantiradi
			console.log('WebSocket message:', data); // kelgan xabarni konsolga chiqaradi

			switch (data.event) {
				case 'info':
					const newInfo: InfoPayload = data; // event="info": onlayn foydalanuvchilar soni haqida ma'lumot
					setOnlineUsers(newInfo.totalClients); // onlaynlar sonini state'ga yozadi
					break;
				case 'getMessages':
					const list: MessagePayload[] = data.list; // event="getMessages": chatning to'liq eski xabarlar ro'yxati
					setMessagesList(list); // ro'yxatni to'liq almashtiradi
					break;
				case 'message':
					const newMessage: MessagePayload = data; // event="message": yangi kelgan bitta xabar
					setMessagesList((prev) => [...prev, newMessage]); // eski ro'yxatni o'zgartirmasdan, yangi massiv sifatida qo'shadi
					break;
			}
		};
	}, [socket]);

	// sahifa ochilgandan 100ms keyin chat tugmasini ko'rsatadi (darhol emas, kichik animatsiya effekti uchun)
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenButton(true);
		}, 100);
		return () => clearTimeout(timeoutId); // komponent yo'qolsa (masalan sahifa almashsa) taymerni bekor qiladi
	}, []);

	// sahifa manzili (router.pathname) o'zgarganda tugmani vaqtincha yashiradi
	// (yuqoridagi effekt uni qayta 100ms'dan keyin ko'rsatadi — sahifa almashganda animatsiya qaytarilishi uchun)
	useEffect(() => {
		setOpenButton(false);
	}, [router.pathname]);

	// mobil: chat to'liq ekranda ochiq bo'lsa, orqadagi sahifa scroll bo'lmasin
	useEffect(() => {
		if (device !== 'mobile') return;
		document.body.style.overflow = open ? 'hidden' : '';
		return () => {
			document.body.style.overflow = ''; // komponent yo'qolganda (sahifa almashganda) scroll'ni qaytaradi
		};
	}, [open, device]);

	/** HANDLERS **/
	// chat oynasini ochadi/yopadi (toggle)
	const handleOpenChat = () => {
		setOpen((prevState) => !prevState);
	};

	// input'ga yozilayotgan matnni state'ga yozadi
	const getInputMessageHandler = useCallback(
		(e: any) => {
			const text = e.target.value;
			setMessageInput(text);
		},
		[messageInput],
	);

	// input'da Enter bosilganda xabarni yuborish funksiyasini chaqiradi
	const getKeyHandler = (e: any) => {
		try {
			if (e.key == 'Enter') {
				onClickHandler();
			}
		} catch (err: any) {
			console.log(err);
		}
	};

	// "Send" tugmasi bosilganda: input bo'sh bo'lsa xato alert ko'rsatadi, bo'lmasa xabarni WebSocket orqali serverga yuboradi
	const onClickHandler = () => {
		if (!messageInput) sweetErrorAlert(Messages.error4); // input bo'sh bo'lsa yuborilmaydi, xato ko'rsatiladi
		else {
			socket.send(JSON.stringify({ event: 'message', data: messageInput })); // xabarni socket orqali serverga jo'natadi
			setMessageInput(''); // yuborilgandan keyin input'ni tozalaydi
		}
	};

	return (
		<Stack className={`chatting ${router.pathname === '/car/detail' ? 'raised' : ''}`}>
			{openButton ? (
				<button className="chat-button" onClick={handleOpenChat}>
					{open ? <CloseFullscreenIcon /> : <MarkChatUnreadIcon />}
				</button>
			) : null}
			<Stack className={`chat-frame ${open ? 'open' : ''}`}>
				<Box className={'chat-top'} component={'div'}>
					{/* ikki tab — AI yordamchi va Live chat (mobil va PC) */}
					<div className={'chat-tabs'} role="tablist">
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'ai'}
							className={`chat-tab ${tab === 'ai' ? 'active' : ''}`}
							onClick={() => setTab('ai')}
						>
							<AutoAwesomeIcon />
							{t('AI assistant')}
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={tab === 'live'}
							className={`chat-tab ${tab === 'live' ? 'active' : ''}`}
							onClick={() => setTab('live')}
						>
							{t('Live chat')}
							<span className={'chat-tab-count'}>{onlineUsers}</span>
						</button>
					</div>
					{/* mobil: to'liq ekranda pastdagi tugma ko'rinmaydi, shuning uchun yopish tugmasi tepada */}
					{device === 'mobile' && (
						<button type="button" className={'chat-close'} onClick={handleOpenChat} aria-label={'Close chat'}>
							<CloseIcon />
						</button>
					)}
				</Box>
				{/* AI tab — yashirilganda ham suhbat saqlanib qoladi */}
				<Box className={'chat-pane'} component={'div'} style={tab === 'ai' ? undefined : { display: 'none' }}>
					<AiAssistant onNavigate={() => setOpen(false)} />
				</Box>
				<Box
					className={'chat-content'}
					id="chat-content"
					ref={chatContentRef}
					component={'div'}
					style={tab === 'ai' ? { display: 'none' } : undefined}
				>
					<ScrollableFeed>
						<Stack className={'chat-main'}>
							<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
								<div className={'welcome'}>Welcome to Live chat!</div>
							</Box>
							{messagesList.map((ele: MessagePayload) => {
								const { text, memberData } = ele; // xabar matni va uni yozgan a'zo ma'lumotini ajratib olyapti
								const memberImage = memberData?.memberImage
									? `${REACT_APP_API_URL}/${memberData.memberImage}` // a'zoning profil rasmi bo'lsa - to'liq URL yasaydi
									: '/img/profile/defaultUser.svg'; // bo'lmasa - standart avatar

								return memberData?._id === user?._id ? (
									<Box
										component={'div'}
										flexDirection={'row'}
										style={{ display: 'flex' }}
										alignItems={'flex-end'}
										justifyContent={'flex-end'}
										sx={{ m: '10px 0px' }}
									>
										<div className={'msg-right'}>{text}</div>
									</Box>
								) : (
									<Box flexDirection={'row'} style={{ display: 'flex' }} sx={{ m: '10px 0px' }} component={'div'}>
										<Avatar alt={'jonik'} src={memberImage} />
										<div className={'msg-left'}>{text}</div>
									</Box>
								);
							})}
						</Stack>
					</ScrollableFeed>
				</Box>
				<Box className={'chat-bott'} component={'div'} style={tab === 'ai' ? { display: 'none' } : undefined}>
					<input
						type={'text'}
						name={'message'}
						className={'msg-input'}
						placeholder={'Type message'}
						value={messageInput}
						onChange={getInputMessageHandler}
						onKeyDown={getKeyHandler}
					/>
					<button className={'send-msg-btn'} onClick={onClickHandler}>
						<SendIcon style={{ color: '#fff' }} />
					</button>
				</Box>
			</Stack>
		</Stack>
	);
};

export default Chat;
