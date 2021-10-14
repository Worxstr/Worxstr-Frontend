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

export async function updateMyOrganization({ commit }: any, newData: any) {
  const { data } = await axios({
    method: 'PATCH',
    url: '/organizations/me',
    data: newData,
  })
  commit('ADD_ORGANIZATION', data)
}
