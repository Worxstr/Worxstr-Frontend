/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import store from '@/store'
import clockStore from '@/store/clock'
import jobsStore from '@/store/jobs'
import { normalizeRelations } from '@/util/helpers'
import { ClockEvent } from '@/definitions/Clock'

const { commit } = store

export async function loadClockHistory() {
  const { data } = await axios.get(`clock/history`, {
    params: {
      week_offset: clockStore.state.history.lastLoadedOffset,
    },
  })
  data.history.forEach((event: ClockEvent) => {
    // TODO: Normalize nested data
    commit(
      'ADD_CLOCK_EVENT',
      normalizeRelations(event, [
        /*'user'*/
      ])
    )
    /* commit('ADD_USER', event.user, {
      root: true
    }) */
  })
  commit('INCREMENT_CLOCK_HISTORY_OFFSET')
}

export async function loadNextShift() {
  const { data } = await axios.get(`shifts/next`)
  commit('SET_NEXT_SHIFT', data.shift)
}

export async function clockIn(code: string) {
  const { data } = await axios({
    method: 'POST',
    url: `clock/clock-in`,
    params: {
      shift_id: jobsStore.state.shifts.next?.id,
    },
    data: {
      code,
    },
  })
  commit('ADD_CLOCK_EVENT', data.event)
  commit('CLOCK_IN')
  return data
}

export async function clockOut() {
  const { data } = await axios({
    method: 'POST',
    url: `clock/clock-out`,
    params: {
      shift_id: jobsStore.state.shifts.next?.id,
    },
  })
  commit('ADD_CLOCK_EVENT', data.event)
  commit('CLOCK_OUT')
}

export async function toggleBreak(breakState: boolean) {
  const action = breakState ? 'end' : 'start'

  const { data } = await axios({
    method: 'POST',
    url: `clock/${action}-break`,
  })
  commit('ADD_CLOCK_EVENT', data.data)
  commit(`${action.toUpperCase()}_BREAK`)
}