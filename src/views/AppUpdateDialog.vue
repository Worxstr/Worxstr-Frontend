<template lang="pug">
v-dialog(
  v-model='opened'
  max-width='500'
  persistent
)
  v-card.d-flex.flex-column
    v-toolbar.flex-grow-0(flat)
      v-toolbar-title.text-h6 Your app is out of date
      v-spacer
      v-btn(
        icon
        @click='closeDialog'
      )
        v-icon mdi-close

    
    v-card-text.mt-4 Worxstr is still in development, so some features may not work with an older app version.

    v-card-text Current version: {{ currentVersion }}

    v-card-actions
      v-spacer
      v-btn(
        color='primary'
        text
        @click='updateApp'
      )
        v-icon(left) mdi-download
        span Download update
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { AppUpdate } from '@robingenz/capacitor-app-update'
import { Capacitor } from '@capacitor/core'

@Component
export default class AppUpdateDialog extends Vue {
  @Prop({ default: false }) readonly opened!: boolean

  currentVersion = ''

  closeDialog() {
    this.$store.commit('SET_UPDATE_DIALOG_VISIBLE', false)
  }

  mounted() {
    this.getCurrentVersion()
  }

  async getCurrentVersion() {
    const appUpdateInfo = await AppUpdate.getAppUpdateInfo()
    this.currentVersion = appUpdateInfo.currentVersion
  }

  async updateApp() {
    if (Capacitor.getPlatform() === 'android') {
      await AppUpdate.performImmediateUpdate()
    }
    else {
      await AppUpdate.openAppStore()
    }
  }
}
</script>