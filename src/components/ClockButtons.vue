<template lang="pug">
.clock-buttons
  clock-in-dialog(:opened.sync='clockInDialog')

  .mb-4.d-flex.flex-row.justify-center

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
          :disabled='!iAmVerified'
          :data-cy="clocked ? 'clock-out-button' : 'clock-in-button'"
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
          :disabled='!iAmVerified'
          :data-cy="onBreak ? 'end-break-button' : 'start-break-button'"
        )
          | {{ onBreak ? "End" : "Start" }} break
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import * as clock from '@/services/clock'
import { ClockAction, ClockEvent } from '@/types/Clock'

import ClockInDialog from '@/views/clock/ClockInDialog.vue'

@Component({
  components: {
    ClockInDialog,
  },
})
export default class ClockButtons extends Vue {
  
  clockInDialog = false
  togglingClock = false
  togglingBreak = false

  openVerifyDialog() {
    this.clockInDialog = true
  }

  async clockOut() {
    this.togglingClock = true
    await clock.clockOut(this.$store, this.$store.getters.nextShift?.id)
    this.togglingClock = false
  }

  async toggleBreak(breakState: boolean) {
    this.togglingBreak = true
    await clock.toggleBreak(this.$store, breakState)
    this.togglingBreak = false
  }

  get clocked() {
    return true
    // const lastClockEvent = this.clockHistory.find(
    //   (event: ClockEvent) => event.action == ClockAction.ClockIn || event.action == ClockAction.ClockOut
    // )
    // return lastClockEvent ? lastClockEvent.action == ClockAction.ClockIn : null
  }

  get onBreak() {
    return false
    // const lastBreakEvent = this.clockHistory.find(
    //   (event: ClockEvent) => event.action == ClockAction.StartBreak || event.action == ClockAction.EndBreak
    // )
    // return lastBreakEvent ? lastBreakEvent.action == ClockAction.StartBreak : null
  }

}
</script>