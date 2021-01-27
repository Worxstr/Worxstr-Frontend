import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import SocketIO from "socket.io-client"
import VueSocketIO from 'vue-socket.io'

import * as VueGoogleMaps from 'vue2-google-maps'
// import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
// import 'leaflet/dist/leaflet.css';

import './assets/style.css'
import './plugins/filters.js'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDtNK7zw8XCJmgNYIZOLqveu215fekbATA',
    libraries: 'places', // This is required if you use the Autocomplete plugin
    // OR: libraries: 'places,drawing'
    // OR: libraries: 'places,drawing,visualization'
    // (as you require)
 
    /// If you want to set the version, you can do so:
    // v: '3.26',
  },
 
  /// If you intend to programmatically custom event listener code
  /// (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
  /// instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
  /// you might need to turn this on.
  // autobindAllEvents: false,
 
  /// If you want to manually install components, e.g.
  /// import {GmapMarker} from 'vue2-google-maps/src/components/marker'
  /// Vue.component('GmapMarker', GmapMarker)
  /// then disable the following:
  // installComponents: true,
})

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO(process.env.VUE_APP_API_BASE_URL, {
    path: '/socket.io'
  }),
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  },
}))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
