import Vue from 'vue'
import { User } from '@/types/Users'
import { Position } from '@/services/geolocation'

export interface UsersState {
  all: number[];
  byId: {
    [key: number]: User;
  };
  
  authenticatedUser: User | null;
  userLocation: Position | null;

  workforce: number[];
  managers: {
    [key: string]: User[];
  };
}

export const initialState = (): UsersState => ({
  all: [],
  byId: {},
  authenticatedUser: null,
  userLocation: null,
  workforce: [],
  managers: {
    contractor: [],
    organization: [],
  },
})

const mutations = {
  SET_AUTHENTICATED_USER(state: UsersState, user: User) {
    state.authenticatedUser = user
    localStorage.setItem('authenticatedUser', JSON.stringify(user))
  },

  UNSET_AUTHENTICATED_USER(state: UsersState) {
    state.authenticatedUser = null
    localStorage.removeItem('authenticatedUser')
  },

  ADD_USER(state: UsersState, user: User) {
    Vue.set(state.byId, user.id, {
      ...state.byId[user.id],
      ...user,
    })
    if (!state.all.includes(user.id)) state.all.push(user.id)
  },

  REMOVE_USER(state: UsersState, userId: number) {
    Vue.delete(state.byId, userId)
    state.all = state.all.filter(id => id !== userId)
    Vue.delete(state.workforce, state.workforce.indexOf(userId))
  },

  SET_USER_LOCATION(state: UsersState, location: Position) {
    state.userLocation = location
  },

  ADD_WORKFORCE_MEMBER(state: UsersState, userId: number) {
    if (!state.workforce.includes(userId)) {
      state.workforce.push(userId)
    }
  },

  ADD_MANAGER(state: UsersState, { type, manager }: { type: string; manager: User }) {
    // TODO: Normalize this to users list, and keep only the user id for each manager object
    if (!state.managers[type].some((m: User) => m.id == manager.id)) {
      state.managers[type].push(manager)
    }
  },
}

const getters = {
  user: (state: UsersState) => (id: number) => {
    return state.byId[id]
  },

  workforce: (state: UsersState) => {
    return state.workforce.map((userId: number) => state.byId[userId])
  },
}
export default {
  state: initialState(),
  mutations,
  getters,
}