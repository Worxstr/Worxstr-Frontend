/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import axios from 'axios'
import router from '../router'

import { Capacitor } from '@capacitor/core'
import * as Plaid from '@/plugins/plaid'
import { event } from 'vue-gtag'

import { normalizeRelations, resolveRelations } from '../plugins/helpers'
import { Conversation } from '@/definitions/Messages'
import { User, defaultRoute } from '@/definitions/User'
import { ClockEvent } from '@/definitions/Clock'
import { Timecard, FundingSource, Transfer } from '@/definitions/Payments'
import { Job, Shift } from '@/definitions/Job'
import { CalendarEvent } from '@/definitions/Schedule'

Vue.use(Vuex)

// axios.defaults.baseURL = ''
axios.defaults.withCredentials = true


const baseUrl = Capacitor.isNativePlatform()
  ? 'https://dev.worxstr.com'
  : process.env.VUE_APP_API_BASE_URL

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
  payments: {
    balance: {
      value: number | null;
      currency: string;
      location: string | null;
    };
    fundingSources: {
      all: string[];
      byLocation: {
        [key: string]: FundingSource[];
      };
    };
    timecards: {
      all: number[];
      byId: {
        [key: number]: Timecard;
      };
    };
    transfers: {
      all: string[];
      byId: {
        [key: string]: Transfer;
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

const initialState = (): RootState => ({
  snackbar: {
    show: false,
    text: '',
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
  payments: {
    balance: {
      value: null,
      currency: 'USD',
      location: null,
    },
    fundingSources: {
      all: [],
      byLocation: {},
    },
    timecards: {
      all: [],
      byId: {},
    },
    transfers: {
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
    RESET_STATE(state, payload) {
      Object.assign(state, initialState())
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
    SET_BALANCE(state, { value, currency, location }) {
      state.payments.balance = {
        value: parseFloat(value),
        currency,
        location,
      }
    },
    ADD_TO_BALANCE(state, amount) {
      state.payments.balance.value += amount
    },
    ADD_TIMECARD(state, timecard) {
      Vue.set(state.payments.timecards.byId, timecard.id, timecard)
      if (!state.payments.timecards.all.includes(timecard.id))
        state.payments.timecards.all.push(timecard.id)
    },
    REMOVE_TIMECARD(state, timecardId) {
      Vue.delete(state.payments.timecards.byId, timecardId)
      Vue.delete(
        state.payments.timecards.all,
        state.payments.timecards.all.indexOf(timecardId)
      )
    },
    ADD_FUNDING_SOURCE(state, fundingSource: FundingSource) {
      Vue.set(
        state.payments.fundingSources.byLocation,
        fundingSource._links.self.href,
        {
          ...state.payments.fundingSources.byLocation[fundingSource._links.self.href],
          ...fundingSource,
        }
      )
      if (!state.payments.fundingSources.all.includes(fundingSource._links.self.href))
        state.payments.fundingSources.all.push(fundingSource._links.self.href)
    },
    REMOVE_FUNDING_SOURCE(state, fundingSourceLocation: string) {
      Vue.delete(
        state.payments.fundingSources.byLocation,
        fundingSourceLocation
      )
      Vue.delete(
        state.payments.fundingSources.all,
        state.payments.fundingSources.all.findIndex(
          (location) => location == fundingSourceLocation
        )
      )
    },
    ADD_TRANSFER(state, { transfer, prepend }) {
      Vue.set(state.payments.transfers.byId, transfer.id, {
        ...state.payments.transfers.byId[transfer.id],
        ...transfer
      })
      if (!state.payments.transfers.all.includes(transfer.id))
        if (prepend) state.payments.transfers.all.unshift(transfer.id)
        else state.payments.transfers.all.push(transfer.id)
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
      if (!state.managers[type].some((m: User) => m.id == manager.id)) {
        state.managers[type].push(manager)
      }
    },
    SET_NEXT_SHIFT(state, shift: Shift) {
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
    async signIn({ commit, dispatch }, credentials) {
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${baseUrl}/auth/login`,
          params: {
            include_auth_token: true,
          },
          data: {
            ...credentials,
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
      console.log(`loading user ${userId}`)
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/users/${userId}`,
      })
      commit('ADD_USER', data)
    },

    async updateContractor({ commit }, { contractorInfo, userId }) {
      const { data } = await axios({
        method: 'PATCH',
        url: `${baseUrl}/users/contractors/${userId}`,
        data: contractorInfo,
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

    async clockIn({ commit, state }, { code }) {
      try {
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
      } catch (err) {
        return err
      }
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

    async loadTimecards({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/payments/timecards`,
      })
      data.timecards.forEach((timecard: Timecard) => {
        // TODO: Normalize nested data
        commit('ADD_TIMECARD', timecard)
      })
      return data
    },

    async updateTimecard({ commit }, { timecardId, events }) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/timecards/${timecardId}`,
        data: {
          changes: events,
        },
      })
      commit('ADD_TIMECARD', data.timecard)
      return data
    },

    async denyPayments({ commit }, timecardIds) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/deny`,
        data: {
          timecard_ids: timecardIds,
        },
      })
      timecardIds.forEach((timecardId: number) => {
        // TODO: Normalize nested data
        commit('REMOVE_TIMECARD', timecardId)
      })
      return data
    },

    async completePayments({ commit }, timecardIds) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/complete`,
        data: {
          timecard_ids: timecardIds
        },
      })
      timecardIds.forEach((timecardId: number) => {
        commit('REMOVE_TIMECARD', timecardId)
      })
      data.transfers.forEach((obj: { transfer: Transfer }) => {
        commit('ADD_TRANSFER', { transfer: obj.transfer, prepend: true })
      })
    },

    async loadBalance({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/payments/balance`,
      })
      commit('SET_BALANCE', {
        ...data.balance,
        location: data.location,
      })
    },

    async openPlaidLink(_context, name) {
      return await Plaid.openPlaidLink(name)
    },

    async getPlaidLinkToken() {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/payments/plaid-link-token`,
      })
      return data.token
    },

    async loadFundingSources({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/payments/accounts`,
      })
      data.funding_sources.forEach((source: FundingSource) => {
        commit('ADD_FUNDING_SOURCE', source)
      })
      return data
    },

    async addPlaidFundingSource(_context, { name, publicToken, accountId }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/payments/accounts`,
        data: {
          name,
          public_token: publicToken,
          account_id: accountId,
        },
      })
      this.commit('ADD_FUNDING_SOURCE', data)
      return data
    },

    async updateFundingSource({ commit }, fundingSource: FundingSource) {
      const { data } = await axios({
        method: 'PUT',
        url: `${baseUrl}/payments/accounts`,
        data: fundingSource,
      })
      commit('ADD_FUNDING_SOURCE', data)
      return data
    },

    async removeFundingSource({ commit }, fundingSourceLocation: string) {
      const { data } = await axios({
        method: 'DELETE',
        url: `${baseUrl}/payments/accounts`,
        data: {
          location: fundingSourceLocation,
        },
      })
      commit('REMOVE_FUNDING_SOURCE', fundingSourceLocation)
      return data
    },

    async addToBalance({ commit, dispatch }, transfer) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/payments/balance/add`,
        data: transfer,
      })
      commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
      dispatch('showSnackbar', { text: 'Hang tight, your transfer is being processed.' })
      return data
    },

    async removeFromBalance({ commit, dispatch }, transfer) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/payments/balance/remove`,
        data: transfer,
      })
      commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
      commit('ADD_TO_BALANCE', -transfer.amount)
      dispatch('showSnackbar', { text: 'Hang tight, your transfer is being processed.' })
      return data
    },

    async loadTransfers({ commit }, { limit=10, offset=0 } = {}) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/payments/transfers`,
        params: {
          limit,
          offset,
        }
      })
      data.transfers.forEach((transfer: Transfer) => {
        commit('ADD_TRANSFER', { transfer })
      })
      return data
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

    async loadCalendarEvents({ commit }, { start, end }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/calendar`,
        params: {
          date_begin: start,
          date_end: end,
        },
      })
      data.events.forEach((event: CalendarEvent) => commit('ADD_EVENT', event))
      return data
    },

    async loadConversations({ commit }) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/conversations`,
      })
      data.conversations.forEach((conversation: Conversation) => {
        commit('ADD_CONVERSATION', { conversation })
      })
      return data
    },

    async loadConversation({ commit }, conversationId) {
      const { data } = await axios({
        method: 'GET',
        url: `${baseUrl}/conversations/${conversationId}`,
      })
      commit('ADD_CONVERSATION', { conversation: data.conversation })
      return data
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
      return data
    },

    async sendMessage({ commit }, { message, conversationId }) {
      const { data } = await axios({
        method: 'POST',
        url: `${baseUrl}/conversations/${conversationId}/messages`,
        data: message,
      })
      commit('ADD_MESSAGE', { message: data.message, conversationId })
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
    timecard: (state) => (id: number) => {
      return state.payments.timecards.byId[id]
    },
    timecards: (state, getters) => {
      return state.payments.timecards.all.map((id) => getters.timecard(id))
    },
    timecardsByIds: (_state, getters) => (timecardIds: number[]) => {
      return timecardIds.map((id) => getters.timecard(id))
    },
    fundingSource: (state) => (location: string) => {
      return state.payments.fundingSources.byLocation[location]
    },
    fundingSources: (state, getters) => {
      return state.payments.fundingSources.all.map((location) => getters.fundingSource(location))
    },
    transfer: (state) => (transferId: string) => {
      return state.payments.transfers.byId[transferId]
    },
    transfers: (state, getters) => {
      return state.payments.transfers.all.map((transferId) => getters.transfer(transferId))
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
      return state.shifts.all.map((id: number) => getters.shift(id))
    },
    workforce: (state) => {
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
    conversation: (state,/*  _, __, _rootGetters */) => (id: number) => {
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

axios.interceptors.request.use(config => {
  const url = config.url?.replace(/^.*\/\/[^/]+/, '') || '' // Get url without domain
  console.log(url)
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
