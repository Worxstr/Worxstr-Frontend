import { configureDwolla } from '@/util/dwolla'
import * as theme from '@/util/theme'
import { api } from '@/util/axios'

function getStoredPreference(localStorageItem: string, defaultVal: any) {
  return JSON.parse(window.localStorage.getItem(localStorageItem) || JSON.stringify(defaultVal)) || defaultVal
}

function setStoredPreference(localStorageItem: string, val: any) {
  return window.localStorage.setItem(localStorageItem, JSON.stringify(val))
}

export function showToast({ commit }: any, snackbar: any) {
  commit('SHOW_SNACKBAR', snackbar)
}

/* 
  Functions for setting and determining the API url to use, including sandbox environment
*/
const productionUrl = 'https://api.worxstr.com'
const sandboxUrl = 'https://dev.worxstr.com'
const localUrl = process.env.VUE_APP_API_BASE_URL || window.location.origin.replace(':8080', ':5000')

export const baseUrl = {
  set(sandbox = false) {
    const webProdUrl = sandbox ? sandboxUrl : productionUrl
    const baseUrl = process.env.NODE_ENV === 'production' ? webProdUrl : localUrl
    
    api.defaults.baseURL = baseUrl
    return baseUrl
  },
  
  get() {
    return api.defaults.baseURL
  },
}

export const sandboxMode = {
  toggle({ commit }: any, sandbox: boolean) {
    baseUrl.set(sandbox)
    const useDwollaSandbox = process.env.NODE_ENV === 'production' ? sandbox : true
    configureDwolla({ commit }, useDwollaSandbox)
    setStoredPreference('useSandbox', sandbox)
  },

  getStoredPreference() {
    return getStoredPreference('useSandbox', false)
  }
}

export const darkMode = {
  getStoredPreference() {
    return theme.getStoredPreference()
  },

  async set({ commit }: any, pref: theme.DarkPreference) {
    theme.setTheme(pref)
    commit('SET_THEME', pref);
  },
}

export const miniNav = {
  getStoredPreference() {
    return getStoredPreference('miniNav', false)
  },

  toggle({ commit }: any, mini?: boolean) {
    if (mini === undefined) mini = !this.getStoredPreference()
    setStoredPreference('miniNav', mini)
    commit('SET_MINI_NAV', mini)
  },
}
