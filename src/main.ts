import './class-component-hooks'
import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { io } from "socket.io-client"
import VueSocketIO from 'vue-socket.io'
import * as VueGoogleMaps from 'vue2-google-maps'
import VuetifyGoogleAutocomplete from 'vuetify-google-autocomplete'
import VueAnalytics from 'vue-analytics'
import './assets/style.css'
import './plugins/filters'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDtNK7zw8XCJmgNYIZOLqveu215fekbATA'

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
  connection: io(process.env.VUE_APP_API_BASE_URL, {
    path: '/socket.io'
  }),
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
}))

Vue.use(VueAnalytics, {
  id: 'G-B8WX7VT5ED',
  router
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
