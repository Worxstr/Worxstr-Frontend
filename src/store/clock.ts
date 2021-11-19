
import Vue from 'vue'
import { ClockEvent } from '@/types/Clock'
import { resolveRelations } from '../util/helpers'
import usersStore from '@/store/users'

export interface ClockState {
  clocked: boolean;
  break: boolean;
  events: {
    historyPaginationOffset: number;
    all: number[];
    byId: {
      [key: number]: ClockEvent;
    };
  };
}

export const initialState = (): ClockState => ({
  clocked: false,
  break: false,
  events: {
    historyPaginationOffset: 0,
    all: [],
    byId: {},
  },
})

const mutations = {
  ADD_CLOCK_EVENT(state: ClockState, event: ClockEvent) {
    Vue.set(state.events.byId, event.id, event)
    if (!state.events.all.includes(event.id))
      state.events.all.push(event.id)
  },

  INCREMENT_CLOCK_HISTORY_OFFSET(state: ClockState) {
    state.events.historyPaginationOffset++
  },

  CLOCK_IN(state: ClockState) {
    state.clocked = true
  },

  CLOCK_OUT(state: ClockState) {
    state.clocked = false
  },

  START_BREAK(state: ClockState) {
    state.break = true
  },

  END_BREAK(state: ClockState) {
    state.break = false
  },
}

const getters = {
  clockEvent: (state: ClockState/*, _: any, __: any, rootGetters: any*/) => (id: number) => {
    return state.events.byId[id]
    // return resolveRelations(
    //   state.events.byId[id],
    //   [
    //     /*'user'*/
    //   ],
    //   rootGetters
    // )
  },

  clockHistoryByJobAndContractor: (state: ClockState, getters: any) => (jobId: number, contractorId: number) => {
    // TODO: The clockEvent getter isn't working for some reason
    return state.events.all
      .map((eventId: number) => state.events.byId[eventId])
      .filter((event: ClockEvent) => {
        return event.contractor_id === contractorId && event.job_id === jobId
      })
      .sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      })
  },

  clockHistory: (state: ClockState, getters: any) => {
    return state.events.all
      .map((eventId) =>
        getters.clockEvent(eventId)
      )
      .filter((event: ClockEvent) => {
        return event.contractor_id === usersStore.getters.me(usersStore.state)?.id
      })
      .sort((a, b) => {
        return new Date(b.time).getTime() - new Date(a.time).getTime()
      })
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}