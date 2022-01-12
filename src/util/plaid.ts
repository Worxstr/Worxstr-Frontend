

/* eslint-disable @typescript-eslint/camelcase */

import { addPlaidFundingSource, getPlaidLinkToken } from '@/services/payments'
import store from '@/store'
declare global {
  interface Window {
    Plaid: any
  }
}

function onSuccess(name: string, callback: (loading: boolean) => void) {
  return async function (public_token: string, metadata: any) {
    const accountId = metadata.accounts[0].id

    const accessToken = await addPlaidFundingSource(store, {
      accountName: name,
      publicToken: public_token,
      accountId
    })

    callback(false)
    return accessToken
  }
}

function onEvent(callback: (loading: boolean) => void) {
  return async function (eventName: string, metadata: any) {
    switch (eventName) {
      case 'HANDOFF':
        callback(true)
        break
    }
  }
}

export async function openPlaidLink(name: string, callback: (loading: boolean) => void) {
  const linkToken = await getPlaidLinkToken(store)

  const handler = window.Plaid.create({
    token: linkToken,
    onSuccess: onSuccess(name, callback),
    onEvent: onEvent(callback),
    receivedRedirectUri: null,
  })

  handler.open()
}