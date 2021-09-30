<template lang="pug">
  v-container.clock.d-flex.flex-column.flex-md-row-reverse.justify-md-center.align-md-start

    clock-in-dialog(:opened.sync='clockInDialog')

    .clock-display.mx-15.d-flex.align-center.align-md-start.flex-column.justify-center
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
        h6.text-h6.text-center.text-sm-left You have no upcoming shifts. Go have fun! 🎉

    v-card.clock-history.soft-shadow.align-self-center(width='100%' max-width='500px' rounded='lg')

      v-card-title.text-h5.ma-1 Your history

      div(v-if='clockHistory.length')
        clock-events(:events='clockHistory')

        v-card-actions.d-flex.justify-center
          v-btn(text color='primary' @click='loadClockHistory' :loading='loadingHistory')
            v-icon(left dark)  mdi-arrow-down 
            span View {{ clockHistoryCurrentWeek }}

      v-card-text(v-else)
        | No history yet
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import vueAwesomeCountdown from "vue-awesome-countdown"

import { ClockAction, ClockEvent } from '@/definitions/Clock'
import ClockEvents from '@/components/ClockEvents.vue'
import ClockInDialog from './ClockInDialog.vue'
import dayjs from 'dayjs'

Vue.use(vueAwesomeCountdown, "vac");

@Component({
  metaInfo: {
    title: 'Clock'
  },
  components: {
    ClockEvents,
    ClockInDialog,
  },
})
export default class Clock extends Vue {
  
  clockInDialog = false
  togglingClock = false
  togglingBreak = false
  loadingHistory = false

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

  get clockHistoryCurrentWeek() {
    const nextOffset = this.$store.state.clock.history.lastLoadedOffset + 1
    const start = new Date()
    const end = new Date()
    start.setDate(start.getDate() - nextOffset * 7)
    end.setDate(end.getDate() - (nextOffset * 7) + 7)
    return `${dayjs(start).format('MMM DD')} - ${dayjs(end).format('MMM DD')}`
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
    this.clockInDialog = true
  }

  async loadClockHistory() {
    this.loadingHistory = true
    await this.$store.dispatch("loadClockHistory")
    this.loadingHistory = false
  }

}
</script>

<style lang="scss">
.clock-display {
  margin-top: 20vh;
  margin-bottom: 15vh;
  top: 120px;
  position: sticky;
  z-index: 1;
}

.clock-history {
  position: relative !important;
  z-index: 3;
  transform: translate3d(0,0,0)
}
</style>