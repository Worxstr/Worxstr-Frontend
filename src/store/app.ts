import { DarkPreference } from "@/util/theme"
import { miniNav, darkMode } from '@/services/app'

export interface AppState {
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

export const initialState = (): AppState => ({
  snackbar: {
    show: false,
    text: '',
    timeout: 5000,
  },
  preferences: {
    darkMode: darkMode.getStoredPreference(),
    miniNav: miniNav.getStoredPreference(),
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
  }
}

export default {
  state: initialState(),
  mutations,
}