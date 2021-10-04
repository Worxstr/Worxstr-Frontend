/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { getAuthenticatedUser } from './users'

import { defaultRoute } from '@/definitions/User'

const { commit, dispatch } = store

export async function signIn(email: string, password: string) {
  try {
    const { data } = await axios({
      method: 'POST',
      url: '/auth/login',
      params: {
        include_auth_token: true,
      },
      data: {
        email,
        password,
        remember_me: true,
      },
    })
    // const authToken = data.response?.user?.authentication_token
    // Use authentication token in subsequent requests
    // axios.defaults.headers.common['Authentication-Token'] = authToken
    // Set token in secure storage on iOS/Android
    // await SecureStoragePlugin.set({
    //   key: 'authToken',
    //   value: authToken
    // })
    await getAuthenticatedUser()
    router.push({ name: defaultRoute() })
    return data
  } catch (err) {
    commit('UNSET_AUTHENTICATED_USER')
    return err
  }
}

/*
  accountType: 'contractor' | 'org'
  dwollaCustomerUrl: Customer url returned after Dwolla account registration
  dwollaAuthToken: Auth token used for Dwolla account registration
*/
export async function signUp({
  accountType,
  customer_url,
  password,
  manager_reference,
}: {
  accountType: 'contractor' | 'org';
  customer_url: string;
  password: string;
  manager_reference: string;
}) {
  try {
    const { data } = await axios({
      method: 'POST',
      url: `/auth/sign-up/${accountType}`,
      // headers: {
      //   'Authorization': `Bearer ${dwollaAuthToken}`
      // },
      data: {
        customer_url,
        password,
        manager_reference,
      },
    })
    router.push({ name: 'home' })
    dispatch('showSnackbar', {
      text: 'Check your email to verify your account!',
    })
    return data
  } catch (err) {
    return err
  }
}

export async function signOut() {
  await axios({
    method: 'POST',
    url: `/auth/logout`,
  })
  commit('UNSET_AUTHENTICATED_USER')
  commit('RESET_STATE')
  router.push({ name: 'home' })
}

export async function resetPassword(email: string) {
  await axios({
    method: 'POST',
    url: `/auth/reset`,
    data: {
      email,
    },
  })
}

export async function confirmEmail(token: string) {
  const { data } = await axios({
    method: 'PUT',
    url: `/auth/confirm-email`,
    data: {
      token,
    },
  })
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return data
}

export async function resendEmailConfirmation(email: string) {
  const { data } = await axios({
    method: 'POST',
    url: `/auth/resend-email`,
    data: {
      email,
    },
  })
  dispatch('showSnackbar', { text: 'Confirmation email resent.' })
  return data
}

export async function updatePassword(newPassword: string) {
  const { data } = await axios({
    method: 'PUT',
    url: `/users/reset-password`,
    data: {
      password: newPassword,
    },
  })
  return data
}
