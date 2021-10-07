import mitt from 'mitt'
import { getBaseUrl, showToast } from '@/services/app'

// Create an event bus for dwolla component events, eg. 'success' and 'error'
const dwolla = mitt()
declare global {
  interface Window {
    dwolla: any;
  }
}

const success = async (res: any) => {
    
  if (!res.location) return

  if (res.location.includes('customers')) {
    console.log('customerCreated')
    dwolla.emit('customerCreated', res)
  }
  else if (res.location.includes('beneficial-owners')) {
    console.log('beneficialOwnersCreated')
    dwolla.emit('beneficialOwnersCreated', res)
  }

}

export function configureDwolla({ commit}: any, sandbox = true) {
  const dwollaEnv = process.env.VUE_APP_DWOLLA_HOST || (sandbox ? 'sandbox' : 'production')

  window.dwolla.configure({
    environment: dwollaEnv,
    tokenUrl: `${getBaseUrl()}/payments/access`,
    styles: '/dwolla.css',
    success: async (res: any) => {
      
      // Dwolla sdk can't fucking figure out how to handle errors properly
      // So we have to do this
      if (res._embedded && res._embedded?.errors)
        showToast({ commit }, { text: res._embedded?.errors[0]?.message })
      else
        await success(res)
    },
    error: (err: any) => {
      dwolla.emit('error', err)
    },
  })
}

export default dwolla