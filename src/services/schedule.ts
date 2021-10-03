/* eslint-disable @typescript-eslint/camelcase */
import store from '@/store'
import axios from 'axios'
import { CalendarEvent } from '@/definitions/Schedule'

const { commit } = store

export async function loadCalendarEvents(start: string, end: string) {
  const { data } = await axios({
    method: 'GET',
    url: 'calendar',
    params: {
      date_begin: start,
      date_end: end,
    },
  })
  data.events.forEach((event: CalendarEvent) => commit('ADD_EVENT', event))
  return data
}