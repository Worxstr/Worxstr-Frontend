import Vue from 'vue'
import { io } from 'socket.io-client'
import { environment } from '@/services/app'
import store from '@/store'
import VueSocketIOExt from 'vue-socket.io-extended'

export let socket: any

// Initialize a new websocket connection
export function createSocket(url = process.env.VUE_APP_API_BASE_URL) {
  return socket = io(url, {
    path: '/socket.io'
  })
}

function configVueSocketIO(socket: any) {
  (VueSocketIOExt as any).install(Vue, socket, {
    store,
    actionPrefix: '',
    mutationPrefix: '',
  })
  console.log(Vue.prototype.$socket)
}

// When the sandbox environment changes, create a new socket connection
environment.on('baseUrlChanged', (baseUrl: any) => {
  socket = createSocket(baseUrl)
  configVueSocketIO(socket)
})
