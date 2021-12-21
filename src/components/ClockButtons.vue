<template lang="pug">
.clock-buttons
  clock-in-dialog(:opened.sync='clockInDialog' :shift='shift')

  .mb-4.d-flex.flex-row.justify-center

    v-expand-x-transition
      div(v-if='!onBreak')
        v-btn.mr-2(
          @click='clocked ? clockOut() : openVerifyDialog()'
          :loading='togglingClock'
          :disabled='!iAmVerified'
          width='130px'
          raised
          dark
          style='transition: background-color 0.3s'
          :color="clocked ? 'pink' : 'green'"
          :large='large'
          :data-cy="clocked ? 'clock-out-button' : 'clock-in-button'"
        )
          | Clock {{ clocked ? "out" : "in" }}

    v-expand-x-transition
      div(v-if='clocked')
        v-btn(
          @click='toggleBreak(!!onBreak)'
          :loading='togglingBreak'
          :disabled='!iAmVerified'
          width='130px'
          raised
          dark
          style='transition: background-color 0.3s'
          :color="onBreak ? 'green' : 'amber'"
          :large='large'
          :data-cy="onBreak ? 'end-break-button' : 'start-break-button'"
        )
          | {{ onBreak ? "End" : "Start" }} break
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import * as clock from '@/services/clock'
import { Shift } from '@/types/Jobs'
import { ClockAction, ClockEvent } from '@/types/Clock'

import ClockInDialog from '@/views/clock/ClockInDialog.vue'

@Component({
  components: {
    ClockInDialog,
  },
})
export default class ClockButtons extends Vue {
  
  @Prop({ type: Object }) readonly shift!: Shift
  @Prop({ default: false }) readonly large!: boolean

  clockInDialog = false
  togglingClock = false
  togglingBreak = false

  openVerifyDialog() {
    this.clockInDialog = true
  }

  async clockOut() {
    this.togglingClock = true
    await clock.clockOut(this.$store, this.shift.id)
    this.togglingClock = false
  }

  async toggleBreak(breakState: boolean) {
    this.togglingBreak = true
    await clock.toggleBreak(this.$store, breakState)
    this.togglingBreak = false
  }

  get clocked() {
    return this.shift.clock_state != ClockAction.ClockOut
  }

  get onBreak() {
    return this.shift.clock_state == ClockAction.StartBreak
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

}
</script>