/* eslint-disable @typescript-eslint/camelcase */
import { Capacitor } from '@capacitor/core'
import { PushNotifications, Token } from '@capacitor/push-notifications'
import { FCM } from '@capacitor-community/fcm'
import { api } from '@/util/axios'

let isRegistering = false // Keep track of whether the user is trying to register or unregister from push
const pushAvailable = Capacitor.isPluginAvailable('PushNotifications')

export async function registerNotifications() {

  if (!pushAvailable) return

  const { receive } = await PushNotifications.checkPermissions()

  if (receive === 'granted' || receive === 'denied') return

  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    isRegistering = true
    PushNotifications.register()
  }
}

export async function unregisterNotifications() {
  isRegistering = false
  PushNotifications.register()
}

if (pushAvailable) {
  PushNotifications.addListener('registration', async (token: Token) => {
    let fcmToken = token.value

    if (Capacitor.getPlatform() === 'ios') {
      // Convert APNS token to FCM token
      const r = await FCM.getToken()
      fcmToken = r.token
    }

    await api({
      method: isRegistering ? 'POST' : 'DELETE',
      url: '/users/notifications',
      data: {
        registration_id: fcmToken
      },
    })
  })
}