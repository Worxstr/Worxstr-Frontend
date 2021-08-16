/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import axios from 'axios' // TODO: Remove axios
import router from '../router'

import { Capacitor } from '@capacitor/core'

import socket from '../plugins/socket-io'
import { normalizeRelations, resolveRelations } from '../plugins/helpers'
import { Conversation } from '@/definitions/Messages'
import { User, defaultRoute } from '@/definitions/User'
import { ClockEvent, Timecard } from '@/definitions/Clock'
import { Job, Shift } from '@/definitions/Job'
import { CalendarEvent } from '@/definitions/Schedule'

Vue.use(Vuex)

axios.defaults.withCredentials = true // TODO: Remove axios

const baseUrl =
  process.env.VUE_APP_API_BASE_URL ||
  (Capacitor.isNativePlatform()
    ? 'https://dev.worxstr.com'
    : window.location.origin.replace('8080', '5000'))
interface RootState {
  snackbar: {
    show: boolean;
    text: string;
    timeout: number;
  };
  authenticatedUser: User | null;
  users: {
    all: number[];
    byId: {
      [key: number]: User;
    };
  };
  clock: {
    clocked: boolean;
    break: boolean;
    history: {
      lastLoadedOffset: number;
      all: number[];
      byId: {
        [key: number]: ClockEvent;
      };
    };
  };
  approvals: {
    timecards: {
      all: number[];
      byId: {
        [key: number]: Timecard;
      };
    };
  };
  shifts: {
    next: Shift | null;
    all: number[];
    byId: {
      [key: number]: Shift;
    };
  };
  jobs: {
    all: number[];
    byId: {
      [key: number]: Job;
    };
  };
  workforce: number[];
  managers: {
    [key: string]: User[];
  };
  events: {
    all: number[];
    byId: {
      [key: number]: CalendarEvent;
    };
  };
  conversations: {
    all: number[];
    byId: {
      [key: number]: Conversation;
    };
  };
  contacts: User[];
}

