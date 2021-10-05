/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import * as Plaid from '@/util/plaid'
import { FundingSource, Timecard, Transfer } from '@/definitions/Payments'
import { ClockEvent } from '@/definitions/Clock'
import { showToast } from '@/services/app'

export async function loadTimecards({ commit }: any) {
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

export async function updateTimecard({ commit }: any, timecardId: number, events: ClockEvent[]) {
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

export async function denyPayments({ commit }: any, timecardIds: number[]) {
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

export async function completePayments({ commit }: any, timecardIds: number[]) {
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

export async function loadBalance({ commit }: any) {
  const { data } = await axios({
    method: 'GET',
    url: 'payments/balance',
  })
  commit('SET_BALANCE', {
    ...data.balance,
    location: data.location,
  })
}

export async function openPlaidLink({ commit }: any, name: string) {
  return await Plaid.openPlaidLink(name)
}

export async function getPlaidLinkToken({ commit }: any) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/plaid-link-token',
  })
  return data.token
}

export async function loadFundingSources({ commit }: any) {
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

export async function addPlaidFundingSource({ commit }: any, { name, publicToken, accountId }: {
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

export async function updateFundingSource({ commit }: any, fundingSource: FundingSource) {
  const { data } = await axios({
    method: 'PUT',
    url: 'payments/accounts',
    data: fundingSource,
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function removeFundingSource({ commit }: any, fundingSourceLocation: string) {
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

export async function addToBalance({ commit }: any, transfer: { amount: number; location: string }) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/balance/add',
    data: transfer,
  })
  commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
  showToast({ commit }, { text: 'Hang tight, your transfer is being processed.' })
  return data
}

export async function removeFromBalance({ commit }: any, transfer: { amount: number; location: string }) {
  const { data } = await axios({
    method: 'POST',
    url: 'payments/balance/remove',
    data: transfer,
  })
  commit('ADD_TRANSFER', { transfer: data.transfer, prepend: true })
  commit('ADD_TO_BALANCE', -transfer.amount)
  showToast({ commit }, { text: 'Hang tight, your transfer is being processed.' })
  return data
}

export async function loadTransfers({ commit }: any, { limit=10, offset=0 } = {}) {
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