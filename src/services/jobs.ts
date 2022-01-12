/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import { Job, Shift, Task } from '@/types/Jobs'
import { User } from '@/types/Users'

export async function loadJobs({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: 'jobs',
  })
  data.jobs.forEach((job: Job) => {
    // TODO: Normalize nested data
    commit('ADD_JOB', job)
  })
  return data
}

// TODO: Use generalized normalizer functions
// TODO: https://github.com/paularmstrong/normalizr
function normalizeJob(commit: any, job: any) {

  // Normalize shifts
  if (job.shifts) {
    job.shifts = job.shifts.map((shift: any) => {
      commit('ADD_SHIFT', shift)
      return shift.id
    })
  }

  // Normalize contractors
  if (job.contractors) {
    job.contractors = job.contractors.map((contractor: User) => {
      commit('ADD_USER', contractor)
      return contractor.id
    })
  }
  // Normalize managers
  if (job.contractor_manager) {
    commit('ADD_USER', job.contractor_manager)
    job.contractor_manager_id = job.contractor_manager.id
  }
  
  if (job.organization_manager) {
    commit('ADD_USER', job.organization_manager)
    job.organization_manager_id = job.organization_manager.id
  }
  if (job.managers?.contractor_managers) {
    job.managers.contractor_managers = job.managers.contractor_managers.map((manager: User) => {
      commit('ADD_USER', manager)
      return manager.id
    })
  }
  if (job.managers?.organization_managers) {
    job.managers.organization_managers = job.managers.organization_managers.map((manager: User) => {
      commit('ADD_USER', manager)
      return manager.id
    })
  }

  commit('ADD_JOB', job)
}

export async function loadJob({ commit }: any, jobId: number) {
  const { data } = await api({
    method: 'GET',
    url: `jobs/${jobId}`,
  })

  normalizeJob(commit, data.job)
  return data.job
}

export async function createJob({ commit }: any, job: Job) {
  const { data } = await api({
    method: 'POST',
    url: 'jobs',
    data: job,
  })
  normalizeJob(commit, data)
  return data
}

export async function updateJob({ commit }: any, job: Job) {
  const { data } = await api({
    method: 'PUT',
    url: `jobs/${job.id}`,
    data: job,
  })
  normalizeJob(commit, data)
  return data
}

export async function closeJob({ commit }: any, jobId: number) {
  await api({
    method: 'PUT',
    url: `jobs/${jobId}/close`,
  })
  commit('REMOVE_JOB', jobId)
}

export async function refreshClockInCode({ commit }, jobId: number) {
  const { data } = await api({
    method: 'PUT',
    url: `jobs/${jobId}/code`,
  })
  commit('ADD_JOB', data)
}
