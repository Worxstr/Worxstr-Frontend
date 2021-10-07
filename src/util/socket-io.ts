import { io } from 'socket.io-client'

const url = process.env.VUE_APP_API_BASE_URL || window.location.origin.replace(':8080', ':5000')
const socket = io(url, {
  path: '/socket.io'
})

export default socket