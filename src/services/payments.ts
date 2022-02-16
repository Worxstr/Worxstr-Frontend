/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import { FundingSource, Payment, Invoice } from '@/types/Payments'
import { ClockEvent } from '@/types/Jobs'
import { showToast } from '@/services/app'

export async function loadPayments({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: '/payments',
  })
  data.payments.forEach((payment: Payment) => {
    commit('ADD_PAYMENT', payment)
  })
  return data.payments
}

export async function loadPayment({ commit }: any, paymentId: string) {
  const { data } = await api({
    method: 'GET',
    url: `/payments/${paymentId}`,
  })
  commit('ADD_PAYMENT', data)
  return data
}

export async function createInvoice({ commit }: any, invoice: Invoice) {
  const { data } = await api({
    method: 'POST',
    url: 'payments/invoices',
    data: invoice,
  })
  commit('ADD_PAYMENT', data)
  return data
}

export async function updatePayment({ commit }: any, paymentId: number, events: ClockEvent[], invoice: Invoice) {
  const { data } = await api({
    method: 'PUT',
    url: `payments/${paymentId}`,
    data: {
      timecard: {
        clock_events: events,
      },
      invoice: invoice,
    },
  })
  commit('ADD_PAYMENT', data)
  return data
}

export async function denyPayments({ commit }: any, paymentIds: number[]) {
  const { data } = await api({
    method: 'PUT',
    url: 'payments/deny',
    data: {
      payment_ids: paymentIds,
    },
  })
  paymentIds.forEach((paymentId: number) => {
    // TODO: Normalize nested data
    commit('REMOVE_PAYMENT', paymentId)
  })
  return data
}

export async function completePayments({ commit }: any, paymentIds: number[]) {
  const { data } = await api({
    method: 'PUT',
    url: 'payments/complete',
    data: {
      payment_ids: paymentIds
    },
  })
  data.payments.forEach((payment: Payment) => {
    commit('ADD_PAYMENT', payment)
  })
  commit('SET_BALANCE', data.balance)
}

export async function loadBalance({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: 'payments/balance',
  })
  commit('SET_BALANCE', {
    ...data.balance,
    location: data.location,
  })
}

export async function getPlaidLinkToken({ commit }: any) {
  const { data } = await api({
    method: 'POST',
    url: 'payments/plaid-link-token',
  })
  return data.token
}

export async function loadFundingSources({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: 'payments/accounts',
  })
  commit('SET_BENEFICIAL_OWNERS_CERTIFIED', data.certified_ownership)
  data.funding_sources.forEach((source: FundingSource) => {
    commit('ADD_FUNDING_SOURCE', source)
  })
  return data
}

export async function addFundingSource({ commit }: any, { accountName, routingNumber, accountNumber, accountType }: {
  accountName: string
  routingNumber: string
  accountNumber: string
  accountType: 'checking' | 'savings'
}) {
  const { data } = await api({
    method: 'POST',
    url: 'payments/accounts',
    data: {
      name: accountName,
      routing_number: routingNumber,
      account_number: accountNumber,
      account_type: accountType,
    },
  })
  commit('ADD_FUNDING_SOURCE', data)
  commit('SHOW_SNACKBAR', {
    text: 'Deposit transfer initiated. Check your online banking in 2-3 business days to verify this deposit.'
  })
  return data
}

export async function addPlaidFundingSource({ commit }: any, { accountName, publicToken, accountId }: {
  accountName: string
  publicToken: string
  accountId: string
}) {
  const { data } = await api({
    method: 'POST',
    url: 'payments/accounts',
    data: {
      name: accountName,
      public_token: publicToken,
      account_id: accountId,
    },
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function verifyFundingSource({ commit }: any, { fundingSourceUrl, amount1, amount2 }: {
  fundingSourceUrl: string
  amount1: number
  amount2: number
}) {
  const { data } = await api({
    method: 'PUT',
    url: 'payments/accounts/verify',
    data: {
      funding_source: fundingSourceUrl,
      amount1: amount1.toFixed(2),
      amount2: amount2.toFixed(2),
    },
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function updateFundingSource({ commit }: any, fundingSource: FundingSource) {
  const { data } = await api({
    method: 'PUT',
    url: 'payments/accounts',
    data: fundingSource,
  })
  commit('ADD_FUNDING_SOURCE', data)
  return data
}

export async function removeFundingSource({ commit }: any, fundingSourceLocation: string) {
  const { data } = await api({
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
  const { data } = await api({
    method: 'POST',
    url: 'payments/balance/add',
    data: transfer,
  })
  commit('ADD_TRANSFER', transfer)
  showToast({ commit }, { text: 'Hang tight, your transfer is being processed.' })
  return data
}

export async function removeFromBalance({ commit }: any, transfer: { amount: number; location: string }) {
  const { data } = await api({
    method: 'POST',
    url: 'payments/balance/remove',
    data: transfer,
  })
  commit('ADD_TRANSFER', data.transfer)
  commit('SET_BALANCE', data.transfer.new_balance)
  showToast({ commit }, { text: 'Hang tight, your transfer is being processed.' })
  return data
}
