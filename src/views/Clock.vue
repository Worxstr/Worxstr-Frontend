<template lang="pug">
  v-container.clock.d-flex.flex-column.flex-md-row-reverse.justify-md-center.align-md-start
    .mx-15.d-flex.align-center.align-md-start.flex-column.justify-center(
      style='margin-top: 20vh; margin-bottom: 15vh; top: 120px; position: sticky'
    )
      div(v-if='nextShift && nextShift.time_begin && nextShift.time_end')
        h6.text-h6.text-center.text-md-left
          | Your shift at
          | {{ nextShift.site_location }}
          | {{ nextShift.shiftActive ? "ends" : "begins" }}
          //- router-link(:to="{ name: 'job', params: { jobId: nextShift.job_id }}")
            | &nbsp;{{ nextShift.site_location }}&nbsp;
          | at

        h3.text-h3.py-2.font-weight-bold.text-center.text-md-left
          | {{
          | (nextShift.shiftActive ? nextShift.time_end : nextShift.time_begin)
          | .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          | .replace(/^0(?:0:0?)?/, "")
          | }}

        p.text-subtitle-2.text-center.text-md-left

          countdown(:end-time='\
          nextShift.shiftActive ? nextShift.time_end : nextShift.time_begin\
          ')
            template(v-slot:process='props')
              span
                | That's in &nbsp;
                span(v-if='props.timeObj.d != 0')
                  | {{ props.timeObj.d }} days,&nbsp;
                span(v-if='props.timeObj.h != 0')
                  | {{ props.timeObj.h }} hours,&nbsp;
                span(v-if='props.timeObj.m != 0')
                  | {{ props.timeObj.m }} minutes, {{ props.timeObj.s }} seconds.
            template(v-slot:finish)
              span That's right now!

        .d-flex.flex-row.justify-center.justify-md-start
          v-dialog(
            v-model='verifyDialog.opened'
            :fullscreen='$vuetify.breakpoint.smAndDown'
            max-width='500'
          )
            v-card.sign-in.fill-height
              form(@submit.prevent='submitCode(verifyDialog.code)')
                v-card-title Scan your clock in QR code

                div
                  v-btn(text @click='requestLocation')
                    v-icon mdi-map-marker-radius
                    span Use geolocation

                div
                  qrcode-stream(v-if='verifyDialog.opened' @decode='submitCode' @init='qrInit')

                v-card-text
                  v-text-field(label='Or enter the code manually' v-model='verifyDialog.code' hide-details)
                v-card-actions
                  v-spacer
                  v-btn(text @click='verifyDialog.opened = false') Cancel
                  v-btn(text color='primary' type='submit' :loading='togglingClock') Submit

              v-fade-transition
                v-overlay(absolute opacity='0.2' v-if='verifyDialog.cameraLoading')
                  v-progress-circular(indeterminate)

          v-expand-x-transition
            .py-2(v-if='!onBreak')
              v-btn.pa-6.mr-2(
                raised
                :color="clocked ? 'pink' : 'green'"
                @click='clocked ? clockOut() : openVerifyDialog()'
                width='130px'
                dark
                style='transition: background-color 0.3s'
                :loading='togglingClock'
              )
                | Clock {{ clocked ? "out" : "in" }}

          v-expand-x-transition
            .py-2(v-if='clocked')
              v-btn.pa-6(
                raised
                :color="onBreak ? 'green' : 'amber'"
                @click='toggleBreak(!!onBreak)'
                width='130px'
                dark
                style='transition: background-color 0.3s'
                :loading='togglingBreak'
              )
                | {{ onBreak ? "End" : "Start" }} break

      div(v-else)
        h6.text-h6 You have no upcoming shifts

    v-card.soft-shadow.align-self-center(width='100%' max-width='500px' rounded='lg' style="margin-bottom: 60px")

      v-card-title.text-h5.ma-1 Your history

      div(v-if='clockHistory.length')
        clock-events(:events='clockHistory')

        v-card-actions.d-flex.justify-center
          v-btn(text color='primary' @click='loadClockHistory')
            v-icon(right dark)  mdi-arrow-down 
            |             Load previous week

      v-card-text(v-else)
        | No history yet
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import vueAwesomeCountdown from "vue-awesome-countdown"
import { QrcodeStream } from "vue-qrcode-reader"

