/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Job, Shift } from '@/types/Jobs'

export interface JobsState {
  all: number[];
  byId: {
    [key: number]: Job;
  };
  shifts: {
    next: Shift | null;
    byJobId: {
      [key: number]: number[];
    };
    byId: {
      [key: number]: Shift;
    };
  };
}

export const initialState = (): JobsState => ({
  all: [],
  byId: {},
  shifts: {
    next: null,
    byJobId: {},
    byId: {},
  },
})

const mutations = {

  ADD_JOB(state: JobsState, job: Job) {
    job.shifts?.forEach(shift => {
      Vue.set(state.shifts.byId, shift.id, shift)
      if (state.shifts.byJobId[job.id]) {
        if (!state.shifts.byJobId[job.id]?.includes(shift.id))
        state.shifts.byJobId[job.id].push(shift.id)
      }
      else {
        state.shifts.byJobId[job.id] = [shift.id]
      }
      
    })
    delete job.shifts

    Vue.set(state.byId, job.id, {
      ...state.byId[job.id],
      ...job,
    })
    if (!state.all.includes(job.id))
      state.all.push(job.id)
  },

  REMOVE_JOB(state: JobsState, jobId: number) {
    Vue.delete(state.byId, jobId)
    Vue.delete(
      state.all,
      state.all.findIndex((id) => id == jobId)
    )
  },

  SET_NEXT_SHIFT(state: JobsState, shift: Shift) {
    state.shifts.next = shift
  },

  ADD_SHIFT(state: JobsState, {shift, jobId}: {
    shift: Shift; jobId: number;
  }) {
    Vue.set(state.shifts.byId, shift.id, shift)
    if (state.shifts.byJobId[jobId]) {
      if (!state.shifts.byJobId[jobId].includes(shift.id))
        state.shifts.byJobId[jobId].push(shift.id)
    }
    else {
      state.shifts.byJobId[jobId] = [shift.id]
    }
  },

  REMOVE_SHIFT(state: JobsState, { shiftId, jobId }: {
    shiftId: number; jobId: number;
  }) {
    Vue.delete(state.shifts.byId, shiftId)
    if (state.shifts.byJobId[jobId]) {
      const index = state.shifts.byJobId[jobId].indexOf(shiftId)
      if (index >= 0) {
        if (state.shifts.byJobId[jobId].length == 1) {
          delete state.shifts.byJobId[jobId]
        } else {
          Vue.delete(
            state.shifts.byJobId[jobId],
            index
          )
        }
      }
    }
  },
}

const getters = {
  job: (state: JobsState, getters: any) => (jobId: number) => {
    const job = state.byId[jobId]

    if (job) {
      job.shifts = state.shifts.byJobId[jobId]
        ?.map((shiftId: number) => getters.shift(shiftId))
    }

    return job
  },

  jobs: (state: JobsState, getters: any) => {
    return state.all.map((id: number) => getters.job(id))
  },

  directJobs: (_state: JobsState, getters: any) => {
    return getters.jobs.filter((job: Job) => job.direct)
  },

  indirectJobs: (_state: JobsState, getters: any) => {
    return getters.jobs.filter((job: Job) => !job.direct)
  },

  shift: (state: JobsState) => (id: number) => {
    return state.shifts.byId[id]
  },

  nextShift: (state: JobsState) => {
    if (!state.shifts.next) return {}

    const begin = new Date(state.shifts.next.time_begin),
      end = new Date(state.shifts.next.time_end),
      now = new Date()

    const shiftActive = begin <= now && now <= end

    return {
      ...state.shifts.next,
      time_begin: begin,
      time_end: end,
      shiftActive,
    }
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}
