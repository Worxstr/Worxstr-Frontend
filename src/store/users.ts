import Vue from 'vue'
import { User } from '@/definitions/User'

interface UsersState {
  authenticatedUser: User | null;
  userLocation: {
    lat: number;
    lng: number;
    accuracy?: number;
  } | null;
  users: {
    all: number[];
    byId: {
      [key: number]: User;
    };
  };
  workforce: number[];
  managers: {
    [key: string]: User[];
  };
}

const initialState = (): UsersState => ({
  authenticatedUser: null,
  userLocation: null,
  users: {
    all: [],
    byId: {},
  },
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
    Vue.set(state.users.byId, user.id, {
      ...state.users.byId[user.id],
      ...user,
    })
    if (!state.users.all.includes(user.id)) state.users.all.push(user.id)
  },

  REMOVE_USER(state: UsersState, userId: number) {
    Vue.delete(state.users.byId, userId)
    state.users.all = state.users.all.filter(id => id !== userId)
    Vue.delete(state.workforce, state.workforce.indexOf(userId))
  },

  SET_USER_LOCATION(state: UsersState, { lat, lng, accuracy }: any) {
    state.userLocation = { lat, lng, accuracy }
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
    return state.users.byId[id]
  },

  workforce: (state: UsersState) => {
    return state.workforce.map((userId: number) => state.users.byId[userId])
  },
}
export default {
  state: initialState(),
  mutations,
  getters,
}