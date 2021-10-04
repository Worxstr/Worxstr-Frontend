/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import store from '@/store'
import { Geolocation } from '@capacitor/geolocation'
import { User } from '@/definitions/User'
import usersStore from '@/store/users'

// const { commit } = store

export async function getAuthenticatedUser() {
  const { data } = await axios({
    method: 'GET',
    url: '/users/me',
  })
  commit('SET_AUTHENTICATED_USER', data.authenticated_user)
  return data.authenticated_user
}

export async function loadUser(userId: number) {
  const { data } = await axios({
    method: 'GET',
    url: `/users/${userId}`,
  })
  commit('ADD_USER', data)
}

export async function getUserLocation() {
  const { coords } = await Geolocation.getCurrentPosition()
  const userLocation = {
    lat: coords.latitude,
    lng: coords.longitude,
  }
  commit('SET_USER_LOCATION', userLocation)
  return userLocation
}

export async function locationPermissionGranted() {
  const permissions = await Geolocation.checkPermissions()
  return permissions.location === 'granted'
}

export async function updateContractor(newFields: any, userId: number) {
  const { data } = await axios({
    method: 'PATCH',
    url: `/users/contractors/${userId}`,
    data: newFields,
  })
  commit('ADD_USER', data.event)
}

export async function loadManagers() {
  const { data } = await axios({
    method: 'GET',
    url: `/jobs/managers`,
    params: {
      manager_id: usersStore.state.authenticatedUser?.manager_id || usersStore.state.authenticatedUser?.id,
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

export async function loadWorkforce() {
  const { data } = await axios({
    method: 'GET',
    url: '/organizations/me/users',
  })
  data.users.forEach((u: User) => {
    commit('ADD_USER', u)
    commit('ADD_WORKFORCE_MEMBER', u.id)
  })
  return data
}

export async function addManager(manager: User) {
  const { data } = await axios({
    method: 'POST',
    url: '/users/add-manager',
    data: manager,
  })
  commit('ADD_USER', data)
  commit('ADD_WORKFORCE_MEMBER', data.id)
  return data
}

export async function deleteUser(userId: number) {
  await axios({
    method: 'DELETE',
    url: `/users/${userId}`,
  })
  commit('REMOVE_USER', userId)
}

export async function addContractor(contractor: User) {
  const { data } = await axios({
    method: 'POST',
    url: '/users/add-contractor',
    data: contractor,
  })
  commit('ADD_USER', data)
  commit('ADD_WORKFORCE_MEMBER', data.id)
  return data
}