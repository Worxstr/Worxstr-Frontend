<template lang="pug">
v-container.home.d-flex.flex-column.align-stretch(
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

  v-card.flex-grow-1
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

<script>
import { mapGetters } from "vuex";
import {
  EMPLOYEE_MANAGER,
  ORGANIZATION_MANAGER,
} from "@/definitions/userRoles";

export default {
  name: "schedule",
  metaInfo: {
    title: 'Schedule'
  },
  data: () => ({
    loading: false,
    type: "month",
    types: ["month", "week", "day", "4day"],
    value: "",
  }),
  computed: {
    ...mapGetters(["calendarEvents"]),
  },
  methods: {
    async getEvents({ start, end }) {
      this.loading = true
      await this.$store.dispatch("loadCalendarEvents", {
        start: new Date(`${start.date}T00:00:00`).toISOString(),
        end: new Date(`${end.date}T23:59:59`).toISOString(),
      });
      this.loading = false
    },
    getEventColor(event) {
      return event.color;
    },
    openEvent({ nativeEvent, event }) {
      // nativeEvent is the browser click event, event is the calendar event data

      if (
        this.$store.state.authenticatedUser.roles.some(
          (role) =>
            role.id == EMPLOYEE_MANAGER || role.id == ORGANIZATION_MANAGER
        )
      ) {
        this.$router.push({ name: "job", params: { jobId: event.job_id } });
      }
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