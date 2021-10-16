/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import clockStore from '@/store/clock'
import jobsStore from '@/store/jobs'
import { ClockEvent } from '@/types/Clock'

export async function loadClockHistory({ commit }: any) {
  const { data } = await axios.get(`clock/history`, {
    params: {
      week_offset: clockStore.state.events.historyPaginationOffset,
    },
  })
  data.history.forEach((event: ClockEvent) => {
    commit('ADD_CLOCK_EVENT', event)

    // TODO: Normalize nested data
    /* 
    (normalizeRelations(event, [
      'user',
    ]))
    commit('ADD_USER', event.user, {
      root: true
    })
    */

  })
  commit('INCREMENT_CLOCK_HISTORY_OFFSET')
}

export async function loadNextShift({ commit }: any) {
  const { data } = await axios.get(`shifts/next`)
  commit('ADD_SHIFT', data.shift)
  commit('SET_NEXT_SHIFT', data.shift.id)
}

export async function clockIn({ commit }: any, code: string, shiftId: number) {
  const { data } = await axios({
    method: 'POST',
    url: `clock/clock-in`,
    params: {
      shift_id: shiftId,
    },
    data: {
      code,
    },
  })
  commit('ADD_CLOCK_EVENT', data)
  commit('CLOCK_IN')
  return data
}

export async function clockOut({ commit }: any, shiftId: number) {
  const { data } = await axios({
    method: 'POST',
    url: `clock/clock-out`,
    params: {
      shift_id: shiftId,
    },
  })
  commit('ADD_CLOCK_EVENT', data)
  commit('CLOCK_OUT')
}

export async function toggleBreak({ commit }: any, breakState: boolean) {
  const action = breakState ? 'end' : 'start'

  const { data } = await axios({
    method: 'POST',
    url: `clock/${action}-break`,
  })
  commit('ADD_CLOCK_EVENT', data)
  commit(`${action.toUpperCase()}_BREAK`)
}