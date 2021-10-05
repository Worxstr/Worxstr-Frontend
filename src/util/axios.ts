/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import router from '@/router'
import { event } from 'vue-gtag'
import { showToast } from '@/services/app'

const productionUrl = 'https://api.worxstr.com'
const sandboxUrl = 'https://dev.worxstr.com'
const localUrl = process.env.VUE_APP_API_BASE_URL || window.location.origin.replace(':8080', ':5000')

export function setBaseUrl(sandbox = false) {
  const webProdUrl = sandbox ? sandboxUrl : productionUrl
  const baseUrl = process.env.NODE_ENV === 'production' ? webProdUrl : localUrl

  axios.defaults.baseURL = baseUrl
}

export function toggleSandbox(sandbox: boolean) {
  setBaseUrl(sandbox)
}

export function configAxios({ commit }: any) {
  setBaseUrl()
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
      } else if (error.response?.data?.response?.errors) {
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

      // Handle error action types that are sent by the server.
      // These actions can redirect the user to an area of the app to resolve the error.
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

      showToast({ commit }, {
        text: message,
        action
      })

      return Promise.reject(error)
    }
  )
}