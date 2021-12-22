<template lang="pug">
.clock-buttons
  clock-in-dialog(:opened.sync='clockInDialog' :shift='shift')

  .d-flex.flex-row.justify-center.gap-small

    v-expand-x-transition
      div(v-if='!onBreak')
        v-btn(
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
          @click='toggleBreak'
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
import * as shifts from '@/services/shifts'
import { Shift } from '@/types/Jobs'
import { ClockAction } from '@/types/Clock'

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
    await shifts.clockOut(this.$store, this.shift.id)
    this.togglingClock = false
  }

  async toggleBreak() {
    console.log(this.shift.id)
    this.togglingBreak = true
    await shifts.toggleBreak(this.$store, this.shift.id, !this.onBreak)
    this.togglingBreak = false
  }

  get clocked() {
    if (this.shift.clock_state === null) return false
    return this.shift.clock_state != ClockAction.ClockOut
  }

  get onBreak() {
    if (this.shift.clock_state === null) return false
    return this.shift.clock_state == ClockAction.StartBreak
  }

  get iAmVerified() {
    return this.$store.getters.iAmVerified
  }

}
</script>