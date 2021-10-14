import Vue from 'vue'
import { FundingSource, Timecard, Transfer } from '@/types/Payments'

export interface PaymentsState {
  beneficialOwnersCertified: boolean;
  balance: {
    value: number;
    currency: string;
    location: string | null;
  };
  fundingSources: {
    all: string[];
    byLocation: {
      [key: string]: FundingSource[];
    };
  };
  timecards: {
    all: number[];
    byId: {
      [key: number]: Timecard;
    };
  };
  transfers: {
    all: string[];
    byId: {
      [key: string]: Transfer;
    };
  };
}

export const initialState = (): PaymentsState => ({
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
  timecards: {
    all: [],
    byId: {},
  },
  transfers: {
    all: [],
    byId: {},
  },
})

const mutations = {

  SET_BALANCE(state: PaymentsState, { value, currency, location }: {
    value: string | number;
    currency: string;
    location: string;
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

  ADD_TIMECARD(state: PaymentsState, timecard: Timecard) {
    Vue.set(state.timecards.byId, timecard.id, timecard)
    if (!state.timecards.all.includes(timecard.id))
      state.timecards.all.push(timecard.id)
  },

  REMOVE_TIMECARD(state: PaymentsState, timecardId: number) {
    Vue.delete(state.timecards.byId, timecardId)
    Vue.delete(
      state.timecards.all,
      state.timecards.all.indexOf(timecardId)
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

  ADD_TRANSFER(state: PaymentsState, transfer: Transfer) {
    Vue.set(state.transfers.byId, transfer.id, {
      ...state.transfers.byId[transfer.id],
      ...transfer
    })
    if (!state.transfers.all.includes(transfer.id))
      state.transfers.all.push(transfer.id)
  },
}

const getters = {
  timecard: (state: PaymentsState) => (id: number) => {
    return state.timecards.byId[id]
  },

  timecards: (state: PaymentsState, getters: any) => {
    return state.timecards.all.map((id) => getters.timecard(id))
  },

  timecardsByIds: (_state: PaymentsState, getters: any) => (timecardIds: number[]) => {
    return timecardIds.map((id) => getters.timecard(id))
  },

  fundingSource: (state: PaymentsState) => (location: string) => {
    return state.fundingSources.byLocation[location]
  },

  fundingSources: (state: PaymentsState, getters: any) => {
    return state.fundingSources.all.map((location) => getters.fundingSource(location))
  },

  transfer: (state: PaymentsState) => (transferId: string) => {
    return state.transfers.byId[transferId]
  },

  transfers: (state: PaymentsState, getters: any) => {
    return state.transfers.all
      .map((transferId) => getters.transfer(transferId))
      .sort((a: Transfer, b: Transfer) => 
        ((new Date(b.created)).valueOf()) - ((new Date(a.created)).valueOf())
      )
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}