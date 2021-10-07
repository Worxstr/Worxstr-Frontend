/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import { CalendarEvent } from '@/definitions/Schedule'

export async function loadCalendarEvents({ commit }: any, start: string, end: string) {
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
