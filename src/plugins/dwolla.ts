import mitt from 'mitt'

// Create an event bus for dwolla component events, eg. 'success' and 'error'
const dwolla = mitt()

export default dwolla