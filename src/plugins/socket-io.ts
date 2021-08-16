import { io } from 'socket.io-client'

const socket = io(process.env.VUE_APP_API_BASE_URL, {
  path: '/socket.io'
})

export default socket