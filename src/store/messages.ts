/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import store from './'
import axios from 'axios'
import { Conversation, Message } from '@/definitions/Messages'
import { User } from '@/definitions/User'

const { commit } = store

interface MessagesState {
  conversations: {
    all: number[];
    byId: {
      [key: number]: Conversation;
    };
  };
  contacts: User[];
}

const messagesInitialState = (): MessagesState => ({
  conversations: {
    all: [],
    byId: [],
  },
  contacts: [],
})

const mutations = {
	ADD_CONVERSATION(state: MessagesState, { conversation, prepend }: { conversation: Conversation; prepend: boolean }) {
		Vue.set(state.conversations.byId, conversation.id, conversation)
		if (!state.conversations.all.includes(conversation.id))
			prepend
				? state.conversations.all.unshift(conversation.id)
				: state.conversations.all.push(conversation.id)
	},

	UPDATE_CONTACTS(state: MessagesState, contacts: User[]) {
		state.contacts = contacts
	},
	
	ADD_MESSAGE(state: MessagesState, { conversation_id, message }: Message) {
		state.conversations.byId[conversation_id].messages.push(message)
	}
}

const getters = {
	conversation: (state,/*  _, __, _rootGetters */) => (id: number) => {
		return state.conversations.byId[id]
		// return resolveRelations(state.conversations.byId[id], ['messages.sender_id'], rootGetters)
	},

	conversations: (state: MessagesState, getters: any) => {
		return state.conversations.all.map((id: number) =>
			getters.conversation(id)
		)
		.sort((c1: Conversation, c2: Conversation) => {
			return 	(new Date(c2.messages[c2.messages.length - 1]?.timestamp)).getTime() -
							(new Date(c1.messages[c1.messages.length - 1]?.timestamp)).getTime()
		})
	},
}

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
	console.log({message})
	const { data } = await axios({
		method: 'POST',
		url: `conversations/${conversationId}/messages`,
		data: message,
	})
	commit('ADD_MESSAGE', { message: data.message, conversationId })
	return data
}

export const messagesStore = {
  state: messagesInitialState(),
  mutations,
  getters,
}