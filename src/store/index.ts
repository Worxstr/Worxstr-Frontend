/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import axios from 'axios'
import router from '../router'

import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'
import { event } from 'vue-gtag'

import { normalizeRelations, resolveRelations } from '../util/helpers'
import { User, defaultRoute } from '@/definitions/User'
import { ClockEvent } from '@/definitions/Clock'
import { Job, Shift } from '@/definitions/Job'
import { DarkPreference, getStoredPreference } from '@/util/theme'

import payments from './payments'
import schedule from './schedule'
import messages from './messages'

Vue.use(Vuex)

// TODO: If using capacitor production, we need to be able to determine if the user is testing or using prod database
const webUrl = process.env.VUE_APP_API_BASE_URL || window.location.origin.replace(':8080', ':5000')
const nativeUrl = process.env.NODE_ENV === 'production' ? 'https://dev.worxstr.com' : webUrl
const baseUrl = Capacitor.isNativePlatform() ? nativeUrl : webUrl

axios.defaults.baseURL = baseUrl
axios.defaults.withCredentials = true

interface RootState {
  snackbar: {
    show: boolean;
    text: string;
    timeout: number;
    action?: {
      text: string;
      action: Function;
      color?: string;
    };
  };
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
  preferences: {
    darkMode: DarkPreference;
    miniNav: boolean;
  };
}

const initialState = (): RootState => ({
  snackbar: {
    show: false,
    text: '',
    timeout: 5000,
  },
  authenticatedUser: null,
  userLocation: null,
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
  preferences: {
    darkMode: getStoredPreference(),
    miniNav: false,
  }
})

