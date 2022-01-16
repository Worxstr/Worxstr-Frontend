import Vue from 'vue'
import { currentUserIs, Managers, User, userIs, UserRole } from '@/types/Users'
import { Position } from '@/services/geolocation'

export interface UsersState {
  all: number[]
  byId: {
    [key: number]: User
  }
  
  me: number | null
  deviceLocation: Position | null

  workforce: number[]
  managers: {
    [key: string]: User[]
  }
}

export const initialState = (): UsersState => ({
  all: [],
  byId: {},
  me: null,
  deviceLocation: null,
  workforce: [],
  managers: {
    contractor: [],
    organization: [],
  },
})

function addUser(state: UsersState, user: User) {
  Vue.set(state.byId, user.id, {
    ...state.byId[user.id],
    ...user,
  })
  if (!state.all.includes(user.id)) state.all.push(user.id)
}

const mutations = {
  SET_AUTHENTICATED_USER(state: UsersState, user: User) {
    addUser(state, user)
    state.me = user.id
    localStorage.setItem('me', JSON.stringify(user))
  },

  UNSET_AUTHENTICATED_USER(state: UsersState) {
    state.me = null
    localStorage.removeItem('me')
  },

  ADD_USER(state: UsersState, user: User) {
    addUser(state, user)
  },

  REMOVE_USER(state: UsersState, userId: number) {
    Vue.delete(state.byId, userId)
    state.all = state.all.filter(id => id !== userId)
    Vue.delete(state.workforce, state.workforce.indexOf(userId))
  },

  SET_DEVICE_LOCATION(state: UsersState, location: Position) {
    state.deviceLocation = location
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

  me: (state: UsersState) => {
    if (!state.me) return null
    return state.byId[state.me]
  },

  workforce: (state: UsersState) => {
    return state.workforce.map((userId: number) => state.byId[userId])
  },

  // TODO: These two methods could go in types/Users.ts. Or maybe those functions should go here? Idk
  // Check if a user has a verified status in dwolla
  userIsVerified: (state: UsersState, getters: any) => (userId: number) => {
    const user = getters.user(userId)
    const field = userIs(user, UserRole.Contractor) ? 'contractor_info' : (userIs(user, ...Managers) ? 'organization_info' : null)
    if (!field || !user) return true // Don't change the app behavior if not authed
    return user[field]?.dwolla_customer_status === 'verified'
  },

  iAmVerified: (state: UsersState, getters: any) => {
    if (!getters.me) return false
    return getters.userIsVerified(getters.me.id)
  },
}
export default {
  state: initialState(),
  mutations,
  getters,
}