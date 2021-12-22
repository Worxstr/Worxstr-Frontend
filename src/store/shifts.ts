/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Shift, Task } from '@/types/Jobs'
import { ClockAction } from '@/types/Clock'

export interface ShiftsState {
  upcoming: number[] | null;
  all: number[];
  byId: {
    [key: number]: Shift;
  };
  tasks: {
    all: number[];
    byId: {
      [key: number]: Task;
    };
  };
}

export const initialState = (): ShiftsState => ({
  upcoming: null,
  all: [],
  byId: {},
  tasks: {
    all: [],
    byId: {},
  }
})

const mutations = {

  SET_UPCOMING_SHIFTS(state: ShiftsState, shiftIds: number[]) {
    state.upcoming = shiftIds
  },

  ADD_SHIFT(state: ShiftsState, shift: Shift) {
    Vue.set(state.byId, shift.id, shift)

    shift.tasks = shift.tasks.map((task: Task) => {
      Vue.set(state.tasks.byId, task.id, task)
      if (!state.tasks.all.includes(task.id))
        state.tasks.all.push(task.id)
      return task.id
    })

    if (!state.all.includes(shift.id))
      state.all.push(shift.id)

    // TODO
    // Normalize clock events
    // if (shift.timeclock_actions) {
    //   shift.timeclock_actions.forEach((event: ClockEvent) => {
    //     Vue.set(clockStore.state.events.byId, event.id, event)
    //     if (!shiftsStore.state.events.all.includes(event.id))
    //     shiftsStore.state.events.all.push(event.id)
    //   })
    // }
  },

  REMOVE_SHIFT(state: ShiftsState, shiftId: number) {
    Vue.delete(state.byId, shiftId)
    Vue.delete(
      state.all,
      state.all.indexOf(shiftId)
    )
  },
  
  ADD_TASK(state: ShiftsState, task: Task) {
    Vue.set(state.tasks.byId, task.id, task)
    if (!state.tasks.all.includes(task.id))
      state.tasks.all.push(task.id)
  },

  CLOCK_IN(state: ShiftsState, shiftId: number) {
    state.byId[shiftId].clock_state = ClockAction.ClockIn
  },

  CLOCK_OUT(state: ShiftsState, shiftId: number) {
    state.byId[shiftId].clock_state = ClockAction.ClockOut
  },

  START_BREAK(state: ShiftsState, shiftId: number) {
    state.byId[shiftId].clock_state = ClockAction.StartBreak
  },

  END_BREAK(state: ShiftsState, shiftId: number) {
    state.byId[shiftId].clock_state = ClockAction.EndBreak
  },
}

const getters = {
  task: (state: ShiftsState) => (id: number) => {
    return state.tasks.byId[id]
  },

  shift: (state: ShiftsState, getters: any) => (id: number) => {
    const shift = {...state.byId[id]}

    if (!shift) return null

    if (shift.tasks) {
      shift.tasks = shift.tasks.map((taskId: number) => {
        return getters.task(taskId)
      })
    }

    return shift
  },

  upcomingShifts: (state: ShiftsState) => {
    if (!state.upcoming) return []
    return state.upcoming.map(id => state.byId[id])
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}