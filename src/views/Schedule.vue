<template lang="pug">
v-container.home.d-flex.flex-column.align-stretch.pb-3(
  fluid,
  :fill-height="type == 'month'"
)
  v-toolbar.flex-grow-0(flat, color="transparent")
    v-btn.ma-2(icon, @click="$refs.calendar.prev()")
      v-icon mdi-chevron-left

    v-btn.ma-2(icon, @click="$refs.calendar.next()")
      v-icon mdi-chevron-right

    v-spacer

    v-select.ma-2.flex-grow-0(
      v-model="type",
      :items="types",
      :item-text="(t) => t.charAt(0).toUpperCase() + t.slice(1)",
      dense,
      solo,
      hide-details,
      label="View"
    )

  v-card.soft-shadow.flex-grow-1
    v-fade-transition
      v-overlay(
        v-if="loading && !calendarEvents.length",
        absolute,
        :color="$vuetify.theme.dark ? 'black' : 'white'"
      )
        v-progress-circular(
          indeterminate,
          :color="$vuetify.theme.dark ? 'white' : 'black'"
        )

    v-calendar(
      ref='calendar'
      v-model='value'
      :type='type'
      :events='calendarEvents'
      event-overlap-mode='stack'
      :event-overlap-threshold='30'
      :event-color='getEventColor'
      @change='getEvents'
      @click:event='showEvent'
      @mousedown:event='startDrag'
      @mousedown:time='startTime'
      @mousemove:time='mouseMove'
      @mouseup:time='endDrag'
      @mouseleave.native='cancelDrag'
    )
    v-menu(
      v-model='selectedOpen'
      :close-on-content-click='false'
      :activator='selectedElement'
      offset-x
    )
      v-sheet(min-width='300px' max-width='300px')
        job-preview(:jobId='selectedEvent.job_id')
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { currentUserIs, Managers } from '@/types/Users'
import * as schedule from '@/services/schedule'
import { CalendarEvent } from '@/types/Schedule'
import JobPreview from '@/components/JobPreview.vue'

@Component({
  components: {
    JobPreview
  },
  metaInfo: {
    title: 'Schedule'
  }
})
export default class Schedule extends Vue {
  loading = false
  type = 'month'
  types = ['month', 'week', 'day', '4day']
  value = ''

  selectedEvent = {}
  selectedElement = null
  selectedOpen = false

  pseudoEvents: any = []
  dragTime: any = null
  dragEvent: any = null
  dragStart: any = null
  createEvent: any = null
  createStart: any = null
  extendOriginal: any = null

  get calendarEvents() {
    return [...this.pseudoEvents, ...this.$store.getters.calendarEvents]
  }

  async getEvents({ start, end }: any) {
    this.loading = true
    try {
      await schedule.loadCalendarEvents(
        this.$store,
        new Date(`${start.date}T00:00:00`).toISOString(),
        new Date(`${end.date}T23:59:59`).toISOString()
      )
    } finally {
      this.loading = false
    }
  }

  getEventColor(event: CalendarEvent) {
    return event.color
  }

  showEvent({
    nativeEvent,
    event
  }: {
    nativeEvent: any
    event: CalendarEvent
  }) {
    // nativeEvent is the browser click event, event is the calendar event data
    if (currentUserIs(...Managers)) {
      const open = () => {
        this.selectedEvent = event
        this.selectedElement = nativeEvent.target
        requestAnimationFrame(() =>
          requestAnimationFrame(() => (this.selectedOpen = true))
        )
      }

      if (this.selectedOpen) {
        this.selectedOpen = false
        requestAnimationFrame(() => requestAnimationFrame(() => open()))
      } else {
        open()
      }

      nativeEvent.stopPropagation()
    }
  }

  startDrag({ event, timed }: any) {
    console.log('start drag')
    if (event && timed) {
      this.dragEvent = event
      this.dragTime = null
      this.extendOriginal = null
    }
  }

  startTime(tms: any) {
    const mouse = this.toTime(tms)

    if (this.dragEvent && this.dragTime === null) {
      const start = this.dragEvent.start

      this.dragTime = mouse - start
    } else {
      this.createStart = this.roundTime(mouse)
      this.createEvent = {
        name: `Event #${this.pseudoEvents.length}`,
        color: 'blue',
        start: this.createStart,
        end: this.createStart,
        timed: true
      }

      this.pseudoEvents.push(this.createEvent)
    }
  }

  extendBottom(event: any) {
    this.createEvent = event
    this.createStart = event.start
    this.extendOriginal = event.end
  }

  mouseMove(tms: any) {
    const mouse = this.toTime(tms)

    if (this.dragEvent && this.dragTime !== null) {
      const start = this.dragEvent.start
      const end = this.dragEvent.end
      const duration = end - start
      const newStartTime = mouse - this.dragTime
      const newStart = this.roundTime(newStartTime)
      const newEnd = newStart + duration

      this.dragEvent.start = newStart
      this.dragEvent.end = newEnd
    } else if (this.createEvent && this.createStart !== null) {
      const mouseRounded = this.roundTime(mouse, false)
      const min = Math.min(mouseRounded, this.createStart)
      const max = Math.max(mouseRounded, this.createStart)

      this.createEvent.start = min
      this.createEvent.end = max
    }
  }

  endDrag() {
    this.dragTime = null
    this.dragEvent = null
    this.createEvent = null
    this.createStart = null
    this.extendOriginal = null
  }

  cancelDrag() {
    if (this.createEvent) {
      if (this.extendOriginal) {
        this.createEvent.end = this.extendOriginal
      } else {
        const i = this.pseudoEvents.indexOf(this.createEvent)
        if (i !== -1) {
          this.pseudoEvents.splice(i, 1)
        }
      }
    }

    this.createEvent = null
    this.createStart = null
    this.dragTime = null
    this.dragEvent = null
  }

  roundTime(time: any, down = true) {
    const roundTo = 15 // minutes
    const roundDownTime = roundTo * 60 * 1000

    return down
      ? time - (time % roundDownTime)
      : time + (roundDownTime - (time % roundDownTime))
  }
  toTime(tms: any) {
    return new Date(
      tms.year,
      tms.month - 1,
      tms.day,
      tms.hour,
      tms.minute
    ).getTime()
  }

  rnd(a: any, b: any) {
    return Math.floor((b - a + 1) * Math.random()) + a
  }

  rndElement(arr: any) {
    return arr[this.rnd(0, arr.length - 1)]
  }
}
</script>

<style lang="scss">
#calendar-container {
  width: 100%;
  height: 100%;
}
</style>
