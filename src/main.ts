import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './util/vuetify'
import { App as CapacitorApp } from '@capacitor/app'

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
import { initDarkMode } from './util/theme'
import { getAuthenticatedUser } from '@/services/users'
import { sandboxMode } from '@/services/app'

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
  actionPrefix: 'SOCKET_',
  mutationPrefix: 'SOCKET_',
})

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_API },
})

Vue.config.productionTip = false

async function getUserData() {
  sandboxMode.toggle(store, sandboxMode.getStoredPreference())

  // Get local user data
  const storedUser = localStorage.getItem('authenticatedUser')
  if (storedUser) {
    store.commit('SET_AUTHENTICATED_USER', JSON.parse(storedUser))
  }

  try {
    // Load new user data
    await getAuthenticatedUser(store)
  }
  catch (e) {
    console.error(e)
  }
}

function configureBackButtonPress() {
  CapacitorApp.addListener('backButton', () => {
    window.history.back()
  })
}

async function init() {
  await getUserData()

  new Vue({
    router,
    store,
    vuetify,
    render: (h) => h(App),
  }).$mount('#app')

  initDarkMode()
  configureBackButtonPress()
  configureDwolla(store)
}

init()

