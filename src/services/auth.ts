/* eslint-disable @typescript-eslint/camelcase */
import axios from 'axios'
import router from '@/router'
import { getAuthenticatedUser } from './users'
import { sandboxMode, showToast } from '@/services/app'
import { defaultRoute } from '@/definitions/User'

export function shouldUseSandbox(email: string) {
  return email.includes('+test')
}

export async function signIn({ commit }: any, email: string, password: string) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(email))

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
    await getAuthenticatedUser({ commit })
    router.push({ name: defaultRoute() })
    return data
  } catch (err) {
    if ((err as any).response.status === 400) {
      // Already signed in
      await getAuthenticatedUser({ commit })
      router.push({ name: defaultRoute() })
    }
    else {
      commit('UNSET_AUTHENTICATED_USER')
      return err
    }
  }
}

/*
  accountType: 'contractor' | 'org'
  dwollaCustomerUrl: Customer url returned after Dwolla account registration
  dwollaAuthToken: Auth token used for Dwolla account registration
*/
export async function signUp({ commit }: any, {
  email,
  accountType,
  customer_url,
  password,
  manager_reference,
}: {
  email: string;
  accountType: 'contractor' | 'org';
  customer_url: string;
  password: string;
  manager_reference: string;
}) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(email))
  
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
    showToast({ commit }, {
      text: 'Check your email to verify your account!',
    })
    return data
  } catch (err) {
    return err
  }
}

export async function signOut({ state, commit }: any) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(state.users.authenticatedUser.email))

  await axios({
    method: 'POST',
    url: `/auth/logout`,
  })
  commit('UNSET_AUTHENTICATED_USER')
  commit('RESET_STATE')
  router.push({ name: 'home' })
}

export async function sendResetPasswordEmail(context: any, email: string) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

  await axios({
    method: 'POST',
    url: `/auth/reset`,
    data: {
      email,
    },
  })
}

export async function resetPassword(context: any, token: string, email: string, newPassword: string) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

  const response = await axios({
    method: 'POST',
    url: `auth/reset/${token}`,
    data: {
      password: newPassword,
      password_confirm: newPassword,
    }
  })
  if (response.status === 200) {
    await getAuthenticatedUser(context)
    router.push({
      name: defaultRoute()
    })
  }
  else {
    console.log(response)
  }
}

export async function confirmEmail(context: any, token: string, email: string) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

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

export async function resendEmailConfirmation({ commit }: any, email: string) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(email))

  const { data } = await axios({
    method: 'POST',
    url: `/auth/resend-email`,
    data: {
      email,
    },
  })
  showToast({ commit }, { text: 'Confirmation email resent.' })
  return data
}

export async function updatePassword({ commit, state }: any, newPassword: string) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(state.users.authenticatedUser.email))

  const { data } = await axios({
    method: 'PUT',
    url: `/users/reset-password`,
    data: {
      password: newPassword,
    },
  })
  return data
}
