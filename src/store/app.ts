import { DarkPreference, getStoredPreference } from "@/util/theme"

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
    darkMode: getStoredPreference(),
    miniNav: false,
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
}

export default {
  state: initialState(),
  mutations,
}