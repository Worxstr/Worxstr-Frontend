

/* eslint-disable @typescript-eslint/camelcase */

import store from '@/store'

function onSuccess(name: string) {
  return async function(public_token: string, metadata: any) {
    const accountId = metadata.accounts[0].id
  
    const accessToken = await store.dispatch('addPlaidFundingSource', {
      name,
      publicToken: public_token,
      accountId
    })
  }
}

// async function onLoad() {

// }

// async function onExit(err: any, metadata: any) {

// }

// async function onEvent(eventName: string, metadata: any) {

// }


export async function openPlaidLink(name) {
  const linkToken = await store.dispatch('getPlaidLinkToken')
  
  const handler = window.Plaid.create({
    token: linkToken,
    onSuccess: onSuccess(name),
    // onLoad,
    // onEvent,
    // onExit,
    receivedRedirectUri: null,
  })
}