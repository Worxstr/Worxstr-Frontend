/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import { Job, Shift } from '@/definitions/Job'
import { User } from '@/definitions/User'
import usersStore from '@/store/users'

export async function loadJobs({ commit }: any) {
  const { data } = await axios({
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
  const { data } = await axios({
    method: 'GET',
    url: `jobs/${jobId}`,
  })

  // Flatten shift data
  // data.job.shifts = data.job.shifts.map(shift => {
  //   commit('ADD_SHIFT', shift)
  //   return shift.id
  // })

  data.job.contractors.forEach((c: User) => {
    commit('ADD_USER', c)
  })

  commit('ADD_JOB', data.job)
  return data
}

export async function createJob({ commit }: any, job: Job) {
  const { data } = await axios({
    method: 'POST',
    url: 'jobs',
    data: job,
  })
  commit('ADD_JOB', data)
  return data
}

export async function updateJob({ commit }: any, job: Job) {
  const { data } = await axios({
    method: 'PUT',
    url: `jobs/${job.id}`,
    data: job,
  })
  commit('ADD_JOB', data)
  return data
}

export async function closeJob({ commit }: any, jobId: number) {
  await axios({
    method: 'PUT',
    url: `jobs/${jobId}/close`,
  })
  commit('REMOVE_JOB', jobId)
}

export async function createShift({ commit }: any, shift: Shift, jobId: number) {
  const { data } = await axios({
    method: 'POST',
    url: 'shifts',
    data: shift,
    params: { job_id: jobId },
  })
  data.shifts.forEach((shift: Shift) => {
    commit('ADD_SHIFT', { shift, jobId })
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
  const { data } = await axios({
    method: 'PUT',
    url: `shifts/${shift.id}`,
    data: { shift },
  })
  commit('REMOVE_SHIFT', { shiftId: shift.id, jobId: data.shift.job_id })
  commit('ADD_SHIFT', { shift: data.shift, jobId: data.shift.job_id })
  return data
}

export async function deleteShift({ commit }: any, shiftId: number, jobId: number) {
  await axios({
    method: 'DELETE',
    url: `shifts/${shiftId}`,
  })
  commit('REMOVE_SHIFT', { shiftId, jobId })
}