const storeConfig: StoreOptions<RootState> = {
  state: {
    snackbar: {
      show: false,
      text: 'Test',
      timeout: 5000,
    },
    authenticatedUser: null,
    users: {
      all: [],
      byId: {},
    },
    clock: {
      clocked: false,
      break: false,
      history: {
        lastLoadedOffset: 0,
        all: [],
        byId: {},
      },
    },
    approvals: {
      timecards: {
        all: [],
        byId: {},
      },
    },
    shifts: {
      next: null,
      // TODO: Flatten shift data from jobs
      all: [],
      byId: {},
    },
    jobs: {
      all: [],
      byId: {},
    },
    workforce: [],
    managers: {
      contractor: [],
      organization: [],
    },
    events: {
      all: [],
      byId: {},
    },
    conversations: {
      all: [],
      byId: [],
    },
    contacts: [],
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
    ADD_USER(state, user) {
      Vue.set(state.users.byId, user.id, {
        ...state.users.byId[user.id],
        ...user,
      })
      if (!state.users.all.includes(user.id)) state.users.all.push(user.id)
    },
    SET_SSN_REGISTERED(state) {
      if (state.authenticatedUser?.contractor_info)
        state.authenticatedUser.contractor_info.need_info = false
    },
    ADD_CLOCK_EVENT(state, event: ClockEvent) {
      Vue.set(state.clock.history.byId, event.id, event)
      if (!state.clock.history.all.includes(event.id))
        state.clock.history.all.push(event.id)
    },
    INCREMENT_CLOCK_HISTORY_OFFSET(state) {
      state.clock.history.lastLoadedOffset++
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
      Vue.delete(
        state.approvals.timecards.all,
        state.approvals.timecards.all.indexOf(timecardId)
      )
    },
    ADD_JOB(state, job) {
      Vue.set(state.jobs.byId, job.id, {
        ...state.jobs.byId[job.id],
        ...job
      })
      if (!state.jobs.all.includes(job.id)) state.jobs.all.push(job.id)
    },
    REMOVE_JOB(state, jobId) {
      Vue.delete(state.jobs.byId, jobId)
      Vue.delete(
        state.jobs.all,
        state.jobs.all.findIndex((id) => id == jobId)
      )
    },
    ADD_WORKFORCE_MEMBER(state, userId) {
      if (!state.workforce.includes(userId)) {
        state.workforce.push(userId)
      }
    },
    ADD_MANAGER(state, { type, manager }: { type: string; manager: User }) {
      if (!state.managers[type].some((m: User) => m.id == manager.id)) {
        state.managers[type].push(manager)
      }
    },
    SET_NEXT_SHIFT(state, shift) {
      state.shifts.next = shift
    },
    ADD_SHIFT(state, { shift, jobId }) {
      console.log(shift, jobId)
      state.jobs.byId[jobId].shifts.push(shift)
      // TODO: Flatten shift data from jobs
      // Vue.set(state.shifts.byId, shift.id, shift)
      // if (!state.shifts.all.includes(shift.id))
      //   state.shifts.all.push(shift.id)
    },
    REMOVE_SHIFT(state, { jobId, shiftId }) {
      console.log(shiftId, jobId)
      state.jobs.byId[jobId].shifts = state.jobs.byId[jobId].shifts.filter(
        (shift) => shift.id != shiftId
      )
    },
    ADD_EVENT(state, event) {
      Vue.set(state.events.byId, event.id, event)
      if (!state.events.all.includes(event.id)) state.events.all.push(event.id)
    },
    ADD_CONVERSATION(state, { conversation, prepend }) {
      Vue.set(state.conversations.byId, conversation.id, conversation)
      if (!state.conversations.all.includes(conversation.id))
        prepend
          ? state.conversations.all.unshift(conversation.id)
          : state.conversations.all.push(conversation.id)
    },
    UPDATE_CONTACTS(state, contacts) {
      state.contacts = contacts
    },
    ADD_MESSAGE(state, { conversationId, message }) {
      state.conversations.byId[conversationId].messages.push(message)
    },
  },
  actions: {
    showSnackbar({ commit }, snackbar) {
      commit('SHOW_SNACKBAR', snackbar)
    },
    async contactSales({ dispatch }, request) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/contact/sales`,
<<<<<<< HEAD
          data: request,
        })
        dispatch('showSnackbar', {
          text: 'Thanks! We will get back to you shortly.',
        })
        return data
      } catch (err) {
=======
          data: request
        })
        dispatch('showSnackbar', { text: "Thanks! We will get back to you shortly." })
        return data
      }
      catch (err) {
>>>>>>> 42fc546476c664f4b2a447234e8eee5228f98df8
        return err
      }
    },
    async signIn({ commit, dispatch }, credentials) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            include_auth_token: 'true',
          },
          data: {
            ...credentials,
            remember_me: true,
          },
        })
        const authToken = data.response?.user?.authentication_token
        
        // Use authentication token in subsequent requests
        // axios.defaults.headers.common['Authentication-Token'] = authToken
        // Set token in secure storage on iOS/Android
        // await SecureStoragePlugin.set({
        //   key: 'authToken',
        //   value: authToken
        // })
        await dispatch('getAuthenticatedUser')
        
        setTimeout(() => {
          socket.emit('sign-in', authToken)
        }, 1000)

        router.push({ name: defaultRoute() })
        return data
      } catch (err) {
        commit('UNSET_AUTHENTICATED_USER')
        return err
      }
    },

    async signUp({ dispatch }, userData) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/register`,
          data: userData,
        })
        router.push({ name: 'home' })
        dispatch('showSnackbar', {
          text: 'Check your email to verify your account!',
        })
        return data
      } catch (err) {
        return err
      }
    },

    async signOut({ commit }) {
      await axios({
        method: 'POST',
        url: `${baseUrl}/auth/logout`,
      })
      commit('UNSET_AUTHENTICATED_USER')
      router.push({ name: 'home' })
    },

    async resetPassword({ commit }, email) {
      await axios({
        method: 'POST',
        url: `${baseUrl}/auth/reset`,
        data: {
          email,
        },
      })
    },

    async getAuthenticatedUser({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/users/me`,
      })
      commit('SET_AUTHENTICATED_USER', data.authenticated_user)
      return data.authenticated_user
    },

    async loadUser({ commit }, userId) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/users/${userId}`,
      })
      commit('ADD_USER', data.user)
    },

    async loadClockHistory({ state, commit }) {
      const { data } = await axios.get(`${baseUrl}/clock/history`, {
        params: {
          week_offset: state.clock.history.lastLoadedOffset,
        },
      })
      data.history.forEach((event: ClockEvent) => {
        // TODO: Normalize nested data
        commit(
          'ADD_CLOCK_EVENT',
          normalizeRelations(event, [
            /*'user'*/
          ])
        )
        /* commit('ADD_USER', event.user, {
          root: true
        }) */
      })
      commit('INCREMENT_CLOCK_HISTORY_OFFSET')
    },

    async loadNextShift({ commit }) {
      const { data } = await axios.get(`${baseUrl}/shifts/next`)
      commit('SET_NEXT_SHIFT', data.shift)
    },

    async clockIn({ commit, state }, { code }) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/clock/clock-in`,
          params: {
            shift_id: state.shifts.next?.id.toString() || '',
          },
          data: {
            code,
          },
        })
        commit('ADD_CLOCK_EVENT', data.event)
        commit('CLOCK_IN')
        return data
      } catch (err) {
        return err
      }
    },

    async clockOut({ commit, state }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/clock/clock-out`,
        params: {
          shift_id: state.shifts.next?.id.toString() || '',
        },
      })
      commit('ADD_CLOCK_EVENT', data.event)
      commit('CLOCK_OUT')
    },

    async loadApprovals({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/clock/timecards`,
      })
      data.timecards.forEach((timecard: Timecard) => {
        // TODO: Normalize nested data
        commit('ADD_TIMECARD', timecard)
      })
    },

    async toggleBreak({ commit }, breakState) {
      const action = breakState ? 'end' : 'start'

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
          changes: events,
        },
      })
      commit('ADD_TIMECARD', data.timecard)
    },

    async approveTimecards({ commit }, timecards) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/approve`,
        data: {
          timecards,
        },
      })
      data.event.forEach((timecard: Timecard) => {
        // TODO: Normalize nested data
        commit('ADD_TIMECARD', timecard)
      })
    },

    async denyTimecards({ commit }, timecards) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/deny`,
        data: {
          timecards,
        },
      })
      data.event.forEach((timecard: Timecard) => {
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
          transaction,
        },
      })
      timecards.forEach((timecard: Timecard) => {
        commit('REMOVE_TIMECARD', timecard.id)
      })
    },

    async loadManagers({ commit, state }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/jobs/managers`,
        params: {
<<<<<<< HEAD
          manager_id:
            state.authenticatedUser?.manager_id || state.authenticatedUser?.id,
        },
