/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'

import * as app from './app'
import * as users from './users'
import * as organizations from './organizations'
import * as jobs from './jobs'
import * as shifts from './shifts'
import * as payments from './payments'
import * as schedule from './schedule'
import * as messages from './messages'

Vue.use(Vuex)

// TODO: Find standardized way to normalize data, perhaps with this library:
// https://github.com/paularmstrong/normalizr

interface RootState {
  app: app.AppState;
  users: users.UsersState;
  organizations: organizations.OrganizationsState;
  jobs: jobs.JobsState;
  shifts: shifts.ShiftsState;
  payments: payments.PaymentsState;
  schedule: schedule.ScheduleState;
  messages: messages.MessagesState;
}

const storeConfig: StoreOptions<RootState> = {
  mutations: {
    RESET_STATE(state) {
      Object.assign(state.app, app.initialState())
      Object.assign(state.users, users.initialState())
      Object.assign(state.organizations, organizations.initialState())
      Object.assign(state.jobs, jobs.initialState())
      Object.assign(state.shifts, shifts.initialState())
      Object.assign(state.payments, payments.initialState())
      Object.assign(state.schedule, schedule.initialState())
      Object.assign(state.messages, messages.initialState())
    }
  },
  modules: {
    app: app.default,
    users: users.default,
    organizations: organizations.default,
    jobs: jobs.default,
    shifts: shifts.default,
    payments: payments.default,
    schedule: schedule.default,
    messages: messages.default,
  },
}

export const store = new Vuex.Store<RootState>(storeConfig)

export default store