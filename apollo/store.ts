import { makeVar } from '@apollo/client'; // Apollo'ning "reactive variable" hosil qiluvchi funksiyasi

import { CustomJwtPayload } from '../libs/types/customJwtPayload';

// mavzu (theme) uchun global o'zgaruvchi — hozircha bo'sh obyekt bilan boshlanadi
export const themeVar = makeVar({});

// tizimga kirgan foydalanuvchi ma'lumotlarini saqlaydigan global o'zgaruvchi (reactive variable)
// bu o'zgaruvchi butun ilova bo'ylab (har qanday komponentda) props'siz ishlatiladi,
// qiymati o'zgarsa - shu o'zgaruvchini o'qiyotgan komponentlar avtomatik qayta render bo'ladi
export const userVar = makeVar<CustomJwtPayload>({
	_id: '', // foydalanuvchi ID'si
	memberType: '', // foydalanuvchi turi (masalan: USER, ADMIN)
	memberStatus: '', // holati (masalan: ACTIVE, BLOCKED)
	memberAuthType: '', // qanday usulda ro'yxatdan o'tgani
	memberPhone: '', // telefon raqami
	memberNick: '', // login/nickname
	memberFullName: '', // to'liq ismi
	memberImage: '', // profil rasmi
	memberAddress: '', // manzili
	memberDesc: '', // tavsifi
	memberCars: 0, // e'lonlari soni
	memberRank: 0, // reytingi
	memberArticles: 0, // maqolalari soni
	memberPoints: 0, // ballari
	memberLikes: 0, // yoqtirishlar soni
	memberViews: 0, // ko'rishlar soni
	memberWarnings: 0, // ogohlantirishlar soni
	memberBlocks: 0, // bloklanishlar soni
});
//@ts-ignore
export const socketVar = makeVar<WebSocket>();