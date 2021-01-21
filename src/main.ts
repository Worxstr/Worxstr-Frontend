import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import SocketIO from "socket.io-client"
import VueSocketIO from 'vue-socket.io'
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import './assets/style.css'
import './plugins/filters.js'
import 'leaflet/dist/leaflet.css';

Vue.component('l-map', LMap);
Vue.component('l-tile-layer', LTileLayer);
Vue.component('l-marker', LMarker);

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
