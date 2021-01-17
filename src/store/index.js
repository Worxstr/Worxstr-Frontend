/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from '../router'

import { normalizeRelations, resolveRelations } from '../plugins/helpers'

Vue.use(Vuex)

axios.defaults.withCredentials = true

const baseUrl = process.env.VUE_APP_API_BASE_URL

const store = new Vuex.Store({
  state: {
    snackbar: {
      show: false,
      text: 'Test',
      timeout: 5000
    },
    authenticatedUser: null,
    clock: {
      clocked: false,
      break: false,
      history: {
        lastLoadedOffset: 0,
        all: [],
        byId: {}
      },
    },
    approvals: {
      timecards: {
        all: [],
        byId: {}
      }
    },
    shifts: {
      next: null
    }
  },
  mutations: {
    SHOW_SNACKBAR(state, snackbar) {
      state.snackbar = {
        ...state.snackbar,
        ...snackbar,
        show: true,
      }
    },
    SET_AUTHENTICATED_USER(state, user) {
      state.authenticatedUser = user
      localStorage.setItem('authenticatedUser', JSON.stringify(user))
    },
    UNSET_AUTHENTICATED_USER(state) {
      state.authenticatedUser = null
      localStorage.removeItem('authenticatedUser')
    },
    ADD_CLOCK_EVENT(state, event) {
      Vue.set(state.clock.history.byId, event.id, event)
      if (!state.clock.history.all.includes(event.id))
        state.clock.history.all.push(event.id)
    },
    INCREMENT_CLOCK_HISTORY_OFFSET(state) {
      state.clock.history.lastLoadedOffset++
    },
    SET_NEXT_SHIFT(state, shift) {
      state.shifts.next = shift
    },
    CLOCK_IN(state) {
      state.clock.clocked = true
    },
    CLOCK_OUT(state) {
      state.clock.clocked = false
    },
    START_BREAK(state) {
      state.clock.break = true
    },
    END_BREAK(state) {
      state.clock.break = false
    },
    ADD_TIMECARD(state, timecard) {
      Vue.set(state.approvals.timecards.byId, timecard.id, timecard)
      if (!state.approvals.timecards.all.includes(timecard.id))
        state.approvals.timecards.all.push(timecard.id)
    },
    REMOVE_TIMECARD(state, timecardId) {
      Vue.delete(state.approvals.timecards.byId, timecardId)
      Vue.delete(state.approvals.timecards.all, state.approvals.timecards.all.indexOf(timecardId))
    }
  },
  actions: {
    showSnackbar({ commit }, snackbar) {
      commit('SHOW_SNACKBAR', snackbar)
    },
    async signIn({ commit, dispatch }, credentials) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          data: {
            ...credentials,
            'remember_me': true
          },
        })
        dispatch('getAuthenticatedUser')
        router.push({ name: 'clock' })
        return data
      }
      catch (err) {
        commit('UNSET_AUTHENTICATED_USER')
        return err
      }
    },

    async signUp({ dispatch }, userData) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/register`,
          data: userData
        })
        router.push({ name: 'home' })
        dispatch('showSnackbar', { text: "Check your email to verify your account!" })
        return data
      }
      catch (err) {
        return err
      }
    },

    async signOut({ commit }) {
      await axios({
        method: 'POST',
        url: `${baseUrl}/auth/logout`
      })
      commit('UNSET_AUTHENTICATED_USER')
      router.push({ name: 'home' })
    },

    async getAuthenticatedUser({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/users/me`,

      })
      commit('SET_AUTHENTICATED_USER', data.authenticated_user)
    },

    async loadClockHistory({ state, commit }) {
      const { data } = await axios.get(`${baseUrl}/clock/history`, {
        params: {
          'week_offset': state.clock.history.lastLoadedOffset
        }
      })
      console.log(state.clock.history.lastLoadedOffset)
      data.history.forEach(event => {
        // TODO: Normalize nested data
        commit('ADD_CLOCK_EVENT', normalizeRelations(event, [/*'user'*/]))
        /* commit('ADD_USER', event.user, {
          root: true
        }) */
      })
      commit('INCREMENT_CLOCK_HISTORY_OFFSET')
    },

    async loadNextShift({ commit }) {
      const { data } = await axios.get(`${baseUrl}/shifts/next`)
      commit('SET_NEXT_SHIFT', data.event)
    },

    async clockIn({ commit, state }, { code }) {
      console.log(`got code ${code}`)
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/clock/clock-in`,
          params: {
            'shift_id': state.shifts.next.id
          },
          data: {
            code
          }
        })
        console.log('code was correct')
        commit('ADD_CLOCK_EVENT', data.event)
        commit('CLOCK_IN')
        return data
      }
      catch (err) {
        console.log('code was incorrect')
        return err
      }
    },

    async clockOut({ commit, state }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/clock/clock-out`,
        params: {
          'shift_id': state.shifts.next.id
        },
      })
      commit('ADD_CLOCK_EVENT', data.event)
      commit('CLOCK_OUT')
    },

    async loadApprovals({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/clock/timecards`
      })
      data.timecards.forEach(timecard => {
        // TODO: Normalize nested data
        commit('ADD_TIMECARD', timecard)
      })
    },

    async toggleBreak({ commit }, breakState) {


      const action = breakState ? 'end' : 'start'
      console.log(action)

      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/clock/${action}-break`,
      })
      commit('ADD_CLOCK_EVENT', data.data)
      commit(`${action.toUpperCase()}_BREAK`)
    },

    async updateTimecard({ commit }, { timecardId, events }) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/clock/timecards/${timecardId}`,
        data: {
          changes: events
        },
      })
      commit('ADD_TIMECARD', data.timecard)
    },

    async approveTimecards({ commit }, timecards) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/approve`,
        data: {
          timecards
        }
      })
      data.event.forEach(timecard => {
        // TODO: Normalize nested data
        commit('ADD_TIMECARD', timecard)
      })
    },

    async denyTimecards({ commit }, timecards) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/deny`,
        data: {
          timecards
        }
      })
      data.event.forEach(timecard => {
        // TODO: Normalize nested data
        commit('REMOVE_TIMECARD', timecard.id)
      })
    },

    async approvePayment({ commit }, { timecards, transaction }) {
      await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/complete`,
        data: {
          timecards,
          transaction
        }
      })
      timecards.forEach(timecard => {
        commit('REMOVE_TIMECARD', timecard.id)
      })
    }
  },
  getters: {
    // TODO: Transform this and add labels, separated by day of week
    clockEvent: (state, _, __, rootGetters) => id => {
      return resolveRelations(state.clock.history.byId[id], [/*'user'*/], rootGetters)
    },
    clockHistory: (state, getters) => {
      let events = state.clock.history.all.map(eventId => getters.clockEvent(eventId))
      events = events.sort((a, b) => {
        return (new Date(b.time)) - (new Date(a.time))
      })

      let last

      return events.flatMap((event, i) => {
        const current = new Date(event.time)
        const ret = []

        if (!last || !(last.getDate() === current.getDate()
          && last.getMonth() === current.getMonth()
          && last.getFullYear() === current.getFullYear())) {

          ret.push(
            {
              label: current,
              id: `day-${i}`
            }
          )
        }
        ret.push(event)
        last = current
        return ret
      })
    },
    nextShift: (state) => {
      if (!state.shifts.next) return {}

      const begin = new Date(state.shifts.next.time_begin),
        end = new Date(state.shifts.next.time_end),
        now = new Date()

      const shiftActive = (begin <= now && now <= end)

      return {
        ...state.shifts.next,
        time_begin: begin,
        time_end: end,
        shiftActive,
      }
    },
    timecard: (state) => id => {
      return state.approvals.timecards.byId[id]
    },
    timecards: (state, getters) => {
      return state.approvals.timecards.all.map(id => getters.timecard(id))
    },
    approvedTimecards: (state, getters) => {
      return getters.timecards.filter((timecard) => timecard.approved && !timecard.paid);
    },
    unapprovedTimecards: (state, getters) => {
      return getters.timecards.filter((timecard) => !timecard.approved);
    },
  },
  modules: {
  }
})

axios.interceptors.response.use(response => {
  return response
}, error => {

  // if (error.config.hideErrorMessage) return

  let message;
  const res = error.response.data

  console.log(error.request)

  // TODO: this is stupid, don't keep this. use custom axios config
  if (error.request.responseURL == 'http://localhost:5000/users/me') return

  if (res.message || res.response.error) {
    message = res.message || res.response.error
  } else {
    const errorList = error.response.data.response.errors
    message = errorList[Object.keys(errorList)[0]][0]
  }
  store.dispatch('showSnackbar', { text: message })

  return Promise.reject(error)
})

export default store