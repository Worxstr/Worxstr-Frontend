import Vue from 'vue'
import { CalendarEvent } from '@/types/Schedule'
import { hashColor } from '@/util/helpers'
import { RootState } from '.'

export interface ScheduleState {
  events: {
    all: number[]
    byId: {
      [key: number]: CalendarEvent
    }
  }
}

export const initialState = (): ScheduleState => ({
  events: {
    all: [],
    byId: {},
  },
})

const mutations = {
  ADD_EVENT(state: ScheduleState, event: CalendarEvent) {
    Vue.set(state.events.byId, event.id, event)
    if (!state.events.all.includes(event.id)) state.events.all.push(event.id)
  },
  
  REMOVE_EVENT(state: ScheduleState, eventId: number) {
    Vue.delete(state.events.byId, eventId)
    Vue.delete(
      state.events.all,
      state.events.all.indexOf(eventId)
    )
  }
}

const getters = {
  calendarEvent: (state: ScheduleState) => (id: number) => {
    return state.events.byId[id]
  },
  calendarEvents: (state: ScheduleState, getters: any, rootState: RootState) => (colorBy: string) => {
    return state.events.all.map((eventId) => {
      const event = getters.calendarEvent(eventId)

      let color: any = 'blue'
      switch (colorBy) {
        case 'job':
          if (rootState.jobs.byId[event.job_id]?.color)
            color = rootState.jobs.byId[event.job_id]?.color
          else
            color = hashColor(event.job_id)
          break
        case 'contractor':
          if (rootState.users.byId[event.contractor_id]?.additional_info?.color)
            color = rootState.users.byId[event.contractor_id]?.additional_info?.color
          else
            color = hashColor(event.contractor_id)
          break
      }

      return {
        name: event.site_location,
        start: new Date(event.time_begin),
        end: new Date(event.time_end),
        timed: true,
        color,
        ...event,
      }
    })
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}