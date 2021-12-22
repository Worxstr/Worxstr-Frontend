/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Job, Shift } from '@/types/Jobs'

export interface JobsState {
  all: number[];
  byId: {
    [key: number]: Job;
  };
}

export const initialState = (): JobsState => ({
  all: [],
  byId: {},
})

const mutations = {
  ADD_JOB(state: JobsState, job: Job) {
    Vue.set(state.byId, job.id, {
      ...state.byId[job.id],
      ...job,
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
}

const getters = {
  // TODO: Get type for rootState
  job: (state: JobsState, getters: any, rootState: any) => (jobId: number) => {

    const job = {...state.byId[jobId]}

    if (!job) return undefined

    if (job.shifts) {
      job.shifts = job.shifts.map((shiftId: number) => {
        const shift = {...getters.shift(shiftId)}
        return shift
      })
    }

    if (job.contractors) {
      job.contractors = job.contractors.map((contractorId: number) => {
        const contractor = {...getters.user(contractorId)}
        return contractor
      })
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
}

export default {
  state: initialState(),
  mutations,
  getters,
}
