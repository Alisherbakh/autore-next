import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, split, from, NormalizedCacheObject } from '@apollo/client';
import createUploadLink from 'apollo-upload-client/public/createUploadLink.js';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { getJwtToken } from '../libs/auth';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { socketVar } from './store';
let apolloClient: ApolloClient<NormalizedCacheObject>;

// 1-QADAM: Tokenni tayyorlash — har bir so'rovga JWT token qo'shib beriladi
function getHeaders() {
	const headers = {} as HeadersInit; // bo'sh header obyekti yaratyapti
	const token = getJwtToken(); // localStorage'dan JWT tokenni olyapti
	// @ts-ignore
	if (token) headers['Authorization'] = `Bearer ${token}`; // token bo'lsa, Authorization header qo'shyapti
	return headers; // tayyor header'ni qaytaryapti
}

const tokenRefreshLink = new TokenRefreshLink({
	accessTokenField: 'accessToken', // yangilangan tokenni shu maydondan kutyapti
	isTokenValidOrUndefined: () => {
		return true; // token har doim to'g'ri deb hisoblanyapti (tekshiruv yozilmagan)
	}, // @ts-ignore
	fetchAccessToken: () => {
		// execute refresh token
		return null; // yangi token olish logikasi hali yozilmagan
	},
});

	// Custom WebSocket client
		class LoggingWebSocket {
			private socket: WebSocket;

			constructor(url: string) {
				this.socket = new WebSocket(`${url}?token=${getJwtToken()}`);
				socketVar(this.socket);

				this.socket.onopen = () => {
					console.log('WebSocket connection!');
				};

				this.socket.onmessage = (msg) => {
					console.log('WebSocket message:', msg.data);
				};

				this.socket.onerror = (error) => {
					console.log('WebSocket, error:', error);
				};
			}

			send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) {
				this.socket.send(data);
			}

			close() {
				this.socket.close();
			}
		}


function createIsomorphicLink() {
	if (typeof window !== 'undefined') { // faqat brauzerda ishlaydi (server tomonda emas)
		const authLink = new ApolloLink((operation, forward) => {
			operation.setContext(({ headers = {} }) => ({
				headers: {
					...headers, // eski header'larni saqlab qolyapti
					...getHeaders(), // token header'ini qo'shib qo'yyapti
				},
			}));
			console.warn('requesting.. ', operation); // har bir so'rovni console'ga chiqaryapti
			return forward(operation); // so'rovni keyingi link'ga uzatyapti
		});

		// @ts-ignore
		const link = new createUploadLink({
			uri: process.env.REACT_APP_API_GRAPHQL_URL, // GraphQL server manzili (fayl yuklashni ham qo'llaydi)
		});

	
		/* WEBSOCKET SUBSCRIPTION LINK */
		const wsLink = new WebSocketLink({
			uri: process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3009', // WebSocket server manzili
			options: {
				reconnect: false, // uzilsa avtomatik qayta ulanmaydi
				timeout: 30000, // 30 soniya kutish vaqti
				connectionParams: () => {
					return { headers: getHeaders() }; // ulanishda token yuboryapti
				},
			},
			webSocketImpl: LoggingWebSocket,
		});

		// 3-QADAM: Xatolarni tutish — GraphQL/tarmoq xatosi bo'lsa dastur "jim" qulamasligi uchun log qilinadi
		const errorLink = onError(({ graphQLErrors, networkError, response }) => {
			if (graphQLErrors) {
				graphQLErrors.map(({ message, locations, path, extensions }) => {
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`); // GraphQL xatolarini log qilyapti
					if (!message.includes('input')) sweetErrorAlert(message); // "input" so'zi bo'lmasa, foydalanuvchiga xato haqida alert ko'rsatyapti
				});
			}
			if (networkError) console.log(`[Network error]: ${networkError}`); // tarmoq xatosini log qilyapti
			// @ts-ignore
			if (networkError?.statusCode === 401) {
				// 401 (avtorizatsiya xatosi) holati uchun joy, lekin hozircha bo'sh
			}
		});

		// 2-QADAM: "Yo'l" tanlash — subscription bo'lsa WebSocket'ga, oddiy so'rov bo'lsa HTTP'ga yuboriladi
		const splitLink = split(
			({ query }) => {
				const definition = getMainDefinition(query); // so'rov turini aniqlayapti
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'; // subscription ekanini tekshiryapti
			},
			wsLink, // subscription bo'lsa - WebSocket orqali
			authLink.concat(link), // aks holda - oddiy HTTP so'rov orqali
		);

		return from([errorLink, tokenRefreshLink, splitLink]); // barcha link'larni bitta zanjirga birlashtiryapti
	}
}

// 4-QADAM: Client yaratish — link'lar (HTTP/WS/error) + cache birlashib bitta ApolloClient bo'ladi
function createApolloClient() {// yangi ApolloClient instance yaratyapti
	return new ApolloClient({
		ssrMode: typeof window === 'undefined', // server tomonda ishlayotgan bo'lsa SSR rejimini yoqyapti
		link: createIsomorphicLink(), // yuqorida yaratilgan link zanjirini ulayapti
		cache: new InMemoryCache(), // ANA SHU YERDA CACHE HOSIL QILINYAPTI — GraphQL natijalar shu yerda saqlanadi
		resolvers: {}, // lokal resolver'lar (hozircha bo'sh)
	});
}

// 5-QADAM: Bitta nusxa saqlash (singleton) — client faqat bir marta yaratiladi, cache/ulanish yo'qolmasin uchun
export function initializeApollo(initialState = null) {//apollo boladigan bolsa shuni qaytaryabdi,
	const _apolloClient = apolloClient ?? createApolloClient();//bolmasa yangi yartib beryabdi
	if (initialState) _apolloClient.cache.restore(initialState); // SSR'dan kelgan ma'lumotni cache'ga tiklayapti
	if (typeof window === 'undefined') return _apolloClient; // serverda har safar yangi client qaytaryapti (har foydalanuvchi uchun alohida)
	if (!apolloClient) apolloClient = _apolloClient; // brauzerda global o'zgaruvchiga saqlab qo'yyapti (bir marta, keyin qayta yaratilmaydi)

	return _apolloClient; // tayyor client'ni qaytaryapti
}

// 6-QADAM: React'ga ulash — bu hook orqali client butun ilovaga (_app.tsx) taqdim etiladi
export function useApollo(initialState: any) {// useApolloni _app fileda ishlatdik
	return useMemo(() => initializeApollo(initialState), [initialState]);// useMemoda  Initialize ni qaytaryabdi
}

/**
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// No Subscription required for develop process

const httpLink = createHttpLink({
  uri: "http://localhost:3007/graphql",
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;
*/
