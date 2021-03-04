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
import {
  CLOCK_IN,
  CLOCK_OUT,
  START_BREAK,
  END_BREAK,
} from "@/definitions/clockActions";

export default {
  name: "clockEvents",
  props: {
    events: Array,
  },
  data: () => ({
    eventMetadata: {
      [CLOCK_IN]: {
        color: "green",
        label: "Clocked in",
      },
      [CLOCK_OUT]: {
        color: "pink",
        label: "Clocked out",
      },
      [START_BREAK]: {
        color: "amber",
        label: "Started break",
      },
      [END_BREAK]: {
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