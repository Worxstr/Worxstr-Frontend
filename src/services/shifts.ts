/* eslint-disable @typescript-eslint/camelcase */
import { Shift } from '@/types/Jobs'
import { api } from '@/util/axios'
import { Task } from '@/types/Jobs'
import * as geolocation from '@/services/geolocation'

export async function clockIn({ commit }: any, shiftId: number, { code, location }: { code: string; location: geolocation.Position }) {
  const { data } = await api({
    method: 'POST',
    url: `clock/clock-in`,
    params: {
      shift_id: shiftId,
    },
    data: {
      location,
      code,
    },
  })
  // TODO: Add clock event to shift
  // commit('ADD_CLOCK_EVENT', data)
  commit('CLOCK_IN', shiftId)
  return data
}

export async function clockOut({ commit }: any, shiftId: number) {
  const { data } = await api({
    method: 'POST',
    url: `clock/clock-out`,
    params: {
      shift_id: shiftId,
    },
  })
  // commit('ADD_CLOCK_EVENT', data)
  commit('CLOCK_OUT', shiftId)
  geolocation.stop()
  return data
}

export async function toggleBreak({ commit }: any, shiftId: number, breakState: boolean) {
  const action = breakState ? 'start' : 'end'

  const { data } = await api({
    method: 'POST',
    url: `clock/${action}-break`,
  })
  // commit('ADD_CLOCK_EVENT', data)
  commit(`${action.toUpperCase()}_BREAK`, shiftId)
  return data
}

export async function getShift({ commit }: any, shiftId: number) {
  const { data } = await api({
    method: 'GET',
    url: `shifts/${shiftId}`,
  })
  commit('ADD_SHIFT', data)
  return data
}

export async function getUpcomingShifts({ commit }: any, offset = 0, limit = 10) {
  const { data } = await api({
    method: 'GET',
    url: 'shifts',
    params: {
      offset,
      limit,
    },
  })
  data.shifts.forEach((shift: Shift) => {
    commit('ADD_SHIFT', shift)
  })
  data.shifts.forEach((shift: Shift) => {
    commit('ADD_UPCOMING_SHIFT', shift.id)
  })

  return data
}

export async function createShift({ commit }: any, shift: Shift, jobId: number) {
  const { data } = await api({
    method: 'POST',
    url: 'shifts',
    data: shift,
    params: { job_id: jobId },
  })
  data.shifts.forEach((shift: Shift) => {
    commit('ADD_SHIFT', shift)
  })
  return data
}

export async function updateShift({ commit }: any, shift: any) {
  const { data } = await api({
    method: 'PUT',
    url: `shifts/${shift.id}`,
    data: { shift },
  })
  commit('ADD_SHIFT', data.shift)
  return data
}

export async function deleteShifts({ state, commit }: any, shiftIds: number[]) {
  await api({
    method: 'DELETE',
    url: 'shifts',
    data: {
      shift_ids: shiftIds
    }
  })
  shiftIds.map((shiftId: number) => {
    commit('REMOVE_SHIFT', {
      shiftId,
      jobId: state.shifts.byId[shiftId].job_id,
    }) 
  })
}

export async function createTask({ commit }: any, shiftId: number, task: Task) {
  // TODO
}

export async function updateTask({ commit }: any, task: Task) {
  // TODO
}


export async function completeTask({ commit }: any, taskId: number, completed = false) {
  const { data } = await api({
    method: 'PUT',
    url: `tasks/${taskId}/complete`,
    data: {
      completed,
    }
  })
  commit('ADD_TASK', data)
}

export async function deleteTask({ commit }: any, taskId: number) {
  // TODO
}