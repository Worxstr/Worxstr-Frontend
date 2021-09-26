<template lang="pug">
v-dialog(
  v-model='opened'
  :fullscreen='$vuetify.breakpoint.smAndDown'
  max-width='400'
)
  v-card.sign-in.fill-height
    form(@submit.prevent='submitCode(verifyDialog.code)')
      v-card-title.text-h6 Verify your presence

      v-card-text

        .d-flex.flex-column
          v-btn(text @click='getUserLocation' x-large)
            v-icon(left) mdi-map-marker-radius
            span Use my location

          v-btn(text @click='getUserLocation' x-large)
            v-icon(left) mdi-qrcode
            span Scan QR code

          v-btn(text @click='getUserLocation' x-large)
            v-icon(left) mdi-form-textbox
            span Enter clock-in code

        //- v-text-field(label='Or enter the code manually' v-model='verifyDialog.code' hide-details)

      div
        qrcode-stream(v-if='verifyDialog.opened' @decode='submitCode' @init='qrInit')

      //- v-card-actions
      //-   v-spacer
      //-   v-btn(text @click='closeDialog') Cancel
      //-   v-btn(text color='primary' type='submit' :loading='togglingClock') Submit

    v-fade-transition
      v-overlay(absolute opacity='0.2' v-if='verifyDialog.cameraLoading')
        v-progress-circular(indeterminate)
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { QrcodeStream } from 'vue-qrcode-reader'

@Component({
  components: {
    QrcodeStream,
  },
})
export default class ClockInDialog extends Vue {
  togglingClock = false
  verifyDialog = {
    opened: false,
    cameraLoading: false,
    code: '',
  }

  @Prop({ default: false }) readonly opened!: boolean

  @Watch('opened')
  async onOpened(opened: boolean) {
    if (opened) {
      const userHasAllowedLocationPermission = await this.$store.dispatch(
        'userHasAllowedLocationPermission'
      )

      if (userHasAllowedLocationPermission) {
        const userLocation = await this.$store.dispatch('getUserLocation')
        console.log('Already got location, clocking in')
        // TODO: Fire clock in request with user location
      }

      const userHasAllowedCameraPermission = false
      if (userHasAllowedCameraPermission) {
        console.log('Opening camera')
        // TODO: Switch to camera input mode
      }
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
    console.log(location)
    // TODO: Clock in with location
    // Dialog.alert({
    //   title: 'Got location',
    //   message: `Lat: ${coords.latitude}, Long: ${coords.longitude}`,
    // })
  }

  async qrInit(promise: any) {
    this.verifyDialog.cameraLoading = true
    try {
      /* const { capabilities } = */ await promise
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
      this.$store.dispatch('showSnackbar', { text: errorMessage })
    } finally {
      this.verifyDialog.cameraLoading = false
    }
  }
}
</script>
