<template lang="pug">
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

  v-card.sign-in.fill-height
    v-form.d-flex.flex-column.fill-height(
      ref='form'
      v-model="isValid"
      @submit.prevent='submitCode(code)'
    )
      v-card-title.text-h6 Verify your presence

      v-spacer

      v-card-text

        .d-flex.flex-column
          //- v-btn(text @click='getUserLocation' x-large)
          //-   v-icon(left) mdi-map-marker-radius
          //-   span Use my location

          v-btn(text @click='startScan' x-large v-if='!allowedLocation && !webQrEnabled && !cameraFailed')
            v-icon(left) mdi-qrcode
            span Scan clock-in code

      div(v-if='opened && !allowedLocation && webQrEnabled && !cameraFailed')

        qrcode-stream(@init='webQrInit' @decode='submitCode')
          v-fade-transition
            v-overlay(absolute opacity='0.2' v-if='cameraLoading')
              v-progress-circular(indeterminate)

        v-card-text
          p.text-caption Point your device at your consultant's clock-in QR code.

      v-spacer

      v-card-text
        v-text-field(
          label='Or enter your clock-in code'
          v-model='code'
          dense
          outlined
          maxlength='6'
          :rules='codeRules'
        )

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(text color='primary' type='submit' :loading='loading' :disabled='!isValid') Submit

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Capacitor } from '@capacitor/core'
import { QrcodeStream } from 'vue-qrcode-reader'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

import * as clock from '@/services/clock'
import { getUserLocation, locationPermissionGranted } from '@/services/users'
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
  isValid = false
  webQrEnabled = false
  cameraFailed = false
  allowedCamera = false
  allowedLocation = false
  cameraLoading = false
  hideDialogForQr = false

  codeRules = [
    (code: string) => !!code || 'Please enter your clock-in code',
    (code: string) => (code.length === 6 && code.match(/^-?\d+$/)) || 'Please enter a valid clock-in code',
  ]

  @Prop({ default: false }) readonly opened!: boolean

  get dialogOpened() {
    return this.opened && !this.hideDialogForQr
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async submitCode(code: string) {
    // TODO: Handle incorrect code
    try {
      this.loading = true
      await clock.clockIn(this.$store, code)
      this.closeDialog()
    }
    finally {
      this.loading = false
    }
  }

  @Watch('opened')
  async onOpened(opened: boolean) {
    if (opened) {
      (this.$refs.form as HTMLFormElement)?.reset()
      // this.initLocation()
      this.initQr()
    }
  }

  async initLocation() {
    this.allowedLocation = await locationPermissionGranted(this.$store)

    if (this.allowedLocation) {
      const location = await getUserLocation(this.$store)
      this.$store.dispatch('showSnackbar', {
        text: `${location.lat} ${location.lng}`,
      })
      this.closeDialog()
      // TODO: Fire clock in request with user location
    }
  }

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
      console.log(error)
      this.$store.dispatch('showSnackbar', { text: errorMessage })
    } finally {
      this.cameraLoading = false
    }
  }

  async getUserLocation() {
    const location = await getUserLocation(this.$store)
    this.$store.dispatch('showSnackbar', {
      text: `${location.lat} ${location.lng}`,
    })
    this.closeDialog()
    // TODO: Clock in with location
    // Dialog.alert({
    //   title: 'Got location',
    //   message: `Lat: ${coords.latitude}, Long: ${coords.longitude}`,
    // })
  }

  async webCameraPermissionGranted() {
    const permissionStatus = await navigator.permissions.query({
      name: 'camera',
    })
    return permissionStatus.state === 'granted'
  }

  async nativeCameraPermissionGranted() {
    const status = await BarcodeScanner.checkPermission({ force: true })
    return !!status.granted
  }

  async startScan() {
    if (Capacitor.isNativePlatform()) {

      const nativeCameraPermissionGranted = await this.nativeCameraPermissionGranted()
      if (!nativeCameraPermissionGranted) {
        this.$store.dispatch('showSnackbar', {
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