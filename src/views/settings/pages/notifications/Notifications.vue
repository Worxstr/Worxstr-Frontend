<template lang="pug">
.notifications
  v-list
    v-list-item(two-line v-if='pushNotificationsAvailable')
      v-list-item-content
        v-list-item-title Push notifications
        v-list-item-subtitle {{ permissionStatus }}
      v-list-item-action
        v-switch(v-model='pushNotifications' @change='togglePushNotifications')

    v-list-item(two-line)
      v-list-item-content
        v-list-item-title Email alerts
      v-list-item-action
        v-switch(:value='true' disabled)

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { showToast } from '@/services/app'
import { requestPushPermission, loadPreferences } from '@/services/notifications'

@Component
export default class SettingsNotifications extends Vue {

  permissionStatus = ''

  get pushNotifications() {
    return this.$store.state.app.preferences.pushNotifications
  }

  get pushNotificationsAvailable() {
    return Capacitor.isPluginAvailable('PushNotifications')
  }
  
  async togglePushNotifications(val: boolean) {
    if (!val) return

    const { receive } = await PushNotifications.checkPermissions()
    
    switch (receive) {
      case 'granted':
        // TODO: Send request to server to enable push notifications
        break

      case 'denied':
        showToast(this.$store, {
          text: 'Push notifications are disabled. Please enable them in your device settings.',
        })
        break
      
      default:
        requestPushPermission()
        break
    }
  }

  async mounted() {
    // Load notifications preferences into state
    loadPreferences()

    if (!Capacitor.isNativePlatform()) return
    const { receive } = await PushNotifications.checkPermissions()
    console.log(receive)
    this.permissionStatus = receive
  }

}
</script>