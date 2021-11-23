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
      ref="calendar"
      v-model="value"
      :type="type"
      :events="calendarEvents"
      event-overlap-mode="stack"
      :event-overlap-threshold="30"
      :event-color="getEventColor"
      @change="getEvents"
      @click:event="showEvent"
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
    JobPreview,
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

  get calendarEvents() {
    return this.$store.getters.calendarEvents
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
}
</script>

<style lang="scss">
#calendar-container {
  width: 100%;
  height: 100%;
}
</style>
