/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Job, Shift } from '@/definitions/Job'
import { User } from '@/definitions/User'

interface JobsState {
  all: number[];
  byId: {
    [key: number]: Job;
  };
  shifts: {
    next: Shift | null;
    all: number[];
    byId: {
      [key: number]: Shift;
    };
  };
}

const initialState = (): JobsState => ({
  all: [],
  byId: {},
  shifts: {
    next: null,
    // TODO: Flatten shift data from jobs
    all: [],
    byId: {},
  },
})

const mutations = {
  ADD_JOB(state: JobsState, { job, authenticatedUser }: { job: Job; authenticatedUser: User }) {
    Vue.set(state.byId, job.id, {
      ...state.byId[job.id],
      ...job,
      direct: (
        authenticatedUser?.id === job.organization_manager_id ||
        authenticatedUser?.id === job.contractor_manager_id
      )
    })
    if (!state.all.includes(job.id)) state.all.push(job.id)
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

  ADD_SHIFT(state: JobsState, { shift, jobId }: { shift: Shift; jobId: number }) {
    state.byId[jobId].shifts.push(shift)
    // TODO: Flatten shift data from jobs
    // Vue.set(state.shifts.byId, shift.id, shift)
    // if (!state.shifts.all.includes(shift.id))
    //   state.shifts.all.push(shift.id)
  },

  REMOVE_SHIFT(state: JobsState, { jobId, shiftId }: { jobId: number; shiftId: number }) {
    state.byId[jobId].shifts = state.byId[jobId].shifts.filter(
      (shift: Shift) => shift.id != shiftId
    )
  },
}

const getters = {
  job: (state: JobsState) => (id: number) => {
    const job = state.byId[id]

    // if (job && job.shifts)
    //   job.shifts = job.shifts.map(shiftId => {
    //     return getters.shift(shiftId)
    //   })

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

  shifts: (state: JobsState, getters: any) => {
    return state.shifts.all.map((id: number) => getters.shift(id))
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