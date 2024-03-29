/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import router from '@/router'
import { event } from 'vue-gtag'
import { baseUrl, showToast } from '@/services/app'
import { Network } from '@capacitor/network'
import * as auth from '@/services/auth'

export const api = axios.create({
  withCredentials: true,
})

export const cms = axios.create({
  baseURL: 'https://cms.worxstr.com/api',
  headers: {
    'Authorization': `Bearer ${process.env.VUE_APP_CMS_TOKEN}`,
  }
})

async function checkOnline(config: any) {
  // If user tries to perform action while offline, send a toast
  if (config.method !== 'get') {
    const status = await Network.getStatus()
    return status.connected
  }
  return true
}

function sendGtagEvent(config: any) {
  // Send Gtag event for each request
  const url = config.url?.replace(/^.*\/\/[^/]+/, '') || '' // Get url without domain
  event(url, {
    event_category: 'API request',
    event_label: url,
    value: config.url,
  })
}

function getErrorMessage(error: any): string {

  const res = error?.response?.data

  if (res?.message) {
    return res.message
  }

  if (res?.response?.error) {
    return res.response?.error
  }

  if (error.response?.data?.response?.errors) {
    const errorList = error.response.data.response.errors
    return errorList[Object.keys(errorList)[0]][0]
  }

  return 'An error has occurred.'
}

function checkLoggedIn(error: any) {
  if (error.response?.data?.login_required) {
    router.push({
      name: 'signIn',
    })
  }
}

function getAction(error: any) {
  let action
  const res = error.response?.data

  // Handle error action types that are sent by the server.
  // These actions can redirect the user to an area of the app to resolve the error.
  if (res?.actions) {
    action = {
      text: res.actions[0].action_text,
      action: () => {
        switch (res.actions[0].name) {
          case 'AUTHENTICATE':
            router.push({
              name: 'signIn',
            })
            break

          case 'VERIFY_BENEFICIAL_OWNERS':
            router.push({
              name: 'settings/payments',
              params: {
                verifyBeneficialOwners: 'true',
              },
            })
            break
        }
      },
    }
  }
  return action
}

export async function configureAxios(store: any) {
  
  baseUrl.set()

  api.interceptors.request.use(
    (config: any) => {
      // if (!checkOnline(config)) {
      //   showToast(store, { text: 'You are offline.' })
      //   return false
      // }
      // sendGtagEvent(config)
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )

  api.interceptors.response.use(
    (response: any) => {
      return response
    },
    (error: any) => {
      // if (error.config.hideErrorMessage) return

      // TODO: this is stupid, don't keep this. use custom api config
      // We are ignoring an error message if we are trying to access /users/me without being logged in.
      // This request is made on app load.
      if (error.request.responseURL.includes('/users/me')) return Promise.reject(error)

      checkLoggedIn(error)
      const message = getErrorMessage(error)
      const action = getAction(error)

      showToast(store, {
        text: message,
        action,
      })

      return Promise.reject(error)
    }
  )

  const authToken = await auth.getAuthToken()
  if (authToken) {
    auth.setAuthToken(authToken)
  }
}