const storeConfig: StoreOptions<RootState> = {
  state: initialState(),
  mutations: {
    SHOW_SNACKBAR(state, snackbar) {
      if (snackbar.action)
        snackbar.action.color = snackbar.action.color || 'accent'
      else
        delete state.snackbar.action

      state.snackbar = {
        ...state.snackbar,
        ...snackbar,
        show: true,
      }
    },
    RESET_STATE(state) {
      Object.assign(state, initialState())
      // Object.assign(state.messages, messagesInitialState())
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
    REMOVE_USER(state, userId) {
      Vue.delete(state.users.byId, userId)
      state.users.all = state.users.all.filter(id => id !== userId)
      Vue.delete(state.workforce, state.workforce.indexOf(userId))
    },
    SET_USER_LOCATION(state, { lat, lng, accuracy }) {
      state.userLocation = { lat, lng, accuracy }
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
    ADD_JOB(state, job: Job) {
      Vue.set(state.jobs.byId, job.id, {
        ...state.jobs.byId[job.id],
        ...job,
        direct: (
          state.authenticatedUser?.id === job.organization_manager_id ||
          state.authenticatedUser?.id === job.contractor_manager_id
        )
      })
      if (!state.jobs.all.includes(job.id)) state.jobs.all.push(job.id)
    },
    REMOVE_JOB(state, jobId: number) {
      Vue.delete(state.jobs.byId, jobId)
      Vue.delete(
        state.jobs.all,
        state.jobs.all.findIndex((id) => id == jobId)
      )
    },
    ADD_WORKFORCE_MEMBER(state, userId: number) {
      if (!state.workforce.includes(userId)) {
        state.workforce.push(userId)
      }
    },
    ADD_MANAGER(state, { type, manager }: { type: string; manager: User }) {
      // TODO: Normalize this to users list, and keep only the user id for each manager object
      if (!state.managers[type].some((m: User) => m.id == manager.id)) {
        state.managers[type].push(manager)
      }
    },
    SET_NEXT_SHIFT(state, shift: Shift) {
      state.shifts.next = shift
    },
    ADD_SHIFT(state, { shift, jobId }) {
      state.jobs.byId[jobId].shifts.push(shift)
      // TODO: Flatten shift data from jobs
      // Vue.set(state.shifts.byId, shift.id, shift)
      // if (!state.shifts.all.includes(shift.id))
      //   state.shifts.all.push(shift.id)
    },
    REMOVE_SHIFT(state, { jobId, shiftId }) {
      state.jobs.byId[jobId].shifts = state.jobs.byId[jobId].shifts.filter(
        (shift) => shift.id != shiftId
      )
    },
  },
  actions: {
    showSnackbar({ commit }, snackbar) {
      commit('SHOW_SNACKBAR', snackbar)
    },
    async contactSales({ dispatch }, { form, type }) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/contact/${type}`,
          data: form
        })
        dispatch('showSnackbar', { text: "Thanks! We will get back to you shortly." })
        return data
      }
      catch (err) {
        return err
      }
    },
    async signIn({ commit, dispatch }, { email, password }) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          params: {
            include_auth_token: true,
          },
          data: {
            email,
            password,
            remember_me: true,
          },
        })
        // const authToken = data.response?.user?.authentication_token
        // Use authentication token in subsequent requests
        // axios.defaults.headers.common['Authentication-Token'] = authToken
        // Set token in secure storage on iOS/Android
        // await SecureStoragePlugin.set({
        //   key: 'authToken',
        //   value: authToken
        // })
        await dispatch('getAuthenticatedUser')
        router.push({ name: defaultRoute() })
        return data

      } catch (err) {
        commit('UNSET_AUTHENTICATED_USER')
        return err
      }
    },

    /*
      accountType: 'contractor' | 'org'
      dwollaCustomerUrl: Customer url returned after Dwolla account registration
      dwollaAuthToken: Auth token used for Dwolla account registration
    */
    async signUp(
      { dispatch },
      { accountType, customer_url, password, manager_reference }
    ) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/sign-up/${accountType}`,
          // headers: {
          //   'Authorization': `Bearer ${dwollaAuthToken}`
          // },
          data: {
            customer_url,
            password,
            manager_reference,
          },
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
      commit('RESET_STATE')
      router.push({ name: 'home' })
    },

    async resetPassword(_context, email) {
      await axios({
        method: 'POST',
        url: `${baseUrl}/auth/reset`,
        data: {
          email,
        },
      })
    },

    async confirmEmail(_context, token) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/auth/confirm-email`,
        data: {
          token
        }
      })
      await new Promise(resolve => setTimeout(resolve, 1000))
      return data
    },
    
    async resendEmailConfirmation({ dispatch }, email) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/auth/resend-email`,
        data: {
          email
        }
      })
      dispatch('showSnackbar', { text: 'Confirmation email resent.' })
      return data
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
      commit('ADD_USER', data)
    },

    async getUserLocation({ commit }) {
      const { coords } = await Geolocation.getCurrentPosition()
      const userLocation = {
        lat: coords.latitude,
        lng: coords.longitude,
      }
      commit('SET_USER_LOCATION', userLocation)
      return userLocation
    },

    async locationPermissionGranted() {
      const permissions = await Geolocation.checkPermissions()
      return permissions.location === 'granted'
    },

    async updateContractor({ commit }, { newFields, userId }) {
      const { data } = await axios({
        method: 'PATCH',
        url: `${baseUrl}/users/contractors/${userId}`,
        data: newFields,
      })
      commit('ADD_USER', data.event)
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

    async clockIn({ commit, state }, code) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/clock/clock-in`,
        params: {
          shift_id: state.shifts.next?.id,
        },
        data: {
          code,
        },
      })
      commit('ADD_CLOCK_EVENT', data.event)
      commit('CLOCK_IN')
      return data
    },

    async clockOut({ commit, state }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/clock/clock-out`,
        params: {
          shift_id: state.shifts.next?.id,
        },
      })
      commit('ADD_CLOCK_EVENT', data.event)
      commit('CLOCK_OUT')
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

    async loadManagers({ commit, state }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/jobs/managers`,
        params: {
          manager_id:
            state.authenticatedUser?.manager_id || state.authenticatedUser?.id,
        },
      })
      data.contractor_managers.forEach((m: User) => {
        commit('ADD_MANAGER', { type: 'contractor', manager: m })
      })
      data.organization_managers.forEach((m: User) => {
        commit('ADD_MANAGER', { type: 'organization', manager: m })
      })
      return data
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
      return data
    },

    async loadJob({ commit }, jobId) {
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
      return data
    },

    async createJob({ commit }, job) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/jobs`,
        data: job,
      })
      commit('ADD_JOB', data.job)
      return data
    },

    async updateJob({ commit }, job) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/jobs/${job.id}`,
        data: job,
      })
      commit('ADD_JOB', data.job)
      return data
    },

    async closeJob({ commit }, jobId) {
      await axios({
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
        params: { job_id: jobId },
      })
      data.shifts.forEach((shift: Shift) => {
        commit('ADD_SHIFT', { shift, jobId })
      })
      return data
    },

    async updateShift({ commit }, shift) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/shifts/${shift.id}`,
        data: { shift },
      })
      commit('REMOVE_SHIFT', { shiftId: shift.id, jobId: data.shift.job_id })
      commit('ADD_SHIFT', { shift: data.shift, jobId: data.shift.job_id })
      return data
    },

    async deleteShift({ commit }, { shiftId, jobId }) {
      await axios({
        method: 'DELETE',
        url: `${baseUrl}/shifts/${shiftId}`,
      })
      commit('REMOVE_SHIFT', { shiftId, jobId })
    },

    async loadWorkforce({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/organizations/me/users`,
      })
      data.users.forEach((u: User) => {
        commit('ADD_USER', u)
        commit('ADD_WORKFORCE_MEMBER', u.id)
      })
      return data
    },

    async addManager({ commit }, manager) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/users/add-manager`,
        data: manager,
      })
      commit('ADD_USER', data)
      commit('ADD_WORKFORCE_MEMBER', data.id)
      return data
    },

    async deleteUser({ commit }, userId) {
      await axios({
        method: 'DELETE',
        url: `${baseUrl}/users/${userId}`,
      })
      commit('REMOVE_USER', userId)
    },

    async addContractor({ commit }, contractor) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/users/add-contractor`,
        data: contractor,
      })
      commit('ADD_USER', data)
      commit('ADD_WORKFORCE_MEMBER', data.id)
      return data
    },

    async updatePassword(_context, newPassword) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/users/reset-password`,
        data: {
          password: newPassword,
        },
      })
      return data
    },
    async setSSN({ commit }, ssn) {
      await axios({
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
    directJobs: (_state, getters) => {
      return getters.jobs.filter((job: Job) => job.direct)
    },
    indirectJobs: (_state, getters) => {
      return getters.jobs.filter((job: Job) => !job.direct)
    },
    shift: (state) => (id: number) => {
      return state.shifts.byId[id]
    },
    shifts: (state, getters) => {
      return state .shifts.all.map((id: number) => getters.shift(id))
    },
    workforce: (state) => {
      return state.workforce.map((userId: number) => state.users.byId[userId])
    },
  },
  modules: {
    payments,
    schedule,
    messages,
  },
}

const store = new Vuex.Store<RootState>(storeConfig)

export default store

axios.interceptors.request.use(config => {
  const url = config.url?.replace(/^.*\/\/[^/]+/, '') || '' // Get url without domain
  event(url, {
    event_category: 'API request',
    event_label: url,
    value: config.url
  })
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // if (error.config.hideErrorMessage) return

    let message
    const res = error.response?.data

    // TODO: this is stupid, don't keep this. use custom axios config
    if (error.request.responseURL.includes('/users/me')) return

    if (res && (res.message || res.response.error)) {
      message = res.message || res.response.error
    } else {
      const errorList = error.response.data.response.errors
      message = errorList[Object.keys(errorList)[0]][0]
    }

    // When we receive a 401 from the API, send them to the sign in page
    // TODO: This can lead to unexpected results, like if they get a 401 after
    // TODO: entering an incorrect consultant code. We can remove this after we have
    // TODO: persistant auth working correctly.
    if (error.response.data?.login_required) {
      router.push({
        name: 'signIn',
      }) 
    }
    
    let action

    if (res.actions) {
      action = {
        text: res.actions[0].action_text,
        action: () => {
          switch (res.actions[0].name) {
            case 'AUTHENTICATE':
              router.push({
                name: 'signIn'
              })
              break

            case 'VERIFY_BENEFICIAL_OWNERS':
              router.push({
                name: 'settings/payments',
                params: {
                  verifyBeneficialOwners: 'true',
                }
              })
              break
          }
        },
      }
    }

    store.dispatch('showSnackbar', {
      text: message,
      action
    })

    return Promise.reject(error)
  }
)
