/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import { socket } from '@/util/socket-io'
import { User } from '@/types/Users'
import usersStore from '@/store/users'
import { clearUserData } from './auth'

export async function getMe({ commit }: any) {

  try {
    const { data } = await api({
      method: 'GET',
      url: '/users/me',
    })
    commit('SET_AUTHENTICATED_USER', data.authenticated_user)
    const { fs_uniquifier } = data.authenticated_user
    socket.emit('sign-in', {
      fs_uniquifier
    })
    return data.authenticated_user
  }
  catch (error) {
    if (error.response.status === 401) {
      clearUserData({ commit })
      return {}
    }
  }
}

export async function loadUser({ commit }: any, userId: number) {
  const { data } = await api({
    method: 'GET',
    url: `/users/${userId}`,
  })
  commit('ADD_USER', data)
}

export async function loadWorkforce({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: '/users/organizations/me',
  })
  data.users.forEach((u: User) => {
    commit('ADD_USER', u)
    commit('ADD_WORKFORCE_MEMBER', u.id)
  })
  return data
}

export async function updateContractor({ commit }: any, newFields: any, userId: number) {
  const { data } = await api({
    method: 'PATCH',
    url: `/users/contractors/${userId}`,
    data: newFields,
  })
  commit('ADD_USER', data.event)
}

export async function retryDwollaPersonalVerification({ commit }: any, newData: any) {
  const { data } = await api({
    method: 'PUT',
    url: '/users/retry',
    data: newData,
  })
  commit('ADD_USER', data)
}

export async function loadManagers({ commit }: any) {
  const me = usersStore.getters.me(usersStore.state)
  const { data } = await api({
    method: 'GET',
    url: `/jobs/managers`,
    params: {
      manager_id: me?.manager_id || me?.id,
    },
  })
  data.contractor_managers.forEach((m: User) => {
    commit('ADD_MANAGER', { type: 'contractor', manager: m })
  })
  data.organization_managers.forEach((m: User) => {
    commit('ADD_MANAGER', { type: 'organization', manager: m })
  })
  return data
}

export async function addManager({ commit }: any, manager: User) {
  const { data } = await api({
    method: 'POST',
    url: '/users/add-manager',
    data: manager,
  })
  commit('ADD_USER', data)
  commit('ADD_WORKFORCE_MEMBER', data.id)
  return data
}

export async function deleteUser({ commit }: any, userId: number) {
  await api({
    method: 'DELETE',
    url: `/users/${userId}`,
  })
  commit('REMOVE_USER', userId)
}

export async function addContractor({ commit }: any, contractor: User) {
  const { data } = await api({
    method: 'POST',
    url: '/users/add-contractor',
    data: contractor,
  })
  commit('ADD_USER', data)
  commit('ADD_WORKFORCE_MEMBER', data.id)
  return data
}