<template lang="pug">
v-container.home(fluid fill-height)
  v-card#calendar-container
    v-calendar(
      ref="calendar",
      v-model="value",
      :weekdays="weekday",
      :type="type",
      :events="calendarEvents",
      :event-overlap-mode="mode",
      :event-overlap-threshold="30",
      :event-color="getEventColor",
      @change="getEvents"
      @click:event="openEvent"
    )
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: "schedule",
  data: () => ({
    type: "month",
    types: ["month", "week", "day", "4day"],
    mode: "stack",
    modes: ["stack", "column"],
    weekday: [1, 2, 3, 4, 5],
    value: "",
    events: [],
    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey darken-1",
    ],
    names: [
      "Meeting",
      "Holiday",
      "PTO",
      "Travel",
      "Event",
      "Birthday",
      "Conference",
      "Party",
    ],
  }),
  mounted() {
    this.$refs.calendar.prev()
  },
  computed: {
    ...mapGetters(['calendarEvents'])
  },
  methods: {
    getEvents({ start, end }) {
      this.$store.dispatch('loadCalendarEvents', {
        start: (new Date(`${start.date}T00:00:00`)).toISOString(),
        end: (new Date(`${end.date}T23:59:59`)).toISOString()
      })
    },
    getEventColor(event) {
      return event.color;
    },
    openEvent({ nativeEvent, event}) {
      // nativeEvent is the browser click event, event is the calendar event data
      this.$router.push({name: 'job', params: {jobId: event.job_id}})
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
  },
};
</script>

<style lang="scss">
  #calendar-container {
    width: 100%;
    height: 100%;
  }
</style>