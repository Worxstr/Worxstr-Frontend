import { User } from '@/definitions/User'

export type Message = {
	body: string;
	conversation_id: number;
	id: number;
	sender_id: number;
	timestamp: string;
}

export type Conversation = {
	id: number;
	messages: Message[];
	participants: User[];
}