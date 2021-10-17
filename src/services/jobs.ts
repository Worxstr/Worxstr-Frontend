/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import { Job, Shift } from '@/types/Jobs'
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

export async function loadJob({ commit }: any, jobId: number) {
  const { data } = await api({
    method: 'GET',
    url: `jobs/${jobId}`,
  })

  data.job.contractors.forEach((c: User) => {
    commit('ADD_USER', c)
  })

  commit('ADD_JOB', data.job)
  return data
}

export async function createJob({ commit }: any, job: Job) {
  const { data } = await api({
    method: 'POST',
    url: 'jobs',
    data: job,
  })
  commit('ADD_JOB', data)
  return data
}

export async function updateJob({ commit }: any, job: Job) {
  const { data } = await api({
    method: 'PUT',
    url: `jobs/${job.id}`,
    data: job,
  })
  commit('ADD_JOB', data)
  return data
}

export async function closeJob({ commit }: any, jobId: number) {
  await api({
    method: 'PUT',
    url: `jobs/${jobId}/close`,
  })
  commit('REMOVE_JOB', jobId)
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

export async function updateShift({ commit }: any, shift: {
  id: number | null; // TODO: Remove null
  contractor_id: number | null; // TODO:
  site_location: string;
  time_begin: string;
  time_end: string;
}) {
  const { data } = await api({
    method: 'PUT',
    url: `shifts/${shift.id}`,
    data: { shift },
  })
  commit('ADD_SHIFT', data.shift)
  return data
}

export async function deleteShift({ commit }: any, shiftId: number) {
  await api({
    method: 'DELETE',
    url: `shifts/${shiftId}`,
  })
  commit('REMOVE_SHIFT', shiftId)
}