=======
          manager_id: state.authenticatedUser?.manager_id || state.authenticatedUser?.id
        }
>>>>>>> 42fc546476c664f4b2a447234e8eee5228f98df8
      })
      data.contractor_managers.forEach((m: User) => {
        commit('ADD_MANAGER', { type: 'contractor', manager: m })
      })
      data.organization_managers.forEach((m: User) => {
        commit('ADD_MANAGER', { type: 'organization', manager: m })
      })
    },

    async loadJobs({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/jobs`,
      })
      data.jobs.forEach((job: Job) => {
        // TODO: Normalize nested data
        commit('ADD_JOB', job)
      })
    },

    async loadJob({ commit, getters }, jobId) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/jobs/${jobId}`,
      })

      // Flatten shift data
      // data.job.shifts = data.job.shifts.map(shift => {
      //   commit('ADD_SHIFT', shift)
      //   return shift.id
      // })

      data.job.contractors.forEach((c: User) => {
        commit('ADD_USER', c)
      })

      commit('ADD_JOB', data.job)
    },

    async createJob({ commit }, job) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/jobs`,
        data: job,
      })
      commit('ADD_JOB', data.job)
    },

    async updateJob({ commit }, job) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/jobs/${job.id}`,
        data: job,
      })
      commit('ADD_JOB', data.job)
    },

    async closeJob({ commit }, jobId) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/jobs/${jobId}/close`,
      })
      commit('REMOVE_JOB', jobId)
    },

    async createShift({ commit }, { shift, jobId }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/shifts`,
        data: shift,
