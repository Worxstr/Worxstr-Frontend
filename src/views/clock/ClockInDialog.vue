<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='400'
  persistent
  :class='{transparent}'
)
  v-card.sign-in.fill-height
    v-form.d-flex.flex-column.fill-height(ref='form' @submit.prevent='submitCode(code)')
      v-card-title.text-h6 Verify your presence

      v-spacer

      v-card-text

        .d-flex.flex-column
          v-btn(text @click='getUserLocation' x-large)
            v-icon(left) mdi-map-marker-radius
            span Use my location

          v-btn(text @click='startScan' x-large v-if='!allowedLocation && !webQrEnabled && !cameraFailed')
            v-icon(left) mdi-qrcode
            span Scan clock-in code


      div(v-if='opened && !allowedLocation && webQrEnabled && !cameraFailed')

        qrcode-stream( @init='qrInit' @decode='submitCode')
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
          :rules='codeRules'
        )

      v-card-actions
        v-spacer
        v-btn(text @click='closeDialog') Cancel
        v-btn(text color='primary' type='submit' :loading='togglingClock') Submit

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Capacitor } from '@capacitor/core'
import { QrcodeStream } from 'vue-qrcode-reader'
import { BarcodeScanner } from '@capacitor-community/barcode-scanner'

@Component({
  components: {
    QrcodeStream,
  },
})
export default class ClockInDialog extends Vue {
  code = ''
  webQrEnabled = false
  cameraFailed = false
  allowedCamera = false
  allowedLocation = false
  togglingClock = false
  cameraLoading = false
  hideDialogForQr = false

  codeRules = [
    (code: string) => !!code || 'Please enter your clock-in code',
    (code: string) => code.length === 6 && code.match(/^-?\d+$/) || 'Please enter a valid clock-in code',
  ]

  @Prop({ default: false }) readonly opened!: boolean

  @Watch('opened')
  async onOpened(opened: boolean) {
    if (opened) {
      (this.$refs.form as HTMLFormElement)?.reset()
      this.initLocation()
      this.initQr()
    }
  }

  async initLocation() {
    this.allowedLocation = await this.$store.dispatch(
      'locationPermissionGranted'
    )

    if (this.allowedLocation) {
      const location = await this.$store.dispatch('getUserLocation')
      this.$store.dispatch('showSnackbar', {
        text: `${location.lat} ${location.lng}`,
      })
      this.closeDialog()
      // TODO: Fire clock in request with user location
    }
  }

  async initQr() {
    if (Capacitor.isNativePlatform()) {
      BarcodeScanner.prepare()
    } else {
      const webCameraPermissionGranted = await this.webCameraPermissionGranted()
      console.log({webCameraPermissionGranted})
      if (webCameraPermissionGranted) {
        this.webQrEnabled = true
      }
    }

    if (this.allowedCamera) {
      console.log('Opening camera')
      // TODO: Switch to camera input mode
    }
  }

  closeDialog() {
    this.$emit('update:opened', false)
  }

  async submitCode(code: string) {
    // TODO: Handle incorrect code
    await this.clockIn(code)
    this.closeDialog()
  }

  async clockIn(code: string) {
    this.togglingClock = true
    await this.$store.dispatch('clockIn', code)
    this.togglingClock = false
  }

  async getUserLocation() {
    const location = await this.$store.dispatch('getUserLocation')
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

  async startScan() {
    if (Capacitor.isNativePlatform()) {

      const nativeCameraPermissionGranted = await this.nativeCameraPermissionGranted()
      if (!nativeCameraPermissionGranted) {
        this.$store.dispatch('showSnackbar', {
          text: 'Camera permission is not granted'
        })
        return
      }
      BarcodeScanner.hideBackground() // make background of WebView transparent
      document.body.style.display = 'none'

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
    BarcodeScanner.showBackground()
    BarcodeScanner.stopScan()
    document.body.style.display = 'block'
  }

  deactivated() {
    this.stopScan()
  }

  beforeDestroy() {
    this.stopScan()
  }

  async qrInit(promise: any) {
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

  async nativeCameraPermissionGranted() {
    const status = await BarcodeScanner.checkPermission({ force: false })
    return !!status.granted
  }

}
</script>