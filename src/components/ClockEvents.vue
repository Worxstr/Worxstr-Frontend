<template lang="pug">
v-timeline(align-top, dense)
  transition-group(name="scroll-y-transition")
    div(v-for="event in eventsWithDateLabels", :key="event.id || event.label")
      v-timeline-item(v-if="event.label", hide-dot)
        span {{ event.label | date('dddd, MMM D') }}

      v-timeline-item(v-else, :color="eventMetadata[event.action].color", small)
        v-row.pt-1
          v-col(cols="3")
            strong {{ event.time | time }}

          v-col
            strong {{ eventMetadata[event.action].label }}
            .caption {{ event.description }}
</template>

<script>
import { ClockAction } from "@/types/Clock";

export default {
  name: "clockEvents",
  props: {
    events: Array,
  },
  data: () => ({
    eventMetadata: {
      [ClockAction.ClockIn]: {
        color: "green",
        label: "Clocked in",
      },
      [ClockAction.ClockOut]: {
        color: "pink",
        label: "Clocked out",
      },
      [ClockAction.StartBreak]: {
        color: "amber",
        label: "Started break",
      },
      [ClockAction.EndBreak]: {
        color: "green",
        label: "Ended break",
      },
    },
  }),
  computed: {
		// Insert label objects with date before each group of events by date
    eventsWithDateLabels() {
      let last;
      return this.events.flatMap((event, i) => {
        const current = new Date(event.time);
        const ret = [];

        if (
          !last ||
          !(
            last.getDate() === current.getDate() &&
            last.getMonth() === current.getMonth() &&
            last.getFullYear() === current.getFullYear()
          )
        ) {
          ret.push({
            label: current,
            id: `day-${i}`,
          });
        }
        ret.push(event);
        last = current;
        return ret;
      });
    },
  },
};
</script>