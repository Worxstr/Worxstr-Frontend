/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import VueSocketIOExt from 'vue-socket.io-extended'
import { io } from 'socket.io-client'
import { environment } from '@/services/app'
import store from '@/store'
import usersStore from '@/store/users'

export let socket: any

// Initialize a new websocket connection
export function createSocket(url = process.env.VUE_APP_API_BASE_URL) {
  if (socket) socket.disconnect()
  socket = io(url, {
    path: '/socket.io',
    reconnection: true,
    reconnectionDelay: 1000,
  })
  
  // Authenticate the socket connection when reconnecting
  socket.on('connect', () => {
    const user = usersStore.getters.me(usersStore.state)
    if (user) {
      socket.emit('sign-in', {
        fs_uniquifier: user.fs_uniquifier,
      })
    }
  })

  return socket
}

function configVueSocketIO(socket: any) {
  (VueSocketIOExt as any).install(Vue, socket, {
    store,
    actionPrefix: '',
    mutationPrefix: '',
  })
}

// When the sandbox environment changes, create a new socket connection
environment.on('baseUrlChanged', (baseUrl: any) => {
  socket = createSocket(baseUrl)
  configVueSocketIO(socket)
})
