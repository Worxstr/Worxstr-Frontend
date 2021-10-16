/* eslint-disable @typescript-eslint/camelcase */
import Vue from 'vue'
import { Job, Shift } from '@/types/Jobs'
import { addContractor } from '@/services/users'
import usersStore from '@/store/users'
import { User } from '@/types/Users'

export interface JobsState {
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

export const initialState = (): JobsState => ({
  all: [],
  byId: {},
  shifts: {
    next: null,
    all: [],
    byId: {},
  },
})

function addShift(state: JobsState, shift: Shift) {
  Vue.set(state.shifts.byId, shift.id, shift)
  if (!state.shifts.all.includes(shift.id))
    state.shifts.all.push(shift.id)
}

const mutations = {

  ADD_JOB(state: JobsState, job: Job) {
    job.shifts?.forEach(shift => {
      addShift(state, shift)
    })
    delete job.shifts

    if (job.contractor_manager) {
      usersStore.mutations.ADD_USER(usersStore.state, job.contractor_manager)
    }
    delete job.contractor_manager
    
    if (job.organization_manager) {
      usersStore.mutations.ADD_USER(usersStore.state, job.organization_manager)
    }
    delete job.organization_manager

    if (job.contractors) {
      job.contractors.forEach((contractor: User) => {
        usersStore.mutations.ADD_USER(usersStore.state, contractor)
      })
    }
    if (job?.managers?.contractor_managers) {
      job.managers.contractor_managers.forEach((manager: User) => {
        usersStore.mutations.ADD_USER(usersStore.state, manager)
      })
    }
    if (job?.managers?.organization_managers) {
      job.managers.organization_managers.forEach((manager: User) => {
        usersStore.mutations.ADD_USER(usersStore.state, manager)
      })
    }

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

  ADD_SHIFT(state: JobsState, shift: Shift) {
    addShift(state, shift)
  },

  REMOVE_SHIFT(state: JobsState, shiftId: number) {
    Vue.delete(state.shifts.byId, shiftId)
    Vue.delete(
      state.shifts.all,
      state.shifts.all.indexOf(shiftId)
    )
  },
}

const getters = {
  // TODO: Get type for rootState
  job: (state: JobsState, getters: any, rootState: any) => (jobId: number) => {
    const job = state.byId[jobId]

    if (job) {
      job.shifts = state.shifts.all
        .map((shiftId: number) => {
          return getters.shift(shiftId)
        })
        .filter((shift: Shift) => {
          return shift.job_id === jobId
        })
      
      job.contractor_manager = rootState.users.byId[job.contractor_manager_id]
      job.organization_manager = rootState.users.byId[job.organization_manager_id]
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