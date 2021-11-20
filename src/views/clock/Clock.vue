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
          | (nextShift.shiftActive ? (new Date(nextShift.time_end)) : (new Date(nextShift.time_begin)))
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
                :disabled='!iAmVerified'
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
              )
                | {{ onBreak ? "End" : "Start" }} break

      div(v-else-if='!loadingNextShift')
        h6.text-h6.text-center.text-sm-left You have no upcoming shifts. Go have fun! 🎉
      
      div(
        v-else
        style='width: 300px'
      )
        v-skeleton-loader(type='sentences')

    v-card.clock-history.soft-shadow.align-self-center(width='100%' max-width='500px' rounded='lg')

      v-card-title.text-h5.ma-1 Your history

      div(v-if='clockHistory.length')
        clock-events(:events='clockHistory')

        v-card-actions.d-flex.justify-center
          v-btn(text color='primary' @click='loadClockHistory' :loading='loadingHistory')
            v-icon(left dark)  mdi-arrow-down 
            span View {{ clockHistoryCurrentWeek }}

      .px-4(v-else-if='loadingHistory')
        v-skeleton-loader.py-2(v-for='i in 10' key='item' type="sentences")

      v-card-text(v-else)
        | No history yet
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import vueAwesomeCountdown from "vue-awesome-countdown"

import * as clock from '@/services/clock'
import { ClockAction, ClockEvent } from '@/types/Clock'
import ClockEvents from '@/components/ClockEvents.vue'
import ClockInDialog from './ClockInDialog.vue'
import dayjs from 'dayjs'
import { Socket } from 'vue-socket.io-extended'

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
  loadingNextShift = false

  mounted() {
    this.loadClockHistory()
    this.loadNextShift()
  }

  // For some fucking reason the view won't rerender when we delete a shift and socket.io pushes the new next shift.
  // This forces the view to rerender when that mutation occurs.
  @Socket('SET_NEXT_SHIFT')
  update() {
    this.$forceUpdate()
  }

  get clock() {
    return this.$store.state.clock
  }

  get clockHistory() {
    return this.$store.getters.clockHistory
  }

  get clockHistoryCurrentWeek() {
    const nextOffset = this.$store.state.clock.events.historyPaginationOffset + 1
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

  get iAmVerified() {
    return this.$store.getters.iAmVerified
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

  openVerifyDialog() {
    this.clockInDialog = true
  }

  async loadClockHistory() {
    this.loadingHistory = true
    try {
      await clock.loadClockHistory(this.$store)
    }
    finally {
      this.loadingHistory = false
    }
  }

  async loadNextShift() {
    this.loadingNextShift = true
    try {
      await clock.loadNextShift(this.$store)
    }
    finally {
      this.loadingNextShift = false
    }
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