/* eslint-disable @typescript-eslint/camelcase */
import store from '@/store'
import axios from 'axios'
import * as Plaid from '@/util/plaid'
import { FundingSource, Timecard, Transfer } from '@/definitions/Payments'
import { ClockEvent } from '@/definitions/Clock'

const { commit, dispatch } = store

export async function loadTimecards() {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/timecards',
  })
  data.timecards.forEach((timecard: Timecard) => {
    // TODO: Normalize nested data
    commit('ADD_TIMECARD', timecard)
  })
  return data
}

export async function updateTimecard(timecardId: number, events: ClockEvent[]) {
  const { data } = await axios({
    method: 'PUT',
    url: `payments/timecards/${timecardId}`,
    data: {
      changes: events,
    },
  })
  commit('ADD_TIMECARD', data.timecard)
  return data
}

export async function denyPayments(timecardIds: number[]) {
  const { data } = await axios({
    method: 'PUT',
    url: 'payments/deny',
    data: {
      timecard_ids: timecardIds,
    },
  })
  timecardIds.forEach((timecardId: number) => {
    // TODO: Normalize nested data
    commit('REMOVE_TIMECARD', timecardId)
  })
  return data
}

export async function completePayments(timecardIds: number[]) {
  const { data } = await axios({
    method: 'PUT',
    url: 'payments/complete',
    data: {
      timecard_ids: timecardIds
    },
  })
  timecardIds.forEach((timecardId: number) => {
    commit('REMOVE_TIMECARD', timecardId)
  })
  data.transfers.forEach((obj: { transfer: Transfer }) => {
    const transfer = obj.transfer
    commit('ADD_TRANSFER', { transfer, prepend: true })
    commit('ADD_TO_BALANCE', (-parseFloat(transfer?.amount?.value)))
  })
}

export async function loadBalance() {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/balance',
  })
  commit('SET_BALANCE', {
    ...data.balance,
    location: data.location,
  })
}

export async function openPlaidLink(name: string) {
  return await Plaid.openPlaidLink(name)
}

export async function getPlaidLinkToken() {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/plaid-link-token',
  })
  return data.token
}

export async function loadFundingSources() {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/accounts',
  })
  commit('SET_BENEFICIAL_OWNERS_CERTIFIED', data.certified_ownership)
  data.funding_sources.forEach((source: FundingSource) => {
    commit('ADD_FUNDING_SOURCE', source)
  })
  return data
}

export async function addPlaidFundingSource({ name, publicToken, accountId }: {
  name: string;
  publicToken: string;
  accountId: string;
}) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/accounts',
    data: {
      name,
      public_token: publicToken,
      account_id: accountId,
    },
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function updateFundingSource(fundingSource: FundingSource) {
  const { data } = await axios({
    method: 'PUT',
    url: 'payments/accounts',
    data: fundingSource,
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function removeFundingSource(fundingSourceLocation: string) {
  const { data } = await axios({
    method: 'DELETE',
    url: 'payments/accounts',
    data: {
      location: fundingSourceLocation,
    },
  })
  commit('REMOVE_FUNDING_SOURCE', fundingSourceLocation)
  return data
}

export async function addToBalance(transfer: { amount: number; location: string }) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/balance/add',
    data: transfer,
  })
  commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
  dispatch('showSnackbar', { text: 'Hang tight, your transfer is being processed.' })
  return data
}

export async function removeFromBalance(transfer: { amount: number; location: string }) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/balance/remove',
    data: transfer,
  })
  commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
  commit('ADD_TO_BALANCE', -transfer.amount)
  dispatch('showSnackbar', { text: 'Hang tight, your transfer is being processed.' })
  return data
}

export async function loadTransfers({ limit=10, offset=0 } = {}) {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/transfers',
    params: {
      limit,
      offset,
    }
  })
  data.transfers.forEach((transfer: Transfer) => {
    commit('ADD_TRANSFER', { transfer })
  })
  return data
}