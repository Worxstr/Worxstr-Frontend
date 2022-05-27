import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './util/vuetify'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { AppUpdate, AppUpdateAvailability } from '@robingenz/capacitor-app-update'

import './styles/style.scss'
import './util/filters'
import 'tiptap-vuetify/dist/main.css'

import VueMask from 'v-mask'
import PortalVue from 'portal-vue'
import VueChatScroll from 'vue-chat-scroll'
import GmapVue from 'gmap-vue'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'
import { TiptapVuetifyPlugin } from 'tiptap-vuetify'
import VueSanitize from 'vue-sanitize'
import VueGtag from 'vue-gtag'
import VueMasonry from 'vue-masonry-css'

import { configureDwolla } from './util/dwolla'
import { configureAxios } from './util/axios'
import { initDarkMode } from './util/theme'
import { getMe } from '@/services/users'
import { sandboxMode } from '@/services/app'
import { shouldUseSandbox } from './services/auth'

import axios from 'axios'

// TODO: Move this to environment variable
const GOOGLE_MAPS_API_KEY = 'AIzaSyDtNK7zw8XCJmgNYIZOLqveu215fekbATA'

function configurePlugins() {
  Vue.use(VueMask)
  Vue.use(PortalVue)
  Vue.use(VueChatScroll)
  Vue.use(VueSanitize)
  Vue.use(VueMasonry)

  Vue.use(VueGtag, {
    config: { id: process.env.VUE_APP_GTAG_API },
  })

  Vue.use(GmapVue, {
    load: {
      key: GOOGLE_MAPS_API_KEY,
      libraries: 'places',
    },
    installComponents: true,
  })
  Vue.use(VuetifyGoogleAutocomplete, {
    apiKey: GOOGLE_MAPS_API_KEY,
    vueGoogleMapsCompatibility: true,
  })

  Vue.use(TiptapVuetifyPlugin, {
    vuetify,
    iconsGroup: 'mdi'
  })
}

async function getUserData() {
  // Get local user data
  const storedUser = localStorage.getItem('me')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    sandboxMode.toggle(store, shouldUseSandbox(user.email))
    store.commit('SET_AUTHENTICATED_USER', user)
  }
  else {
    sandboxMode.toggle(store, sandboxMode.getStoredPreference())
  }

  try {
    // Load new user data
    await getMe(store)
  }
  catch (e) {
    // console.error(e)
  }
}

function configureBackButtonPress() {
  CapacitorApp.addListener('backButton', () => {
    window.history.back()
  })
}

async function checkUpdate() {
  if (!Capacitor.isPluginAvailable('AppUpdate')) return
  
  const appUpdateInfo = await AppUpdate.getAppUpdateInfo()
  if (appUpdateInfo.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
    store.commit('SET_UPDATE_DIALOG_VISIBLE', true)
  }
}

async function init() {
  Vue.config.productionTip = false

  configurePlugins()
  await configureAxios(store)
  await getUserData()

  new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
  }).$mount('#app')


  initDarkMode()
  await SplashScreen.hide()
  configureBackButtonPress()
  configureDwolla(store)
  checkUpdate()
}

init()

