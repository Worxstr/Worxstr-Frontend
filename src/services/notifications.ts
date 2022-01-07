/* eslint-disable @typescript-eslint/camelcase */
import { Capacitor } from '@capacitor/core'
import { PushNotifications, Token } from '@capacitor/push-notifications'
import AppStore from '@/store/app'
import { api } from '@/util/axios'

const pushAvailable = Capacitor.isPluginAvailable('PushNotifications')

if (pushAvailable) {
  PushNotifications.addListener('registration', async (token: Token) => {
    await api({
      method: 'POST',
      url: '/users/notifications',
      data: {
        registration_id: token.value
      },
    })
  })
}

export async function requestPushPermission() {
  if (!pushAvailable) return

  const { receive } = await PushNotifications.checkPermissions()

  if (receive === 'granted' || receive === 'denied') return

  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    PushNotifications.register()
  }
}
