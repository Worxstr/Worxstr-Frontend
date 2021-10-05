import * as theme from '@/util/theme'

function getStoredPreference(localStorageItem: string, defaultVal: any) {
  return JSON.parse(window.localStorage.getItem(localStorageItem) || defaultVal)
}

export function showToast({ commit }: any, snackbar: any) {
  commit('SHOW_SNACKBAR', snackbar)
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
    return getStoredPreference('miniNav', 'false')
  },

  toggle({ commit }: any, mini?: boolean) {

    console.log('toggling mini', mini, this.getStoredPreference())

    if (mini === undefined) mini = !this.getStoredPreference()
    window.localStorage.setItem('miniNav', JSON.stringify(mini))
    commit('SET_MINI_NAV', mini)
  },
}
