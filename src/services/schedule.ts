/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import { CalendarEvent } from '@/types/Schedule'

export async function loadCalendarEvents({ commit }: any, start: string, end: string) {
  const { data } = await api({
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
