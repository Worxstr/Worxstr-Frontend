/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Conversation, Message } from '@/definitions/Messages'
import { User } from '@/definitions/User'

interface MessagesState {
  conversations: {
    all: number[];
    byId: {
      [key: number]: Conversation;
    };
  };
  contacts: User[];
}

const initialState = (): MessagesState => ({
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
	
	ADD_MESSAGE(state: MessagesState, message: Message) {
		state.conversations.byId[message.conversation_id].messages.push(message)
	}
}

const getters = {
	conversation: (state: MessagesState,/*  _, __, _rootGetters */) => (id: number) => {
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

export default {
  state: initialState(),
  mutations,
  getters,
}