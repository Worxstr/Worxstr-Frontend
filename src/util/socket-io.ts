import Vue from 'vue'
import VueSocketIOExt from 'vue-socket.io-extended'
import store from '@/store'
import { io } from 'socket.io-client'
import { baseUrl, environment } from '@/services/app'

// Initialize a new websocket connection
function createSocket(url: string) {
  url = url.replace('https', 'wss')
  url = url.replace('http', 'ws')  
  const socket =  io(url, {
    path: '/socket.io'
  })

  return socket
}

export let socket: any

// Configure vue socketio to use the socket object
function configureVueSocketio() {
  console.log('configuring vue socketio', socket)
  Vue.use(VueSocketIOExt, socket, {
    store,
    actionPrefix: '',
    mutationPrefix: '',
  })
}

// When the sandbox environment changes, create a new socket connection
environment.on('baseUrlChanged', (baseUrl: any) => {
  console.log('base url changed: ', baseUrl)
  socket = createSocket(baseUrl)
  configureVueSocketio()
})