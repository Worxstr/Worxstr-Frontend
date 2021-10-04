import store from '@/store'
import axios from 'axios'
import { Conversation } from '@/definitions/Messages'

// const { commit } = store

export async function loadConversations() {
	const { data } = await axios({
		method: 'GET',
		url: 'conversations',
	})
	data.conversations.forEach((conversation: Conversation) => {
		commit('ADD_CONVERSATION', { conversation })
	})
	return data
}

export async function loadConversation(conversationId: number) {
	const { data } = await axios({
		method: 'GET',
		url: `conversations/${conversationId}`,
	})
	commit('ADD_CONVERSATION', { conversation: data.conversation })
	return data
}

export async function createConversation(userIds: number[]) {
	const { data } = await axios({
		method: 'POST',
		url: `conversations`,
		data: {
			users: userIds,
		},
	})
	commit('ADD_CONVERSATION', {
		conversation: data.conversation,
		prepend: true,
	})
	return data.conversation
}

export async function loadContacts() {
	// TODO: Flatten contacts data into users store

	const { data } = await axios({
		method: 'GET',
		url: `conversations/contacts`,
	})
	commit('UPDATE_CONTACTS', data.contacts)
	return data
}

export async function sendMessage(message: { body: string }, conversationId: number) {
	const { data } = await axios({
		method: 'POST',
		url: `conversations/${conversationId}/messages`,
		data: message,
	})
	commit('ADD_MESSAGE', data.message)
	return data.message
}