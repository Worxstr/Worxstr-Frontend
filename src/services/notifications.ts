import { Capacitor } from '@capacitor/core'
import { PushNotifications, Token } from '@capacitor/push-notifications'
import AppStore from '@/store/app'

const pushAvailable = Capacitor.isPluginAvailable('PushNotifications')

if (pushAvailable) {
  PushNotifications.addListener('registration', (token: Token) => {
    
    console.log({token: token.value})
    // TODO: Send token to server

    AppStore.mutations.SET_PUSH_NOTIFICATIONS(AppStore.state, true)
  })
}

export async function requestPushPermission() {
  if (!pushAvailable) return

  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    PushNotifications.register()
  }
}

export async function loadPreferences() {

  // TODO: Query server for notifications settings

  AppStore.mutations.SET_PUSH_NOTIFICATIONS(AppStore.state, true)

  return false
}