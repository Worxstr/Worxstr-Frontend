<template lang="pug">
.clock-buttons
  clock-in-dialog(:opened.sync='clockInDialog' :shift='shift')
  v-dialog(
    v-model='tasksNotCompletedDialog'
    :fullscreen='$vuetify.breakpoint.smAndDown'
    max-width='500'
    persistent
  )
    v-card.d-flex.flex-column
      v-card-title.headline You haven't completed all your tasks!
      v-card-text Are you sure you want to clock out now?

      v-spacer
      
      v-card-actions
        v-spacer
        v-btn(text @click='tasksNotCompletedDialog = false') Cancel
        v-btn(text color='success' @click='clockOut(true)' data-cy='confirm-clock-out-button') Yes, clock out
        
      v-fade-transition
        v-overlay(v-if='togglingClock' absolute opacity='.2')
          v-progress-circular(indeterminate)

  .d-flex.flex-row.gap-small

    v-expand-x-transition
      div(v-if='!onBreak')
        v-btn(
          @click='clocked ? clockOut() : clockIn()'
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
  tasksNotCompletedDialog = false
  togglingClock = false
  togglingBreak = false

  clockIn() {
    this.clockInDialog = true
  }

  async clockOut(forceOut = false) {
    this.togglingClock = true
    
    const allTasksCompleted = this.shift.tasks.reduce((acc, task) => {
      return acc && task.complete
    }, true)

    try {
      if (!allTasksCompleted && !forceOut) {
        this.tasksNotCompletedDialog = true
      } else {
        await shifts.clockOut(this.$store, this.shift.id)
        this.tasksNotCompletedDialog = false
        this.togglingClock = false
      }
    }
    finally {
      this.togglingClock = false
    }
  }

  async toggleBreak() {
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