<<<<<<< HEAD
        params: { job_id: jobId },
=======
        params: { job_id: jobId }
>>>>>>> 42fc546476c664f4b2a447234e8eee5228f98df8
      })
      data.shifts.forEach((shift: Shift) => {
        commit('ADD_SHIFT', { shift, jobId })
      })
    },

    async updateShift({ commit }, shift) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/shifts/${shift.id}`,
        data: { shift },
      })
      commit('REMOVE_SHIFT', { shiftId: shift.id, jobId: data.shift.job_id })
      commit('ADD_SHIFT', { shift: data.shift, jobId: data.shift.job_id })
    },

    async deleteShift({ commit }, { shiftId, jobId }) {
      const { data } = await axios({
        method: 'DELETE',
        url: `${baseUrl}/shifts/${shiftId}`,
      })
      commit('REMOVE_SHIFT', { shiftId, jobId })
    },

    async loadWorkforce({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/users/contractors`,
      })
      data.users.forEach((u: User) => {
        commit('ADD_USER', u)
        commit('ADD_WORKFORCE_MEMBER', u.id)
      })
    },

    async addManager({ commit }, manager) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/users/add-manager`,
        data: manager,
      })
      commit('ADD_USER', data)
      commit('ADD_WORKFORCE_MEMBER', data.id)
    },

    async addContractor({ commit }, contractor) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/users/add-contractor`,
        data: contractor,
      })
      commit('ADD_USER', data)
      commit('ADD_WORKFORCE_MEMBER', data.id)
    },

    async loadCalendarEvents({ commit }, { start, end }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/calendar`,
        params: {
          date_begin: start,
          date_end: end,
        },
      })
      console.log(data)
      data.events.forEach((event: CalendarEvent) => commit('ADD_EVENT', event))
    },

    async loadConversations({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/conversations`,
      })
      data.conversations.forEach((conversation: Conversation) => {
        commit('ADD_CONVERSATION', { conversation })
      })
    },

    async loadConversation({ commit }, conversationId) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/conversations/${conversationId}`,
      })
      commit('ADD_CONVERSATION', { conversation: data.conversation })
    },

    async createConversation({ commit }, userIds) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/conversations`,
        data: {
          users: userIds,
        },
      })
      commit('ADD_CONVERSATION', {
        conversation: data.conversation,
        prepend: true,
      })
      return data.conversation
    },

    async loadContacts({ commit }) {
      // TODO: Flatten contacts data into users store

      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/conversations/contacts`,
      })
      commit('UPDATE_CONTACTS', data.contacts)
    },

    async sendMessage({ commit }, { message, conversationId }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/conversations/${conversationId}/messages`,
        data: message,
      })
      commit('ADD_MESSAGE', { message: data.message, conversationId })
    },
    async updatePassword({ commit }, newPassword) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/users/reset-password`,
        data: {
          password: newPassword,
        },
      })
    },
    async setSSN({ commit }, ssn) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/users/me/ssn`,
        data: {
          ssn,
        },
      })
      commit('SET_SSN_REGISTERED')
    },
  },
  getters: {
    // TODO: Transform this and add labels, separated by day of week
    user: (state) => (id: number) => {
      return state.users.byId[id]
    },
    clockEvent: (state, _, __, rootGetters) => (id: number) => {
      return resolveRelations(
        state.clock.history.byId[id],
        [
          /*'user'*/
        ],
        rootGetters
      )
    },
    clockHistory: (state, getters) => {
      let events = state.clock.history.all.map((eventId) =>
        getters.clockEvent(eventId)
      )
      events = events.sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      })

      return events
    },
    nextShift: (state) => {
      if (!state.shifts.next) return {}

      const begin = new Date(state.shifts.next.time_begin),
        end = new Date(state.shifts.next.time_end),
        now = new Date()

      const shiftActive = begin <= now && now <= end

      return {
        ...state.shifts.next,
        time_begin: begin,
        time_end: end,
        shiftActive,
      }
    },
    timecard: (state) => (id: number) => {
      return state.approvals.timecards.byId[id]
    },
    timecards: (state, getters) => {
      return state.approvals.timecards.all.map((id) => getters.timecard(id))
    },
    approvedTimecards: (state, getters) => {
      return getters.timecards.filter(
        (timecard: Timecard) => timecard.approved && !timecard.paid
      )
    },
    unapprovedTimecards: (state, getters) => {
      return getters.timecards.filter(
        (timecard: Timecard) => !timecard.approved
      )
    },
    job: (state) => (id: number) => {
      const job = state.jobs.byId[id]

      // if (job && job.shifts)
      //   job.shifts = job.shifts.map(shiftId => {
      //     return getters.shift(shiftId)
      //   })

      return job
    },
    jobs: (state, getters) => {
      return state.jobs.all.map((id) => getters.job(id))
    },
    directJobs: (state, getters) => {
      return getters.jobs.filter((job: Job) => job.direct)
    },
    indirectJobs: (state, getters) => {
      return getters.jobs.filter((job: Job) => !job.direct)
    },
    shift: (state) => (id: number) => {
      return state.shifts.byId[id]
    },
    shifts: (state, getters) => {
      return state.shifts.all.map((id: number) => getters.shift(id))
    },
    workforce: (state, getters) => {
      return state.workforce.map((userId: number) => state.users.byId[userId])
    },
    calendarEvent: (state) => (id: number) => {
      return state.events.byId[id]
    },
    calendarEvents: (state, getters) => {
      let colorCounter = 0
      const eventColors = [
        'blue',
        'green',
        'purple',
        'indigo',
        'orange darken-1',
        'deep-purple',
        'red',
        'light-blue',
        'yellow darken-2',
        'light-green',
        'cyan',
        'pink',
        'teal',
        'lime',
      ]
      const colorMap: {
        [key: number]: string;
      } = {} // Map job ID to color

      return state.events.all.map((eventId) => {
        const event = getters.calendarEvent(eventId)

        let color
        if (colorMap[event.job_id]) {
          color = colorMap[event.job_id]
        } else {
          color = eventColors[colorCounter % eventColors.length]
          colorMap[event.job_id] = color
          colorCounter++
        }

        return {
          name: event.site_location,
          start: new Date(event.time_begin),
          end: new Date(event.time_end),
          color,
          timed: true,
          ...event,
        }
      })
    },
    conversation: (state, _, __, rootGetters) => (id: number) => {
      return state.conversations.byId[id]
      // return resolveRelations(state.conversations.byId[id], ['messages.sender_id'], rootGetters)
    },
    conversations: (state, getters) => {
      return state.conversations.all.map((id: number) =>
        getters.conversation(id)
      )
    },
  },
  modules: {},
}

const store = new Vuex.Store<RootState>(storeConfig)

export default store

// TODO: Remove axios
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // if (error.config.hideErrorMessage) return

    let message
    const res = error.response.data

    // TODO: this is stupid, don't keep this. use custom axios config
    if (error.request.responseURL.includes('/users/me')) return

    if (res.message || res.response.error) {
      message = res.message || res.response.error
    } else {
      const errorList = error.response.data.response.errors
      message = errorList[Object.keys(errorList)[0]][0]
    }
    store.dispatch('showSnackbar', { text: message })

    return Promise.reject(error)
  }
)
