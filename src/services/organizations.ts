import axios from 'axios'
import { User } from '@/types/Users'

export async function getMyOrganization({ commit }: any) {
  const { data } = await axios({
    method: 'GET',
    url: '/organizations/me',
  })
  commit('ADD_ORGANIZATION', data)
  commit('SET_MY_ORGANIZATION', data.id)
}

export async function updateMyOrganization({ commit }: any) {
  const { data } = await axios({
    method: 'PATCH',
    url: '/organizations/me',
  })
  commit('ADD_ORGANIZATION', data)
}

export async function loadWorkforce({ commit }: any) {
  const { data } = await axios({
    method: 'GET',
    url: '/organizations/me/users',
  })
  data.forEach((u: User) => {
    commit('ADD_USER', u)
    commit('ADD_WORKFORCE_MEMBER', u.id)
  })
  return data
}

