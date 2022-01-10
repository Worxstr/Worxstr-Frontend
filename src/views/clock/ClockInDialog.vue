`<template lang="pug">
v-dialog(
  id='clock-in-dialog'
  v-model='dialogOpened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='400'
  persistent
)
  portal(to="toolbarActions")
    v-btn(
      v-if='hideDialogForQr'
      text
      :icon='$vuetify.breakpoint.xs'
      color="primary"
      @click='stopScan'
    )
      v-icon(:left='!$vuetify.breakpoint.xs') mdi-close
      span(v-if='!$vuetify.breakpoint.xs') Cancel

  v-card

    .d-flex.justify-center.py-8(v-if='!job || !job.id')
      v-progress-circular(indeterminate)

    v-form.d-flex.flex-column.fill-height(
      v-else
      ref='form'
      v-model="isValid"
      @submit.prevent='clockIn'
    )
      v-card-title.d-flex.flex-column.align-start
        .text-h6 Verify your presence
        .text-caption Clocking in to {{ job.name }}

      v-spacer

      v-card-text

        .d-flex.flex-column
          v-btn.mb-2(
            v-if='job.restrict_by_location'
            @click='getDeviceLocation'
            text
            color='primary'
            outlined
            x-large
            :loading='loadingLocation'
          )
            v-icon(left) mdi-map-marker-radius
            span Use my location

          v-btn(
            v-if='job.restrict_by_code && !webQrEnabled && !cameraFailed'
            @click='startScan'
            text
            color='primary'
            outlined
            x-large
          )
            v-icon(left) mdi-qrcode
            span Scan clock-in code

      div(v-if='opened && job.restrict_by_code && webQrEnabled && !cameraFailed')

        qrcode-stream(@init='webQrInit' @decode='submitCode')
          v-fade-transition
            v-overlay(absolute opacity='0.2' v-if='cameraLoading')
              v-progress-circular(indeterminate)

        v-card-text
          p.text-caption Point your device at your consultant's clock-in QR code.

      v-spacer

      v-card-text
        v-text-field(
          v-if='job.restrict_by_code'
          label='Or enter your clock-in code'
          v-model='code'
          dense
          outlined
          maxlength='6'
          :rules='codeRules'
          data-cy='clock-in-code'
        )

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(
          text
          color='primary'
          type='submit'
          :loading='loading'
          :disabled='!isValid'
          data-cy='submit-clock-in-code-button'
        ) Submit

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Capacitor } from '@capacitor/core'
import { QrcodeStream } from 'vue-qrcode-reader'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'
import * as geolocation from '@/services/geolocation'

import * as clock from '@/services/shifts'
import * as job from '@/services/jobs'
import { showToast } from '@/services/app'
import { Job, Shift } from '@/types/Jobs'

/*
  We are using two difference QR code scanner libraries here.
  vue-qrcode-reader only works on web, and @capacitor-community/barcode-scanner
  works only on native. Depending on the result of Capacitor.isNativePlatform(),
  we will context switch to use the appropriate scanner library.
*/

@Component({
  components: {
    QrcodeStream,
  },
})
export default class ClockInDialog extends Vue {
  code = ''
  loading = false
  loadingJob = false
  loadingLocation = false
  isValid = false
  webQrEnabled = false
  cameraFailed = false
  allowedCamera = false
  allowedLocation = false
  cameraLoading = false
  hideDialogForQr = false

  codeRules = [
    (code: string) => !!code || 'Please enter your clock-in code',
    (code: string) => (code && (code.length === 6 || code.length === 5) && code.match(/^-?\d+$/)) || 'Please enter a valid clock-in code',
  ]

  @Prop({ default: false }) readonly opened!: boolean
  @Prop({ type: Object }) readonly shift!: Shift

  // Some hacky stuff to make the native camera view show in the app

  @Watch('opened')
  async onOpened(opened: boolean) {
    if (opened) {
      (this.$refs.form as HTMLFormElement)?.reset()
      this.initQr()

      if (this.job?.id) this.autoClockIn()

      this.loadingJob = true
      try {
        await job.loadJob(this.$store, this.shift.job_id)
      }
      finally {
        this.loadingJob = false
      }

    }
  }

  get dialogOpened() {
    return this.opened && !this.hideDialogForQr
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  // Logic for form submission

  get job() {
    return this.$store.getters.job(this.shift.job_id)
  }

  @Watch('job')
  onJobLoaded(newVal: Job, oldVal: Job) {
    if (!(oldVal?.id) && newVal?.id && this.dialogOpened) {
      this.autoClockIn()
    }
  }

  autoClockIn() {
    // There are no clock in restrictions, clock in automatically
    if (!this.job.restrict_by_time && !this.job.restrict_by_location && !this.job.restrict_by_code) {
      this.clockIn()
      return
    }

    // If job is active, clock in automatically
    if (this.job.restrict_by_time) {
      const now = (new Date()).getTime()
      const window = this.job.restrict_by_time_window
      const start = (new Date(this.shift.time_begin)).getTime() - (window * 60 * 1000)
      if (now >= start) {
        this.clockIn()
        return
      }
      else {
        if (!this.job.restrict_by_location && !this.job.restrict_by_code) {
          showToast(this.$store, {
            text: 'You can only clock in when this shift is active',
          })
        }
      }
    }
    
    // If user is at job site, clock in automatically
    if (this.job.restrict_by_location) {
      this.getDeviceLocation()
    }
  }

  get deviceLocation() {
    return this.$store.state.users.deviceLocation
  }

  async getDeviceLocation() {
    this.loadingLocation = true

    const location = await geolocation.get(this.$store)

    this.loadingLocation = false
    
    // If location permission was not granted, do not allow
    const permissionGranted = await geolocation.permissionGranted()

    if (!permissionGranted || !this.deviceLocation) {
      showToast(this.$store, {
        text: `Unable to get location. Check your location permissions.`,
      })
      this.loading = false
      return
    }

    this.closeDialog()
    this.clockIn()
  }

  submitCode(code: string) {
    this.code = code
    this.clockIn()
  }

  async clockIn() {
    // TODO: Handle incorrect code
    try {
      this.loading = true
      await clock.clockIn(this.$store, this.shift.id, {
        code: this.code,
        location: this.deviceLocation,
      })
      this.closeDialog()
    }
    finally {
      this.loading = false
    }
  }

  // QR code scanner related methods

  async initQr() {
    if (!Capacitor.isNativePlatform()) {
      const webCameraPermissionGranted = await this.webCameraPermissionGranted()
      if (webCameraPermissionGranted) {
        this.webQrEnabled = true
      }
    }
  }

  async webQrInit(promise: any) {
    this.cameraLoading = true
    try {
      /* const { capabilities } = */ await promise
      this.webQrEnabled = true
    } catch (error) {
      let errorMessage
      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera permission denied'
          break
        case 'NotFoundError':
          errorMessage = 'No camera'
          break
        case 'NotSupportedError':
          errorMessage = 'Page must be served over HTTPS'
          break
        case 'NotReadableError':
          errorMessage = 'Camera in use'
          break
        case 'OverconstrainedError':
          errorMessage = 'No front camera'
          break
        case 'StreamApiNotSupportedError':
          errorMessage = 'Browser not supported'
          break
      }
      this.cameraFailed = true
      showToast(this.$store, { text: errorMessage })
    } finally {
      this.cameraLoading = false
    }
  }

  async webCameraPermissionGranted() {
    const permissionStatus = await navigator.permissions.query({
      name: 'camera',
    })
    return permissionStatus.state === 'granted'
  }

  async nativeCameraPermissionGranted() {
    if (!Capacitor.isNativePlatform()) return false
    const status = await BarcodeScanner.checkPermission({ force: true })
    return !!status.granted
  }

  async startScan() {
    if (Capacitor.isNativePlatform()) {

      const nativeCameraPermissionGranted = await this.nativeCameraPermissionGranted()
      if (!nativeCameraPermissionGranted) {
        showToast(this.$store, {
          text: 'Camera permission is not granted'
        })
        return
      }
      this.toggleWebview(false)

      const result = await BarcodeScanner.startScan() // start scanning and wait for a result

      // if the result has content
      if (result.hasContent && result.content) {
        this.stopScan()
        this.submitCode(result.content)
      }
    }
    else {
      this.webQrEnabled = true
    }
  }

  stopScan() {
    if (Capacitor.isNativePlatform())
      BarcodeScanner.stopScan()
    this.toggleWebview(true)
  }

  toggleWebview(visible: boolean) {
    this.hideDialogForQr = !visible
    if (visible) {
      document.getElementById('router-view')!.classList.remove('webview-transparent')
      document.getElementById('main')!.classList.remove('webview-transparent')
      document.getElementById('app')!.classList.remove('no-bg')
    }
    else {
      document.getElementById('router-view')!.classList.add('webview-transparent')
      document.getElementById('main')!.classList.add('webview-transparent')
      document.getElementById('app')!.classList.add('no-bg')
    }
  }

  deactivated() {
    this.stopScan()
  }

  beforeDestroy() {
    this.stopScan()
  }
}
</script>

<style lang="scss">
  .v-main, .v-main__wrap, .v-main__wrap > container {
    background: transparent !important;
  }
</style>