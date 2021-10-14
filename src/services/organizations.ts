import axios from 'axios'
import { User } from '@/types/Users'

export async function getMyOrganizaion(_context: any) {
  const { data } = await axios({
    method: 'GET',
    url: '/organizations/me',
  })
  // TODO:
  // commit('ADD_ORGANIZATION', data)
}

export async function updateMyOrganization({ commit }: any) {
  const { data } = await axios({
    method: 'PATCH',
    url: '/organizations/me',
  })
  // TODO:
  // commit('ADD_ORGANIZATION', data)
}

export async function loadWorkforce({ commit }: any) {
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

