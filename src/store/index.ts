/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { configAxios } from '@/util/axios'

import app from './app'
import users from './users'
import clock from './clock'
import jobs from './jobs'
import payments from './payments'
import schedule from './schedule'
import messages from './messages'

Vue.use(Vuex)

configAxios()

// TODO: Figure out how to reset the state for all modules at once
// https://app.clickup.com/t/1nf09jf
/* 
RESET_STATE(state) {
  Object.assign(state, initialState())
  // Object.assign(state.messages, messagesInitialState())
}
*/

const storeConfig: StoreOptions<{}> = {
  modules: {
    app,
    users,
    clock,
    jobs,
    payments,
    schedule,
    messages,
  },
}

export const store = new Vuex.Store<{}>(storeConfig)

export default store