import { api } from '@/util/axios'
import { User } from '@/types/Users'

export async function getMyOrganization({ commit }: any) {
  const { data } = await api({
    method: 'GET',
    url: '/organizations/me',
  })
  commit('ADD_ORGANIZATION', data)
  commit('SET_MY_ORGANIZATION', data.id)
}

export async function updateMyOrganization({ commit }: any, newData: any) {
  const { data } = await api({
    method: 'PATCH',
    url: '/organizations/me',
    data: newData,
  })
  commit('ADD_ORGANIZATION', data)
}

export async function retryDwollaBusinessVerification({ commit }: any, newData: any) {
  const { data } = await api({
    method: 'PUT',
    url: '/organizations/retry',
    data: newData,
  })
  commit('ADD_USER', data)
}
