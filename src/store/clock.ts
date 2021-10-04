import Vue from 'vue'
import { ClockEvent } from '@/definitions/Clock'
import { resolveRelations } from '../util/helpers'

interface ClockState {
  clocked: boolean;
  break: boolean;
  history: {
    lastLoadedOffset: number;
    all: number[];
    byId: {
      [key: number]: ClockEvent;
    };
  };
}

const initialState = (): ClockState => ({
  clocked: false,
  break: false,
  history: {
    lastLoadedOffset: 0,
    all: [],
    byId: {},
  },
})

const mutations = {
  ADD_CLOCK_EVENT(state: ClockState, event: ClockEvent) {
    Vue.set(state.history.byId, event.id, event)
    if (!state.history.all.includes(event.id))
      state.history.all.push(event.id)
  },

  INCREMENT_CLOCK_HISTORY_OFFSET(state: ClockState) {
    state.history.lastLoadedOffset++
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
  clockEvent: (state: ClockState, _: any, __: any, rootGetters: any) => (id: number) => {
    return resolveRelations(
      state.history.byId[id],
      [
        /*'user'*/
      ],
      rootGetters
    )
  },

  clockHistory: (state: ClockState, getters: any) => {
    let events = state.history.all.map((eventId) =>
      getters.clockEvent(eventId)
    )
    events = events.sort((a, b) => {
      return new Date(b.time).getTime() - new Date(a.time).getTime()
    })

    return events
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}