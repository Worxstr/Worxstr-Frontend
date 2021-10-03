

/* eslint-disable @typescript-eslint/camelcase */

import store from '@/store'
declare global {
  interface Window {
    Plaid: any;
  }
}

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
  const linkToken = await store.dispatch('getPlaidLinkToken')
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