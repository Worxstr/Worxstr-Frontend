/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import mitt from 'mitt'
import { baseUrl, showToast } from '@/services/app'

// Create an event bus for dwolla component events, eg. 'success' and 'error'
const dwolla = mitt()
declare global {
  interface Window {
    dwolla: any;
  }
}

const tokenUrl = 'payments/access'

export async function getDwollaAccessToken() {
  const { data } = await axios({
    method: 'POST',
    url: tokenUrl,
  })
  return data.token
}

// TODO: We may need more of these in the future. Make a builder function for these.
export function dwollaCustomerIdFromUrl(customerUrl: string) {
  return customerUrl
    .replace('https://api-sandbox.dwolla.com/customers/', '')
    .replace('https://api.dwolla.com/customers/', '')
}
export function dwollaFundingSourceIdFromUrl(fundingSourceUrl: string) {
  return fundingSourceUrl
    .replace('https://api-sandbox.dwolla.com/funding-sources/', '')
    .replace('https://api.dwolla.com/funding-sources/', '')
}

export async function getDwollaCustomerEmail(customerUrl: string) {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/dwolla/customers/email',
    params: {
      customer_id: customerUrl
    }
  })
  return data.email
}

async function success(res: any) {
    
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
    tokenUrl: `${baseUrl.get()}/${tokenUrl}`,
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