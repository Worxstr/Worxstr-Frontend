<template>
  <v-card>
    <v-form>
      <v-toolbar flat>
        <v-btn icon @click="editDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>
          Edit timecard for
          {{ timecard.first_name }}
          {{ timecard.last_name }}
        </v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <time-input required :date="timeIn" label="Time in" />

        <div class="mb-5" v-for="(breakItem, index) in breaks" :key="index">
          <v-row class="align-center">
            <v-col>
              <time-input
                required
                hide-details
                :date="breakItem.start"
                :label="`Break ${index + 1} start`"
              />
            </v-col>
            <v-col>
              <time-input
                required
                hide-details
                :date="breakItem.end"
                :label="`Break ${index + 1} end`"
              />
            </v-col>
            <v-btn icon @click="breaks.splice(index, 1)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-row>
        </div>
        <v-row class="mb-5">
          <v-spacer />
          <v-btn text dense color="primary" @click="breaks.push({})">
            <v-icon>mdi-plus</v-icon>
            Add break
          </v-btn>
        </v-row>

        <time-input required :date="timeOut" label="Time out" />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="editDialog = false">Cancel</v-btn>
        <v-btn text color="primary">Save</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import TimeInput from "@/components/TimeInput.vue";
// import { CLOCK_IN, CLOCK_OUT, START_BREAK, END_BREAK } from "../../definitions/clockActions"

dayjs.extend(duration);

function localeTimeString(date) {
  return new Date(date); //.toLocaleTimeString([], { hour12: false})
}
function localeToUTC(localeTime) {
  const [hour, minute, second] = localeTime.split(":");

  return new Date().toTimeString([], { hour12: false });
}

export default {
  components: { TimeInput },
  name: "approvals",
  data: () => ({
    timeIn: null,
    timeOut: null,
    breaks: [],
  }),
  props: ["timecard"],
  mounted() {
    const events = this.timecard.time_clocks;
    this.timeIn = events[0].time;
    this.timeOut = events[events.length - 1].time;

    const breakEvents = events.slice(1, events.length - 1),
      breaks = [];

    for (let i = 0; i < breakEvents.length; i += 2) {
      breaks.push({
        start: breakEvents[i].time,
        end: breakEvents[i + 1].time,
      });
    }

    console.log(breaks);

    this.breaks = breaks;
  },
  methods: {
    timeDiff(timeIn, timeOut) {
      timeIn = dayjs(timeIn);
      timeOut = dayjs(timeOut);

      const duration = dayjs.duration(timeOut.diff(timeIn)),
        hours = duration.format("H"),
        minutes = duration.format("m");

      return `${hours} hour${hours == 1 ? "" : "s"}, ${minutes} minute${
        minutes == 1 ? "" : "s"
      }`;
    },
  },
};
</script>