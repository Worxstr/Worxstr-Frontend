<template lang="pug">
v-list

  div(v-if='pushNotificationsAvailable')
    v-subheader.text-subtitle-1 Notifications

    v-list-item(two-line)
      v-list-item-content
        v-list-item-title Push notifications
      v-list-item-action
        v-btn(
          text
          color='primary'
          :disabled='permissionStatus === "granted"'
          @click='enablePushNotifications'
        ) {{ permissionStatus === 'granted' ? 'Enabled' : 'Enable' }}

  v-subheader.text-subtitle-1 Appearance

  v-list-item(two-line)
    v-list-item-content
      v-list-item-title Dark theme
    v-list-item-action
      v-select.fit(
        v-model="preferences.darkMode"
        :items="darkPreferenceOptions"
        @change="updateDarkMode"
        dense
        hide-details
      )
    
  v-list-item(two-line v-if='$vuetify.breakpoint.mdAndUp')
    v-list-item-content
      v-list-item-title Mini navigation
    v-list-item-action
      v-switch(
        v-model='preferences.miniNav'
        @change='updateMiniNav'
      )
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { darkMode, miniNav } from '@/services/app'
import { DarkPreference } from '@/util/theme'
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import { showToast } from '@/services/app'
import { requestPushPermission } from '@/services/notifications'

@Component({
  metaInfo: {
    title: 'Settings - Preferences'
  },
})
export default class Preferences extends Vue {

  permissionStatus = ''
  darkPreferenceOptions = [
    {
      text: 'System default',
      value: 'default',
    },
    {
      text: 'Light',
      value: 'light',
    },
    {
      text: 'Dark',
      value: 'dark',
    },
  ]

  async mounted() {
    if (!Capacitor.isNativePlatform()) return
    const { receive } = await PushNotifications.checkPermissions()
    console.log(receive)
    this.permissionStatus = receive
  }


  get preferences() {
    return this.$store.state.app.preferences
  }

  get pushNotificationsAvailable() {
    return Capacitor.isPluginAvailable('PushNotifications')
  }
  
  async enablePushNotifications() {
    const { receive } = await PushNotifications.checkPermissions()
    
    switch (receive) {
      case 'denied':
        showToast(this.$store, {
          text: 'Push notifications are disabled. Please enable them in your device settings.',
        })
        break
      
      default:
        // TODO:
        // requestPushPermission()
        break
    }
  }

  updateDarkMode() {
    darkMode.set(this.$store, this.preferences.darkMode as DarkPreference)
  }

  updateMiniNav() {
    miniNav.toggle(this.$store, this.preferences.miniNav)
  }
}
</script>