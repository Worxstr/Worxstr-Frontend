import Vue from 'vue'
import { CalendarEvent } from '@/types/Schedule'

export interface ScheduleState {
  events: {
    all: number[];
    byId: {
      [key: number]: CalendarEvent;
    };
  };
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
  calendarEvents: (state: ScheduleState, getters: any) => {
    let colorCounter = 0
    const eventColors = [
      'blue',
      'green',
      'purple',
      'indigo',
      'orange darken-1',
      'deep-purple',
      'red',
      'light-blue',
      'yellow darken-2',
      'light-green',
      'cyan',
      'pink',
      'teal',
      'lime',
    ]
    const colorMap: {
      [key: number]: string;
    } = {} // Map job ID to color

    return state.events.all.map((eventId) => {
      const event = getters.calendarEvent(eventId)

      let color
      if (colorMap[event.job_id]) {
        color = colorMap[event.job_id]
      } else {
        color = eventColors[colorCounter % eventColors.length]
        colorMap[event.job_id] = color
        colorCounter++
      }

      return {
        name: event.site_location,
        start: new Date(event.time_begin),
        end: new Date(event.time_end),
        color,
        timed: true,
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