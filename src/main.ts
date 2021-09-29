import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { io } from 'socket.io-client'
import { App as CapacitorApp } from '@capacitor/app'

import './styles/style.scss'
import './plugins/filters'

import VueMask  from 'v-mask'
import PortalVue from 'portal-vue'
import VueChatScroll from 'vue-chat-scroll'
import VueSocketIO from 'vue-socket.io'
import * as VueGoogleMaps from 'vue2-google-maps'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'
import VueGtag from 'vue-gtag'
import { configureDwolla } from './plugins/dwolla'
import { initDarkMode } from './plugins/theme'

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

Vue.use(
  new VueSocketIO({
    debug: true,
    connection: io(process.env.VUE_APP_API_BASE_URL, {
      path: '/socket.io',
    }),
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_',
    },
  })
)

Vue.use(VueGtag, {
  config: { id: process.env.VUE_APP_GTAG_API },
})

Vue.config.productionTip = false

async function getUserData() {
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
}

function promptSSN() {
  // If SSN isn't set, need_info flag will be true. Prompt user to enter SSN
  const user = store.state.authenticatedUser
  if (user && user.contractor_info?.need_info) {
    store.dispatch('showSnackbar', {
      text: `You haven't set your Social Security number.`,
      action: () => {
        router.push({
          name: 'settings',
          params: {
            openSSNDialog: 'true',
          },
        })
      },
      actionText: 'Set SSN',
    })
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
  promptSSN()
  configureBackButtonPress()
  configureDwolla()
}

init()

