/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { FundingSource, Payment } from '@/types/Payments'
import shiftsStore from './shifts'

export interface PaymentsState {
  all: number[]
  byId: {
    [key: number]: Payment
  }
  lastPageLoadedPending: number | null
  lastPageLoadedCompleted: number | null
  beneficialOwnersCertified: boolean
  balance: {
    value: number
    currency: string
    location: string | null
  }
  fundingSources: {
    all: string[]
    byLocation: {
      [key: string]: FundingSource[]
    }
  }
}

export const initialState = (): PaymentsState => ({
  all: [],
  byId: {},
  lastPageLoadedPending: null,
  lastPageLoadedCompleted: null,
  beneficialOwnersCertified: false,
  balance: {
    value: 0,
    currency: 'USD',
    location: null,
  },
  fundingSources: {
    all: [],
    byLocation: {},
  },
})

const mutations = {

  SET_LAST_PAGE_LOADED_PENDING(state: PaymentsState, lastPageLoaded: number) {
    state.lastPageLoadedPending = lastPageLoaded
  },

  SET_LAST_PAGE_LOADED_COMPLETED(state: PaymentsState, lastPageLoaded: number) {
    state.lastPageLoadedCompleted = lastPageLoaded
  },

  SET_BALANCE(state: PaymentsState, { value, currency, location }: {
    value: string | number
    currency: string
    location: string
  }) {
    state.balance = {
      value: typeof(value) === 'number' ? value : parseFloat(value),
      currency,
      location,
    }
  },

  ADD_TO_BALANCE(state: PaymentsState, amount: number) {
    state.balance.value += amount
  },

  ADD_PAYMENT(state: PaymentsState, payment: Payment) {
    
    if (payment?.invoice?.timecard?.shift) {
      shiftsStore.mutations.ADD_SHIFT(shiftsStore.state, payment.invoice.timecard.shift)
      payment.invoice.timecard.shift_id = payment.invoice.timecard.shift.id
      delete payment.invoice.timecard.shift
    }
    
    Vue.set(state.byId, payment.id, payment)
    
    if (!state.all.includes(payment.id))
      state.all.push(payment.id)
  },

  REMOVE_PAYMENT(state: PaymentsState, paymentId: number) {
    Vue.delete(state.byId, paymentId)
    Vue.delete(
      state.all,
      state.all.indexOf(paymentId)
    )
  },

  SET_BENEFICIAL_OWNERS_CERTIFIED(state: PaymentsState, certified: boolean) {
    state.beneficialOwnersCertified = certified
  },

  ADD_FUNDING_SOURCE(state: PaymentsState, fundingSource: FundingSource) {
    Vue.set(
      state.fundingSources.byLocation,
      fundingSource._links.self.href,
      {
        ...state.fundingSources.byLocation[fundingSource._links.self.href],
        ...fundingSource,
      }
    )
    if (!state.fundingSources.all.includes(fundingSource._links.self.href))
      state.fundingSources.all.push(fundingSource._links.self.href)
  },

  REMOVE_FUNDING_SOURCE(state: PaymentsState, fundingSourceLocation: string) {
    Vue.delete(
      state.fundingSources.byLocation,
      fundingSourceLocation
    )
    Vue.delete(
      state.fundingSources.all,
      state.fundingSources.all.findIndex(
        (location) => location == fundingSourceLocation
      )
    )
  },
}

const getters = {

  payment: (state: PaymentsState) => (id: number) => {
    return state.byId[id]
  },

  payments: (state: PaymentsState, getters: any) => {
    return state.all.map((id) => getters.payment(id))
  },

  paymentsByIds: (_state: PaymentsState, getters: any) => (paymentIds: number[]) => {
    return paymentIds.map((id) => getters.payment(id))
  },

  fundingSource: (state: PaymentsState) => (location: string) => {
    return state.fundingSources.byLocation[location]
  },

  fundingSources: (state: PaymentsState, getters: any) => {
    return state.fundingSources.all.map((location) => getters.fundingSource(location))
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}