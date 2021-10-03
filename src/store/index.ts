/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import axios from 'axios'
import router from '../router'

import { Capacitor } from '@capacitor/core'
import { event } from 'vue-gtag'

import { defaultRoute } from '@/definitions/User'
import { DarkPreference, getStoredPreference } from '@/util/theme'

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

axios.defaults.baseURL = baseUrl
axios.defaults.withCredentials = true

export interface RootState {
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
  },
  getters: {
    // TODO: Transform this and add labels, separated by day of week

  },
  modules: {
    users,
    clock,
    jobs,
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
