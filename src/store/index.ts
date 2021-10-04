/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import axios from 'axios'
import router from '../router'

import { Capacitor } from '@capacitor/core'
import { event } from 'vue-gtag'

import app from './app'
import users from './users'
import clock from './clock'
import jobs from './jobs'
import payments from './payments'
import schedule from './schedule'
import messages from './messages'

Vue.use(Vuex)

// TODO: If using capacitor production, we need to be able to determine if the user is testing or using prod database
const webUrl = process.env.VUE_APP_API_BASE_URL || window.location.origin.replace(':8080', ':5000')
const nativeUrl = process.env.NODE_ENV === 'production' ? 'https://dev.worxstr.com' : webUrl
const baseUrl = Capacitor.isNativePlatform() ? nativeUrl : webUrl

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


// TODO: Create axios config file
axios.defaults.baseURL = baseUrl
axios.defaults.withCredentials = true

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