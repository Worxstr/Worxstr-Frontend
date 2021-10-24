import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './util/vuetify'
import { App as CapacitorApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'

import './styles/style.scss'
import './util/filters'

import VueMask  from 'v-mask'
import PortalVue from 'portal-vue'
import VueChatScroll from 'vue-chat-scroll'
import VueSocketIOExt from 'vue-socket.io-extended'
import socket from '@/util/socket-io'
import * as VueGoogleMaps from 'vue2-google-maps'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'
import VueGtag from 'vue-gtag'
import { configureDwolla } from './util/dwolla'
import { configureAxios } from './util/axios'
import { initDarkMode } from './util/theme'
import { getAuthenticatedUser } from '@/services/users'
import { sandboxMode } from '@/services/app'
import { shouldUseSandbox } from './services/auth'

// TODO: Move this to environment variable
const GOOGLE_MAPS_API_KEY = 'AIzaSyDtNK7zw8XCJmgNYIZOLqveu215fekbATA'

Vue.use(VueMask)
Vue.use(PortalVue)
Vue.use(VueChatScroll)

Vue.use(VueGoogleMaps, {
  load: {
    key: GOOGLE_MAPS_API_KEY,
    libraries: 'places',
  },
})
Vue.use(VuetifyGoogleAutocomplete, {
  apiKey: GOOGLE_MAPS_API_KEY,
  vueGoogleMapsCompatibility: true,
})

Vue.use(VueSocketIOExt, socket, {
  store,
  actionPrefix: '',
  mutationPrefix: '',
})

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_API },
})

Vue.config.productionTip = false

async function getUserData() {
  // Get local user data
  const storedUser = localStorage.getItem('authenticatedUser')
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
    await getAuthenticatedUser(store)
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

async function init() {
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
}

init()

