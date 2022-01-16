/* eslint-disable @typescript-eslint/camelcase */
import { Capacitor } from '@capacitor/core'
import { PushNotificationSchema, ActionPerformed, PushNotifications, Token } from '@capacitor/push-notifications'
import { FCM } from '@capacitor-community/fcm'
import { api } from '@/util/axios'
import router from '@/router'

let isRegistering = false // Keep track of whether the user is trying to register or unregister from push
const pushAvailable = Capacitor.isPluginAvailable('PushNotifications')

export async function registerNotifications() {

  if (!pushAvailable) return

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

  PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
    // TODO: Show some kind of popup for notifications in-app
    console.log(JSON.stringify(notification))
  })

  PushNotifications.addListener('pushNotificationActionPerformed', ({ actionId, inputValue, notification }: ActionPerformed) => {
  
    if (notification?.data?.route) {
      // Take a vue route and push it
      const route = JSON.parse(notification.data.route)
      router.push(route)
    }

  })
}