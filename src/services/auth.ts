/* eslint-disable @typescript-eslint/camelcase */
import { api } from '@/util/axios'
import router from '@/router'
import { getMe } from './users'
import { sandboxMode, showToast } from '@/services/app'
import { defaultRoute } from '@/types/Users'
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin'
import { Capacitor } from '@capacitor/core'
import usersStore from '@/store/users'
import { socket } from '@/util/socket-io'
import { hashColor } from '@/util/helpers'
import { requestPushPermission } from '@/services/notifications'


export function shouldUseSandbox(email: string) {
  return email?.includes('+test')
}

// Determine if we should use local storage API for authentication
// This can be used as a fallback for when cookies can't be used,
// namely in the native mobile app and in our testing environment
function shouldUseLocalstorageAuth() {
  return Capacitor.isNativePlatform() ||
         process.env.VUE_APP_TEST_MODE === 'true'
}

export async function getAuthToken() {
  if (!shouldUseLocalstorageAuth()) return
  try {
    return (await SecureStoragePlugin.get({ key: 'authToken' })).value
  } catch (error) {
    return null
  }
}

export async function setAuthToken(authToken: string) {
  if (!shouldUseLocalstorageAuth()) return
  api.defaults.headers.common['Authentication-Token'] = authToken

  await SecureStoragePlugin.set({
    key: 'authToken',
    value: authToken,
  })
}

export async function unsetAuthToken() {
  if (!shouldUseLocalstorageAuth()) return
  api.defaults.headers.common['Authentication-Token'] = null
  return await SecureStoragePlugin.remove({ key: 'authToken' })
}

export async function signIn({ commit }: any, email: string, password: string, rememberMe = false) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(email))

  // try {
    const { data } = await api({
      method: 'POST',
      url: '/auth/login',
      params: {
        include_auth_token: true,
      },
      data: {
        email,
        password,
        remember_me: rememberMe,
      },
    })
    const authToken = data?.response?.user?.authentication_token
    if (authToken) {
      setAuthToken(authToken)
    }

    await getMe({ commit })
    router.push({ name: defaultRoute() })

    // Show prompt for notification permission, if user hasn't already granted it
    requestPushPermission()

    return data
}

/*
  accountType: 'contractor' | 'org'
  dwollaCustomerUrl: Customer url returned after Dwolla account registration
  dwollaAuthToken: Auth token used for Dwolla account registration
*/
export async function signUp({ commit }: any, form: any) {
  sandboxMode.toggle({ commit }, shouldUseSandbox(form.email))

  try {
    const { data } = await api({
      method: 'POST',
      url: `/auth/sign-up/${form.accountType}`,
      data: form,
    })
    router.push({ name: 'home' })
    showToast(
      { commit },
      {
        text: 'Check your email to verify your account!',
      }
    )
    return data
  } catch (err) {
    return err
  }
}

export async function clearUserData({ commit }: any) {
  commit('UNSET_AUTHENTICATED_USER')
  commit('RESET_STATE')
  unsetAuthToken()
  socket.emit('sign-out')
}

export async function signOut({ state, commit }: any) {
  sandboxMode.toggle(
    { commit },
    shouldUseSandbox(usersStore.getters.me(usersStore.state)?.email as string)
  )

  await api({
    method: 'POST',
    url: `/auth/logout`,
  })
  clearUserData({ commit })
  router.push({ name: 'home' })
}

export async function sendResetPasswordEmail(context: any, email: string) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

  await api({
    method: 'POST',
    url: `/auth/reset`,
    data: {
      email,
    },
  })
}

export async function resetPassword(
  context: any,
  token: string,
  email: string,
  newPassword: string
) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

  const response = await api({
    method: 'POST',
    url: `auth/reset/${token}`,
    data: {
      password: newPassword,
      password_confirm: newPassword,
    },
  })
  if (response.status === 200) {
    await getMe(context)
    router.push({
      name: defaultRoute(),
    })
  } else {
    console.log(response)
  }
}

export async function confirmEmail(context: any, token: string, email: string) {
  sandboxMode.toggle(context, shouldUseSandbox(email))

  const { data } = await api({
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

  const { data } = await api({
    method: 'POST',
    url: `/auth/resend-email`,
    data: {
      email,
    },
  })
  showToast({ commit }, { text: 'Confirmation email resent.' })
  return data
}

export async function updatePassword(
  { commit, state }: any,
  newPassword: string
) {
  sandboxMode.toggle(
    { commit },
    shouldUseSandbox(state.getters.me(usersStore.state).email)
  )

  const { data } = await api({
    method: 'PUT',
    url: `/users/reset-password`,
    data: {
      password: newPassword,
    },
  })
  return data
}
