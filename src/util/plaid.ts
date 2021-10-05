

/* eslint-disable @typescript-eslint/camelcase */

import { addPlaidFundingSource, getPlaidLinkToken } from '@/services/payments'
import store from '@/store'
declare global {
  interface Window {
    Plaid: any;
  }
}

function onSuccess(name: string) {
  return async function(public_token: string, metadata: any) {
    const accountId = metadata.accounts[0].id
  
    const accessToken = await addPlaidFundingSource(this.$store, {
      name,
      publicToken: public_token,
      accountId
    })

    return accessToken
  }
}

async function onLoad() {
  console.log('loaded')
}

async function onExit(err: any, metadata: any) {
  console.log('exited', err, metadata)
}

async function onEvent(eventName: string, metadata: any) {
  console.log('event', eventName, metadata)
}


export async function openPlaidLink(name: string) {
  const linkToken = await getPlaidLinkToken(store)
  console.log(linkToken)

  const handler = window.Plaid.create({
    token: linkToken,
    onSuccess: onSuccess(name),
    onLoad,
    onEvent,
    onExit,
    receivedRedirectUri: null,
  })

  handler.open()
}