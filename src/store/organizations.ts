import Vue from 'vue'
import { Organization } from '@/types/Organizations'

export interface OrganizationsState {
  all: number[]
  byId: {
    [key: number]: Organization
  }
  myOrganization: number | null
}

export const initialState = (): OrganizationsState => ({
  all: [],
  byId: {},
  myOrganization: null,
})

const mutations = {
  ADD_ORGANIZATION(state: OrganizationsState, organization: Organization) {
    Vue.set(state.byId, organization.id, organization)
    if (!state.all.includes(organization.id))
      state.all.push(organization.id)
  },

  SET_MY_ORGANIZATION(state: OrganizationsState, organizationId: number) {
    state.myOrganization = organizationId
  },
}

const getters = {
  organization: (state: OrganizationsState) => (organizationId: number) => {
    return state.byId[organizationId]
  },

  myOrganization: (state: OrganizationsState) => {
    if (!state.myOrganization) return null
    return state.byId[state.myOrganization]
  },
}

export default {
  state: initialState(),
  mutations,
  getters,
}