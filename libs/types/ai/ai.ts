import { Car } from '../car/car';

// backend AiAnswer (askAssistant mutation javobi)
export interface AiAnswer {
	reply: string;
	cars: Car[];
	total: number;
	searchInput?: string | null; // /car?input=... uchun tayyor CarsInquiry (JSON)
	chips: string[];
	fallback: boolean;
}

// chat oynasidagi bitta xabar
export interface AiChatMessage {
	role: 'user' | 'assistant';
	text: string;
	cars?: Car[];
	total?: number;
	searchInput?: string | null;
	chips?: string[];
}
