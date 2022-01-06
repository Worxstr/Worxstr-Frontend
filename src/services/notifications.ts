import { PushNotifications, Token } from '@capacitor/push-notifications'

export async function requestPushPermission() {
  const permission = await PushNotifications.requestPermissions()

  if (permission.receive === 'granted') {
    PushNotifications.register()
  }
}

PushNotifications.addListener('registration', (token: Token) => {
  console.log({token: token.value})
})