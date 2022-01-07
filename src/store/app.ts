import { DarkPreference } from "@/util/theme"
import { miniNav } from '@/services/app'
import * as theme from '@/util/theme'
import * as notifications from '@/services/notifications'

export interface AppState {
  snackbar: {
    show: boolean
    text: string
    timeout: number
    action?: {
      text: string
      action: Function
      color?: string
    }
  }
  preferences: {
    darkMode: DarkPreference
    miniNav: boolean
    pushNotifications: boolean
  }
}

export const initialState = (): AppState => ({
  snackbar: {
    show: false,
    text: '',
    timeout: 5000,
  },
  preferences: {
    darkMode: theme.getStoredPreference(),
    miniNav: miniNav.getStoredPreference(),
    pushNotifications: false,
  }
})

const mutations = {
  SHOW_SNACKBAR(state: AppState, snackbar: any) {
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

  SET_THEME(state: AppState, theme: DarkPreference) {
    state.preferences.darkMode = theme
  },

  SET_MINI_NAV(state: AppState, mini: boolean) {
    state.preferences.miniNav = mini
  },

  SET_PUSH_NOTIFICATIONS(state: AppState, enabled: boolean) {
    state.preferences.pushNotifications = enabled
  },
}

export default {
  state: initialState(),
  mutations,
}