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
      v-model='colorBy'
      :items='colorByOptions'
      dense
      outlined
      hide-details
      label='Color by'
      @change='updateColorBy'
    )

    v-select.ma-2.flex-grow-0(
      v-model='type'
      :items='types'
      :item-text='(t) => t.charAt(0).toUpperCase() + t.slice(1)'
      dense
      outlined
      hide-details
      label='View'
    )

  v-card.soft-shadow.flex-grow-1
    v-fade-transition
      v-overlay(v-if="loading && !calendarEvents.length" absolute :color='$vuetify.theme.dark ? "black" : "white"')
        v-progress-circular(indeterminate :color='$vuetify.theme.dark ? "white" : "black"')

    v-calendar(
      ref="calendar",
      v-model="value",
      :type="type",
      :events="calendarEvents",
      event-overlap-mode="stack",
      :event-overlap-threshold="30",
      :event-color="getEventColor",
      @change="getEvents",
      @click:event="openEvent"
    )
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { currentUserIs, Managers } from '@/types/Users'
import * as schedule from '@/services/schedule'
import { CalendarEvent } from '@/types/Schedule'
import { loadWorkforce } from '@/services/users'
import { loadJobs } from '@/services/jobs'

@Component({
  metaInfo: {
    title: 'Schedule',
  },
})
export default class Schedule extends Vue {
  loading = false
  type = 'month'
  types = ['month', 'week', 'day', '4day']
  value = ''

  colorBy = 'job'
  colorByOptions = ['job', 'user']

  mounted() {
    const colorBy = localStorage.getItem('colorScheduleBy')
    if (colorBy) {
      this.colorBy = colorBy
    }
  }

  @Watch('colorBy')
  updateColorBy() {
    switch (this.colorBy) {
      case 'job':
        loadJobs(this.$store)
        break
      case 'user':
        loadWorkforce(this.$store)
        break
    }
    localStorage.setItem('colorScheduleBy', this.colorBy)
  }

  get calendarEvents() {
    return this.$store.getters.calendarEvents(this.colorBy)
  }

  async getEvents({ start, end }: any) {
    this.loading = true
    try {
      await schedule.loadCalendarEvents(
        this.$store,
        new Date(`${start.date}T00:00:00`).toISOString(),
        new Date(`${end.date}T23:59:59`).toISOString(),
      )
    } finally {
      this.loading = false
    }
  }

  getEventColor(event: CalendarEvent) {
    return event.color
  }

  openEvent({ /* nativeEvent, */ event }: { event: CalendarEvent }) {
    // nativeEvent is the browser click event, event is the calendar event data
    // TODO: Use hasRole defined in User.ts

    this.$router.push({ name: 'shift', params: { shiftId: event.id.toString() } })
  }
}
</script>

<style lang="scss">
#calendar-container {
  width: 100%;
  height: 100%;
}
</style>
