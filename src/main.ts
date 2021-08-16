import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
<<<<<<< Updated upstream
import { io } from "socket.io-client"
=======
import socket from './plugins/socket-io'
import { App as CapacitorApp } from '@capacitor/app'
>>>>>>> Stashed changes

import './styles/style.scss'
import './plugins/filters'

import VueMask from 'v-mask'
import PortalVue from 'portal-vue'
import VueChatScroll from 'vue-chat-scroll'
import VueSocketIO from 'vue-socket.io'
import * as VueGoogleMaps from 'vue2-google-maps'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'
import VueGtag from "vue-gtag"

const GOOGLE_MAPS_API_KEY = 'AIzaSyDtNK7zw8XCJmgNYIZOLqveu215fekbATA'

Vue.use(PortalVue)
Vue.use(VueMask)
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

Vue.use(new VueSocketIO({
  debug: true,
  connection: socket,
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
}))

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_API }
});

Vue.config.productionTip = false

function initDarkMode() {
  const userPrefDarkMode = window.localStorage.getItem("darkMode")
  const darkMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

  if (userPrefDarkMode == "System default") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    darkMediaQuery.addEventListener("change", (e) => {
      vuetify.framework.theme.dark = !vuetify.framework.theme.dark
    });

    if (darkMediaQuery.matches) {
      setTimeout(() => (vuetify.framework.theme.dark = true), 0)
    }
  } else {
    vuetify.framework.theme.dark = userPrefDarkMode == "Dark"
  }
}

function promptSSN() {
  // If SSN isn't set, need_info flag will be true. Prompt user to enter SSN
  const user = store.state.authenticatedUser
  if (user && user.contractor_info?.need_info) {
    store.dispatch("showSnackbar", {
      text: `You haven't set your Social Security number.`,
      action: () => {
        router.push({
          name: "settings",
          params: {
            openSSNDialog: "true",
          },
        })
      },
      actionText: "Set SSN",
    })
  }
}

async function init() {

  // Get local user data
  const storedUser = localStorage.getItem('authenticatedUser')
  if (storedUser) {
    store.commit('SET_AUTHENTICATED_USER', JSON.parse(storedUser))
  }

  try {
    // Load new user data
    await store.dispatch('getAuthenticatedUser')
  }
  catch (e) {
    console.error(e)
  }

  new Vue({
    router,
    store,
    vuetify,
    render: h => h(App)
  }).$mount('#app')

  initDarkMode()
  promptSSN()
}

init()