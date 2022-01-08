/* eslint-disable @typescript-eslint/camelcase */
import { Capacitor } from '@capacitor/core'
import { PushNotifications, Token } from '@capacitor/push-notifications'
import { FCM } from '@capacitor-community/fcm'
import { api } from '@/util/axios'

const pushAvailable = Capacitor.isPluginAvailable('PushNotifications')

async function postToken(token: string) {
  console.log('token: posting token')
  await api({
    method: 'POST',
    url: '/users/notifications',
    data: {
      registration_id: token
    },
  })
}

if (pushAvailable) {
  PushNotifications.addListener('registration', async (token: Token) => {
    if (Capacitor.getPlatform() === 'ios') {
      // Convert APNS token to FCM token
      const r = await FCM.getToken()
      postToken(r.token)
    } else {
      postToken(token.value)
    }
  })
}

export async function requestPushPermission() {
  if (!pushAvailable) return

  console.log('token: requesting push permission')

  const { receive } = await PushNotifications.checkPermissions()

  if (receive === 'granted' || receive === 'denied') return

  console.log('token: not granted or denied yet, continuing')

  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    console.log('token: permission granted, registering')
    PushNotifications.register()
  }
}