import { Dialog } from '@capacitor/dialog'
import { Geolocation } from '@capacitor/geolocation'

import { ClockAction, ClockEvent } from '@/definitions/Clock'
import ClockEvents from '@/components/ClockEvents.vue'

Vue.use(vueAwesomeCountdown, "vac");

@Component({
  metaInfo: {
    title: 'Clock'
  },
  components: {
    QrcodeStream,
    ClockEvents,
  },
})
export default class Clock extends Vue {
  
  verifyDialog = {
    opened: false,
    cameraLoading: false,
    code: '',
  }

  togglingClock = false
  togglingBreak = false

  mounted() {
    if (!this.clockHistory.length) this.loadClockHistory()
    this.$store.dispatch("loadNextShift")
  }

  get clock() {
    return this.$store.state.clock
  }

  get clockHistory() {
    return this.$store.getters.clockHistory
  }

  get nextShift() {
    return this.$store.getters.nextShift
  }

  get clocked() {
    const lastClockEvent = this.clockHistory.find(
      (event: ClockEvent) => event.action == ClockAction.ClockIn || event.action == ClockAction.ClockOut
    )
    return lastClockEvent ? lastClockEvent.action == ClockAction.ClockIn : null
  }

  get onBreak() {
    const lastBreakEvent = this.clockHistory.find(
      (event: ClockEvent) => event.action == ClockAction.StartBreak || event.action == ClockAction.EndBreak
    )
    return lastBreakEvent ? lastBreakEvent.action == ClockAction.StartBreak : null
  }

  async clockIn(code: string) {
    this.togglingClock = true
    await this.$store.dispatch('clockIn', code)
    console.log('done')
    this.togglingClock = false
  }

  async submitCode(code: string) {
    // TODO: Handle incorrect code
    await this.clockIn(code)
    this.verifyDialog.opened = false
  }

  async clockOut() {
    this.togglingClock = true
    await this.$store.dispatch('clockOut')
    console.log('done')
    this.togglingClock = false
  }

  async toggleBreak(breakState: boolean) {
    this.togglingBreak = true
    await this.$store.dispatch('toggleBreak', breakState)
    this.togglingBreak = false
  }

  openVerifyDialog() {
    this.verifyDialog.opened = true
  }

  async requestLocation() {
    const { coords } = await Geolocation.getCurrentPosition()
    Dialog.alert({
      title: 'Got location',
      message: `Lat: ${coords.latitude}, Long: ${coords.longitude}`
    })
  }

  async qrInit(promise: any) {
    this.verifyDialog.cameraLoading = true
    try {
      /* const { capabilities } = */ await promise
    } catch (error) {
      let errorMessage;
      switch (error.name) {
        case "NotAllowedError":
          errorMessage = 'Camera permission denied'
          break
        case "NotFoundError":
          errorMessage = 'No camera'
          break
        case "NotSupportedError":
          errorMessage = 'Page must be served over HTTPS'
          break
        case "NotReadableError":
          errorMessage = 'Camera in use'
          break
        case "OverconstrainedError":
          errorMessage = 'No front camera'
          break
        case "StreamApiNotSupportedError":
          errorMessage = 'Browser not supported'
          break
      }
      this.$store.dispatch('showSnackbar', { text: errorMessage })
    } finally {
      this.verifyDialog.cameraLoading = false
    }
  }

  loadClockHistory() {
    this.$store.dispatch("loadClockHistory")
  }

}
</script>
